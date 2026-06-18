import os from 'node:os';
import path from 'node:path';
import Store from 'electron-store';
import type { AppSettings, HistoryRecord } from '../shared/types';

interface AppStore {
  settings: AppSettings;
  history: HistoryRecord[];
}

const defaultSettings: AppSettings = {
  language: 'zh-CN',
  downloadDir: path.join(os.homedir(), 'Downloads'),
  namingRule: '{videoName}.{lang}.{format}',
  parserMode: 'thunder',
  thunderApiBase: '',
  requestTimeoutMs: 10000,
  requestRetry: 2,
  requestConcurrency: 3
};

const store = new Store<AppStore>({
  name: 'thunder-subtitle-downloader',
  defaults: {
    settings: defaultSettings,
    history: []
  }
});

export const storeService = {
  getSettings(): AppSettings {
    return store.get('settings');
  },
  updateSettings(patch: Partial<AppSettings>): AppSettings {
    const next = { ...store.get('settings'), ...patch };
    store.set('settings', next);
    return next;
  },
  listHistory(): HistoryRecord[] {
    return store.get('history');
  },
  appendHistory(record: HistoryRecord): void {
    const history = [record, ...store.get('history')];
    store.set('history', history.slice(0, 1000));
  }
};
