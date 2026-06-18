import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  const send = (channel: string, data?: unknown) => {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send(channel, data);
  };

  autoUpdater.on('checking-for-update', () => {
    send('update:checking');
  });

  autoUpdater.on('update-available', (info) => {
    send('update:available', info);
  });

  autoUpdater.on('update-not-available', () => {
    send('update:not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    send('update:download-progress', {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total
    });
  });

  autoUpdater.on('update-downloaded', () => {
    send('update:downloaded');
  });

  autoUpdater.on('error', (err) => {
    send('update:error', err.message);
  });

  // Check for updates in production only
  if (!process.env.ELECTRON_RENDERER_URL) {
    // Delay check to avoid slowing down app startup
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(() => {
        // Silently ignore check errors (e.g. no network)
      });
    }, 5000);
  }
}

export function checkForUpdates(): void {
  autoUpdater.checkForUpdates().catch(() => {
    // Silently ignore
  });
}

export function downloadUpdate(): void {
  autoUpdater.downloadUpdate().catch(() => {
    // Silently ignore
  });
}

export function quitAndInstall(): void {
  setImmediate(() => {
    autoUpdater.quitAndInstall(true, true);
  });
}
