import type { ParseResult } from '../../shared/types';

export interface SubtitleParserAdapter {
  name: string;
  parse(videoPath: string): Promise<ParseResult>;
}

