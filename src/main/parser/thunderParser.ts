import path from 'node:path';
import { createHash } from 'node:crypto';
import { open, stat } from 'node:fs/promises';
import type { ParseResult, SubtitleItem, SubtitleFormat } from '../../shared/types';
import { HttpClient } from '../network/httpClient';
import type { SubtitleParserAdapter } from './adapter';

interface XunleiRawSubtitle {
  gcid: string;
  cid: string;
  url: string;
  ext: string;
  name: string;
  duration: number;
  languages: string[];
  source: number;
  score: number;
}

interface XunleiApiResponse {
  code: number;
  data: XunleiRawSubtitle[];
  msg?: string;
}

export async function calculateCid(filePath: string): Promise<string> {
  const sha1 = createHash('sha1');
  const fileStat = await stat(filePath);
  const size = fileStat.size;

  const file = await open(filePath, 'r');
  try {
    if (size < 0xF000) {
      const buffer = Buffer.alloc(size);
      await file.read(buffer, 0, size, 0);
      sha1.update(buffer);
    } else {
      // First chunk: 0x5000 bytes from start
      const buf1 = Buffer.alloc(0x5000);
      await file.read(buf1, 0, 0x5000, 0);
      sha1.update(buf1);

      // Second chunk: 0x5000 bytes from size / 3
      const buf2 = Buffer.alloc(0x5000);
      const pos2 = Math.floor(size / 3);
      await file.read(buf2, 0, 0x5000, pos2);
      sha1.update(buf2);

      // Third chunk: 0x5000 bytes from size - 0x5000
      const buf3 = Buffer.alloc(0x5000);
      const pos3 = size - 0x5000;
      await file.read(buf3, 0, 0x5000, pos3);
      sha1.update(buf3);
    }
    return sha1.digest('hex').toUpperCase();
  } finally {
    await file.close();
  }
}

export async function calculateGcid(filePath: string): Promise<string> {
  const sha1 = createHash('sha1');
  const fileStat = await stat(filePath);
  const size = fileStat.size;

  let psize = 0x40000; // 256KB
  while (size / psize > 0x200 && psize < 0x200000) {
    psize = psize << 1;
  }

  const file = await open(filePath, 'r');
  try {
    let position = 0;
    const buffer = Buffer.alloc(psize);

    while (position < size) {
      const bytesToRead = Math.min(psize, size - position);
      const { bytesRead } = await file.read(buffer, 0, bytesToRead, position);
      if (bytesRead === 0) break;

      const chunkHash = createHash('sha1').update(buffer.subarray(0, bytesRead)).digest();
      sha1.update(chunkHash);

      position += bytesRead;
    }

    return sha1.digest('hex').toUpperCase();
  } finally {
    await file.close();
  }
}

export async function getMp4Duration(filePath: string): Promise<number> {
  const file = await open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(1024 * 1024); // read first 1MB
    const { bytesRead } = await file.read(buffer, 0, buffer.length, 0);

    const mvhdOffset = buffer.indexOf('mvhd');
    if (mvhdOffset !== -1 && mvhdOffset + 24 < bytesRead) {
      const version = buffer[mvhdOffset + 4];
      let timescale = 0;
      let duration = 0;
      if (version === 1) {
        timescale = buffer.readUInt32BE(mvhdOffset + 20);
        duration = Number(buffer.readBigUInt64BE(mvhdOffset + 24));
      } else {
        timescale = buffer.readUInt32BE(mvhdOffset + 12);
        duration = buffer.readUInt32BE(mvhdOffset + 16);
      }
      if (timescale > 0) {
        return Math.round(duration / timescale);
      }
    }
  } catch (e) {
    // fallback
  } finally {
    await file.close();
  }
  return 0;
}

export const DEFAULT_THUNDER_API_BASE = 'http://api-shoulei-ssl.xunlei.com/oracle/subtitle';

export class ThunderParser implements SubtitleParserAdapter {
  name = 'thunder';

  constructor(
    private readonly apiBase: string,
    private readonly httpClient: HttpClient
  ) {}

  async parse(videoPath: string): Promise<ParseResult> {
    const fileName = path.basename(videoPath);
    const ext = path.extname(videoPath).toLowerCase();

    // 1. Calculate CID
    const cid = await calculateCid(videoPath);

    // 2. Calculate GCID
    const gcid = await calculateGcid(videoPath);

    // 3. Estimate duration
    let duration = 0;
    if (ext === '.mp4') {
      duration = await getMp4Duration(videoPath);
    }

    // 4. Build API URL
    let baseUrl = this.apiBase ? this.apiBase.trim() : DEFAULT_THUNDER_API_BASE;
    if (baseUrl.endsWith('/oracle')) {
      baseUrl = `${baseUrl}/subtitle`;
    }

    const queryUrl = `${baseUrl}?name=${encodeURIComponent(fileName)}&cid=${cid}&gcid=${gcid}&duration=${duration}`;

    // 5. Send GET Request
    const response = await this.httpClient.getJson<XunleiApiResponse>(queryUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (response.code !== 0 && response.code !== undefined) {
      throw new Error(`Xunlei API error ${response.code}: ${response.msg ?? 'unknown'}`);
    }

    const rawList = response.data ?? [];
    const subtitles: SubtitleItem[] = rawList
      .filter((item) => {
        const subExt = (item.ext || '').toLowerCase();
        return ['srt', 'ass', 'vtt'].includes(subExt);
      })
      .map((item, index) => {
        const subExt = (item.ext || '').toLowerCase();
        const format = subExt as SubtitleFormat;

        // Clean up and map languages
        let langs: string[] = [];
        if (item.languages && item.languages.length > 0) {
          langs = item.languages
            .map((lang) => {
              const trimmed = lang.trim();
              const isNotLanguage = (str: string): boolean => {
                const s = str.toLowerCase();
                return (
                  s.includes('h264') ||
                  s.includes('x264') ||
                  s.includes('h265') ||
                  s.includes('x265') ||
                  /^\d+p$/.test(s) ||
                  s.includes('web-dl') ||
                  s.includes('webrip') ||
                  s.includes('bluray') ||
                  s.includes('1080p') ||
                  s.includes('720p') ||
                  s.includes('nf') ||
                  s.includes('ng')
                );
              };

              if (!trimmed || trimmed === '未知语言' || isNotLanguage(trimmed)) {
                // Try to detect language from subtitle filename
                const subNameLower = (item.name || '').toLowerCase();
                if (
                  subNameLower.includes('cn&en') ||
                  subNameLower.includes('zh&en') ||
                  subNameLower.includes('双语') ||
                  subNameLower.includes('双字')
                ) {
                  return '中英双语';
                }
                if (
                  subNameLower.includes('zh-hans') ||
                  subNameLower.includes('gb') ||
                  subNameLower.includes('chs') ||
                  subNameLower.includes('简体') ||
                  subNameLower.includes('.sc.') ||
                  subNameLower.includes('.zh.')
                ) {
                  return '简体中文';
                }
                if (
                  subNameLower.includes('zh-hant') ||
                  subNameLower.includes('big5') ||
                  subNameLower.includes('cht') ||
                  subNameLower.includes('繁体') ||
                  subNameLower.includes('.tc.')
                ) {
                  return '繁体中文';
                }
                if (
                  subNameLower.includes('eng') ||
                  subNameLower.includes('english') ||
                  subNameLower.includes('.en.')
                ) {
                  return 'English';
                }
                return '';
              }

              // Map "简体"/"繁体"
              if (trimmed === '简体') return '简体中文';
              if (trimmed === '繁体') return '繁体中文';

              // Strip 3-letter lowercase prefix if followed by an uppercase letter (e.g. turTurkish -> Turkish)
              const cleaned = trimmed.replace(/^[a-z]{3}([A-Z])/, '$1');
              if (cleaned === 'Brazilian Portugu') {
                return 'Brazilian Portuguese';
              }
              return cleaned;
            })
            .filter((l) => l !== '');
        }

        // Additional filename-based backup check if langs is empty
        if (langs.length === 0) {
          const subNameLower = (item.name || '').toLowerCase();
          if (
            subNameLower.includes('cn&en') ||
            subNameLower.includes('zh&en') ||
            subNameLower.includes('双语') ||
            subNameLower.includes('双字')
          ) {
            langs.push('中英双语');
          } else if (
            subNameLower.includes('zh-hans') ||
            subNameLower.includes('gb') ||
            subNameLower.includes('chs') ||
            subNameLower.includes('简体') ||
            subNameLower.includes('.sc.') ||
            subNameLower.includes('.zh.')
          ) {
            langs.push('简体中文');
          } else if (
            subNameLower.includes('zh-hant') ||
            subNameLower.includes('big5') ||
            subNameLower.includes('cht') ||
            subNameLower.includes('繁体') ||
            subNameLower.includes('.tc.')
          ) {
            langs.push('繁体中文');
          } else if (
            subNameLower.includes('eng') ||
            subNameLower.includes('english') ||
            subNameLower.includes('.en.')
          ) {
            langs.push('English');
          }
        }

        // Final fallback if all languages are empty or undefined
        const languageLabel = langs.length > 0 ? Array.from(new Set(langs)).join(', ') : '其它 / Unknown';

        return {
          id: `${item.cid || cid}-${index}`,
          language: languageLabel,
          format,
          downloadUrl: item.url,
          score: item.score,
          name: item.name,
          star: item.star && item.star !== '0' ? item.star : undefined
        };
      });

    return { videoPath, subtitles };
  }
}

