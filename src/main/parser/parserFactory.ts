import type { AppSettings } from '../../shared/types';
import { HttpClient } from '../network/httpClient';
import { MockParser } from './mockParser';
import { ThunderParser } from './thunderParser';
import type { SubtitleParserAdapter } from './adapter';

export function createParser(settings: AppSettings): SubtitleParserAdapter {
  const httpClient = new HttpClient({
    timeoutMs: settings.requestTimeoutMs,
    retry: settings.requestRetry,
    concurrency: settings.requestConcurrency
  });

  if (settings.parserMode === 'thunder') {
    return new ThunderParser(settings.thunderApiBase ?? '', httpClient);
  }
  return new MockParser();
}

