import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings, DownloadTask, ParseResult, SubtitleItem } from '../shared/types';

const api = {
  openVideo: (): Promise<string | null> => ipcRenderer.invoke('dialog:openVideo'),
  openDirectory: (): Promise<string | null> => ipcRenderer.invoke('dialog:openDirectory'),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
  updateSettings: (patch: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:update', patch),
  getThunderApiUrl: (): Promise<string> => ipcRenderer.invoke('settings:getThunderApiUrl'),
  clearAllData: (): Promise<AppSettings> => ipcRenderer.invoke('settings:clearAll'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),
  listHistory: () => ipcRenderer.invoke('history:list'),
  parseSubtitles: (videoPath: string): Promise<ParseResult> => ipcRenderer.invoke('subtitle:parse', videoPath),
  createTask: (payload: { videoPath: string; subtitle: SubtitleItem }): Promise<DownloadTask> =>
    ipcRenderer.invoke('task:create', payload),
  removeTask: (videoPath: string, subtitleId: string): Promise<boolean> =>
    ipcRenderer.invoke('task:remove', videoPath, subtitleId),
  openSubtitleSaveFolder: (savePath: string): Promise<boolean> => ipcRenderer.invoke('subtitle:openSaveFolder', savePath),
  listTasks: (): Promise<DownloadTask[]> => ipcRenderer.invoke('task:list'),
  onTaskUpdate: (handler: (tasks: DownloadTask[]) => void) => {
    const listener = (_event: unknown, tasks: DownloadTask[]) => handler(tasks);
    ipcRenderer.on('task:update', listener);
    return () => ipcRenderer.removeListener('task:update', listener);
  },

  // --- Window controls ---
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
  onMaximizeChange: (handler: (maximized: boolean) => void) => {
    const listener = (_event: unknown, maximized: boolean) => handler(maximized);
    ipcRenderer.on('window:maximizeChange', listener);
    return () => ipcRenderer.removeListener('window:maximizeChange', listener);
  },

  // --- Auto-update ---
  checkForUpdates: (): Promise<void> => ipcRenderer.invoke('update:check'),
  downloadUpdate: (): Promise<void> => ipcRenderer.invoke('update:download'),
  quitAndInstall: (): Promise<void> => ipcRenderer.invoke('update:install'),
  onUpdateChecking: (handler: () => void) => {
    const listener = () => handler();
    ipcRenderer.on('update:checking', listener);
    return () => ipcRenderer.removeListener('update:checking', listener);
  },
  onUpdateAvailable: (handler: (info: { version: string; releaseNotes?: string }) => void) => {
    const listener = (_event: unknown, info: { version: string; releaseNotes?: string }) => handler(info);
    ipcRenderer.on('update:available', listener);
    return () => ipcRenderer.removeListener('update:available', listener);
  },
  onUpdateNotAvailable: (handler: () => void) => {
    const listener = () => handler();
    ipcRenderer.on('update:not-available', listener);
    return () => ipcRenderer.removeListener('update:not-available', listener);
  },
  onUpdateDownloadProgress: (handler: (progress: { percent: number }) => void) => {
    const listener = (_event: unknown, progress: { percent: number }) => handler(progress);
    ipcRenderer.on('update:download-progress', listener);
    return () => ipcRenderer.removeListener('update:download-progress', listener);
  },
  onUpdateDownloaded: (handler: () => void) => {
    const listener = () => handler();
    ipcRenderer.on('update:downloaded', listener);
    return () => ipcRenderer.removeListener('update:downloaded', listener);
  },
  onUpdateError: (handler: (message: string) => void) => {
    const listener = (_event: unknown, message: string) => handler(message);
    ipcRenderer.on('update:error', listener);
    return () => ipcRenderer.removeListener('update:error', listener);
  }
};

contextBridge.exposeInMainWorld('api', api);
