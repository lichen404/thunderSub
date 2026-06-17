import path from 'node:path';
import type { ParseResult, SubtitleItem } from '../../shared/types';
import { HttpClient } from '../network/httpClient';
import type { SubtitleParserAdapter } from './adapter';

interface ThunderSubtitleResponse {
  subtitles: Array<{
    id: string;
    language: string;
    format: string;
    url: string;
    score?: number;
  }>;
}

export class ThunderParser implements SubtitleParserAdapter {
  name = 'thunder';

  constructor(
    private readonly apiBase: string,
    private readonly httpClient: HttpClient
  ) {}

  async parse(videoPath: string): Promise<ParseResult> {
    if (!this.apiBase) {
      throw new Error('Thunder API base URL is empty');
    }

    const payload = {
      videoPath,
      fileName: path.basename(videoPath)
    };

    const response = await this.httpClient.getJson<ThunderSubtitleResponse>(
      `${this.apiBase}/subtitle/resolve`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const subtitles: SubtitleItem[] = response.subtitles.map((item) => ({
      id: item.id,
      language: item.language,
      format: (item.format.toLowerCase() || 'srt') as SubtitleItem['format'],
      downloadUrl: item.url,
      score: item.score
    }));

    return { videoPath, subtitles };
  }
}

