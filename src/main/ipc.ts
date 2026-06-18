import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import type { DownloadTask, SubtitleItem } from '../shared/types';
import { HttpClient } from './network/httpClient';
import { createParser } from './parser/parserFactory';
import { DEFAULT_THUNDER_API_BASE } from './parser/thunderParser';
import { storeService } from './store';
import { DownloadQueue } from './tasks/downloadQueue';

function buildSavePath(videoPath: string, subtitle: SubtitleItem): string {
  const settings = storeService.getSettings();
  const videoName = path.parse(videoPath).name;
  const filename = settings.namingRule
    .replace('{videoName}', videoName)
    .replace('{lang}', subtitle.language)
    .replace('{format}', subtitle.format);
  return path.join(settings.downloadDir, filename);
}

export function registerIpc(mainWindow: BrowserWindow): void {
  const queue = new DownloadQueue(
    new HttpClient({
      timeoutMs: storeService.getSettings().requestTimeoutMs,
      retry: storeService.getSettings().requestRetry,
      concurrency: storeService.getSettings().requestConcurrency
    }),
    2
  );
  const historyRecorded = new Set<string>();

  queue.on('update', (tasks: DownloadTask[]) => {
    mainWindow.webContents.send('task:update', tasks);
    tasks.forEach((task) => {
      if ((task.status === 'success' || task.status === 'failed') && !historyRecorded.has(task.id)) {
        historyRecorded.add(task.id);
        storeService.appendHistory({
          id: randomUUID(),
          videoPath: task.videoPath,
          subtitleId: task.subtitle.id,
          savePath: task.savePath,
          status: task.status === 'success' ? 'success' : 'failed',
          error: task.error,
          createdAt: task.updatedAt
        });
      }
    });
  });

  ipcMain.handle('dialog:openVideo', async () => {
    const response = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Videos', extensions: ['mp4', 'mkv', 'avi', 'mov'] }]
    });
    return response.canceled ? null : response.filePaths[0];
  });

  ipcMain.handle('dialog:openDirectory', async () => {
    const response = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    return response.canceled ? null : response.filePaths[0];
  });

  ipcMain.handle('settings:get', () => storeService.getSettings());
  ipcMain.handle('settings:update', (_event, patch) => storeService.updateSettings(patch));
  ipcMain.handle('settings:getThunderApiUrl', () => {
    const settings = storeService.getSettings();
    const apiBase = settings.thunderApiBase?.trim();
    let url = apiBase || DEFAULT_THUNDER_API_BASE;
    if (url.endsWith('/oracle')) {
      url = `${url}/subtitle`;
    }
    return url;
  });
  ipcMain.handle('history:list', () => storeService.listHistory());
  ipcMain.handle('settings:clearAll', () => storeService.clearAll());
  ipcMain.handle('task:list', () => queue.list());

  ipcMain.handle('subtitle:parse', async (_event, videoPath: string) => {
    const parser = createParser(storeService.getSettings());
    return parser.parse(videoPath);
  });

  ipcMain.handle('task:create', (_event, payload: { videoPath: string; subtitle: SubtitleItem }) => {
    return queue.add({
      videoPath: payload.videoPath,
      subtitle: payload.subtitle,
      savePath: buildSavePath(payload.videoPath, payload.subtitle)
    });
  });

  ipcMain.handle('task:remove', (_event, videoPath: string, subtitleId: string) => {
    return queue.remove(videoPath, subtitleId);
  });

  ipcMain.handle('subtitle:openSaveFolder', async (_event, savePath: string) => {
    await access(savePath, constants.F_OK);
    await shell.showItemInFolder(savePath);
    return true;
  });
}
