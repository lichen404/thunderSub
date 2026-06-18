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
  }
};

contextBridge.exposeInMainWorld('api', api);
