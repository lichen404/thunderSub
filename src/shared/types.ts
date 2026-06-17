export type AppLanguage = 'zh-CN' | 'en-US';
export type SubtitleFormat = 'srt' | 'ass' | 'vtt';
export type ParserMode = 'mock' | 'thunder';
export type TaskStatus = 'pending' | 'running' | 'success' | 'failed';

export interface SubtitleItem {
  id: string;
  language: string;
  format: SubtitleFormat;
  downloadUrl: string;
  score?: number;
  name?: string;
  star?: string;
}

export interface ParseResult {
  videoPath: string;
  subtitles: SubtitleItem[];
}

export interface DownloadTask {
  id: string;
  videoPath: string;
  subtitle: SubtitleItem;
  savePath: string;
  status: TaskStatus;
  progress: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryRecord {
  id: string;
  videoPath: string;
  subtitleId: string;
  savePath: string;
  status: 'success' | 'failed';
  error?: string;
  createdAt: string;
}

export interface AppSettings {
  language: AppLanguage;
  downloadDir: string;
  namingRule: string;
  parserMode: ParserMode;
  thunderApiBase?: string;
  requestTimeoutMs: number;
  requestRetry: number;
  requestConcurrency: number;
}

