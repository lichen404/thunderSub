import { autoUpdater } from 'electron-updater';
import { BrowserWindow, app } from 'electron';

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.forceDevUpdateConfig = true;

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

  const isDev = !!process.env.ELECTRON_RENDERER_URL;

  if (isDev) {
    console.log('[updater] Dev mode — skipping auto-update check on startup.');
    console.log('[updater] Current version:', app.getVersion());
    console.log('[updater] Call window.api.checkForUpdates() manually to test.');
  } else {
    // Production: auto-check after startup
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
