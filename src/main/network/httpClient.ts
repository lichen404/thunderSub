import pLimit from 'p-limit';
import { logger } from '../logger';

export interface HttpClientOptions {
  timeoutMs: number;
  retry: number;
  concurrency: number;
}

export class HttpClient {
  private readonly limit;
  private readonly options: HttpClientOptions;

  constructor(options: HttpClientOptions) {
    this.options = options;
    this.limit = pLimit(Math.max(1, options.concurrency));
  }

  async getJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await this.request(url, init);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} when requesting ${url}`);
    }
    return (await response.json()) as T;
  }

  async request(url: string, init?: RequestInit): Promise<Response> {
    return this.limit(async () => {
      let lastError: Error | undefined;
      for (let attempt = 0; attempt <= this.options.retry; attempt += 1) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.options.timeoutMs);
        try {
          const response = await fetch(url, { ...init, signal: controller.signal });
          clearTimeout(timer);
          if (response.status >= 500 && attempt < this.options.retry) {
            logger.warn(`Retrying request due to server error`, { url, status: response.status, attempt });
            continue;
          }
          return response;
        } catch (error) {
          clearTimeout(timer);
          lastError = error as Error;
          if (attempt < this.options.retry) {
            logger.warn(`Retrying request due to network error`, {
              url,
              attempt,
              error: lastError.message
            });
            continue;
          }
        }
      }
      throw new Error(`Request failed for ${url}: ${lastError?.message ?? 'unknown error'}`);
    });
  }
}

