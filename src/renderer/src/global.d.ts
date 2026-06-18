import type { AppSettings, DownloadTask, HistoryRecord, ParseResult, SubtitleItem } from '../../../shared/types';

declare global {
  interface Window {
    api: {
      openVideo: () => Promise<string | null>;
      openDirectory: () => Promise<string | null>;
      getSettings: () => Promise<AppSettings>;
      updateSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>;
      listHistory: () => Promise<HistoryRecord[]>;
      parseSubtitles: (videoPath: string) => Promise<ParseResult>;
      createTask: (payload: { videoPath: string; subtitle: SubtitleItem }) => Promise<DownloadTask>;
      openSubtitleSaveFolder: (savePath: string) => Promise<boolean>;
      listTasks: () => Promise<DownloadTask[]>;
      onTaskUpdate: (handler: (tasks: DownloadTask[]) => void) => () => void;
    };
  }
}

export {};
