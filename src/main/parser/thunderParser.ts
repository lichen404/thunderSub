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
    let baseUrl = this.apiBase ? this.apiBase.trim() : 'http://api-shoulei-ssl.xunlei.com/oracle/subtitle';
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
    const subtitles: SubtitleItem[] = rawList.map((item, index) => {
      const subExt = (item.ext || 'srt').toLowerCase();
      const format: SubtitleFormat = (['srt', 'ass', 'vtt'].includes(subExt) ? subExt : 'srt') as SubtitleFormat;

      return {
        id: `${item.cid || cid}-${index}`,
        language: item.languages && item.languages.length > 0 ? item.languages.join(', ') : '中文/Other',
        format,
        downloadUrl: item.url,
        score: item.score
      };
    });

    return { videoPath, subtitles };
  }
}

