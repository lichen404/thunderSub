import type { AppSettings, DownloadTask, HistoryRecord, ParseResult, SubtitleItem } from '../../../shared/types';

declare global {
  interface Window {
    api: {
      openVideo: () => Promise<string | null>;
      openDirectory: () => Promise<string | null>;
      getSettings: () => Promise<AppSettings>;
      updateSettings: (patch: Partial<AppSettings>) => Promise<AppSettings>;
      getThunderApiUrl: () => Promise<string>;
      clearAllData: () => Promise<AppSettings>;
      listHistory: () => Promise<HistoryRecord[]>;
      parseSubtitles: (videoPath: string) => Promise<ParseResult>;
      createTask: (payload: { videoPath: string; subtitle: SubtitleItem }) => Promise<DownloadTask>;
      removeTask: (videoPath: string, subtitleId: string) => Promise<boolean>;
      openSubtitleSaveFolder: (savePath: string) => Promise<boolean>;
      listTasks: () => Promise<DownloadTask[]>;
      onTaskUpdate: (handler: (tasks: DownloadTask[]) => void) => () => void;

      // --- Window controls ---
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      onMaximizeChange: (handler: (maximized: boolean) => void) => () => void;
    };
  }
}

export {};
