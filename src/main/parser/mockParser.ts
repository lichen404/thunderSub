import type { ParseResult } from '../../shared/types';
import type { SubtitleParserAdapter } from './adapter';

export class MockParser implements SubtitleParserAdapter {
  name = 'mock';

  async parse(videoPath: string): Promise<ParseResult> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return {
      videoPath,
      subtitles: [
        {
          id: 'mock-zh-srt',
          language: 'zh-CN',
          format: 'srt',
          downloadUrl: 'https://raw.githubusercontent.com/andreyvit/subtitle-tools/master/sample.srt'
        },
        {
          id: 'mock-en-vtt',
          language: 'en-US',
          format: 'vtt',
          downloadUrl: 'https://raw.githubusercontent.com/mozilla/vtt.js/master/test/fixtures/basic.vtt'
        }
      ]
    };
  }
}

