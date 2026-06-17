import { useEffect, useMemo, useState } from 'react';
import type { AppLanguage, AppSettings, DownloadTask, HistoryRecord, SubtitleItem } from '../../shared/types';
import { t } from './i18n';
import './styles.css';

function getFileName(fullPath: string): string {
  const windowsPath = fullPath.split('\\');
  return windowsPath[windowsPath.length - 1] || fullPath;
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [videoPath, setVideoPath] = useState('');
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      const [initialSettings, initialHistory, initialTasks] = await Promise.all([
        window.api.getSettings(),
        window.api.listHistory(),
        window.api.listTasks()
      ]);
      setSettings(initialSettings);
      setHistory(initialHistory);
      setTasks(initialTasks);
    })();

    const off = window.api.onTaskUpdate((nextTasks) => {
      setTasks(nextTasks);
      void window.api.listHistory().then((nextHistory) => setHistory(nextHistory));
    });
    return off;
  }, []);

  const language: AppLanguage = settings?.language ?? 'zh-CN';
  const text = useMemo(() => (key: Parameters<typeof t>[1]) => t(language, key), [language]);

  const pickVideo = async () => {
    const selected = await window.api.openVideo();
    if (selected) {
      setVideoPath(selected);
      setSubtitles([]);
      setError('');
    }
  };

  const parseSubtitles = async () => {
    if (!videoPath) return;
    setError('');
    try {
      const result = await window.api.parseSubtitles(videoPath);
      setSubtitles(result.subtitles);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const downloadSubtitle = async (subtitle: SubtitleItem) => {
    setError('');
    try {
      await window.api.createTask({ videoPath, subtitle });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const chooseDirectory = async () => {
    if (!settings) return;
    const folder = await window.api.openDirectory();
    if (!folder) return;
    setSettings(await window.api.updateSettings({ downloadDir: folder }));
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSettings(await window.api.updateSettings(settings));
  };

  if (!settings) return null;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{text('appTitle')}</h1>
          <p>{text('appSubtitle')}</p>
        </div>
      </header>

      <div className="layout">
        <section className="card">
          <div className="card-title-row">
            <h2>{text('addVideo')}</h2>
            <button className="primary-btn" onClick={pickVideo}>
              {text('addVideo')}
            </button>
          </div>

          <div className="field">
            <label>{text('selectedVideo')}</label>
            <div className="row">
              <input value={videoPath} placeholder="-" readOnly />
              <button onClick={parseSubtitles} disabled={!videoPath}>
                {text('parse')}
              </button>
            </div>
          </div>

          <div className="field">
            <label>{text('subtitles')}</label>
            <div className="list">
              {subtitles.length === 0 && <div className="muted">{text('noSubtitles')}</div>}
              {subtitles.map((item) => (
                <div className="list-item" key={item.id}>
                  <div>
                    <strong>{item.language}</strong>
                    <span>{item.format.toUpperCase()}</span>
                  </div>
                  <button onClick={() => downloadSubtitle(item)}>{text('download')}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>
              {text('status')} / {text('progress')}
            </label>
            <div className="list">
              {tasks.length === 0 && <div className="muted">-</div>}
              {tasks.slice(0, 5).map((task) => (
                <div className="task-item" key={task.id}>
                  <div className="task-main">
                    <strong>{getFileName(task.videoPath)}</strong>
                    <span>
                      {task.status} · {task.progress}%
                    </span>
                  </div>
                  {task.error && <small>{task.error}</small>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <h2>{text('downloadHistory')}</h2>
          <div className="history-table">
            <div className="history-head">
              <span>{text('time')}</span>
              <span>{text('file')}</span>
              <span>{text('status')}</span>
              <span>{text('savePath')}</span>
            </div>
            {history.length === 0 && <div className="muted">{text('noHistory')}</div>}
            {history.map((item) => (
              <div className="history-row" key={item.id}>
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <span>{getFileName(item.videoPath)}</span>
                <span className={item.status === 'success' ? 'ok' : 'bad'}>{item.status}</span>
                <span title={item.savePath}>{item.savePath}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>{text('settings')}</h2>
          <div className="field">
            <label>{text('uiLanguage')}</label>
            <select
              value={settings.language}
              onChange={async (event) =>
                setSettings(
                  await window.api.updateSettings({
                    language: event.target.value as AppLanguage
                  })
                )
              }
            >
              <option value="zh-CN">中文</option>
              <option value="en-US">English</option>
            </select>
          </div>

          <div className="field">
            <label>{text('downloadDir')}</label>
            <div className="row">
              <input value={settings.downloadDir} readOnly />
              <button onClick={chooseDirectory}>{text('chooseDir')}</button>
            </div>
          </div>

          <div className="field">
            <label>{text('namingRule')}</label>
            <input
              value={settings.namingRule}
              onChange={(event) => setSettings({ ...settings, namingRule: event.target.value })}
            />
          </div>

          <div className="field">
            <label>{text('parser')}</label>
            <select
              value={settings.parserMode}
              onChange={(event) =>
                setSettings({ ...settings, parserMode: event.target.value as AppSettings['parserMode'] })
              }
            >
              <option value="mock">mock</option>
              <option value="thunder">thunder</option>
            </select>
          </div>

          <div className="field">
            <label>{text('apiBase')}</label>
            <input
              value={settings.thunderApiBase ?? ''}
              onChange={(event) => setSettings({ ...settings, thunderApiBase: event.target.value })}
            />
          </div>

          <div className="inline-3">
            <div className="field">
              <label>{text('timeout')}</label>
              <input
                type="number"
                value={settings.requestTimeoutMs}
                onChange={(event) =>
                  setSettings({ ...settings, requestTimeoutMs: Number(event.target.value) || 10000 })
                }
              />
            </div>
            <div className="field">
              <label>{text('retry')}</label>
              <input
                type="number"
                value={settings.requestRetry}
                onChange={(event) => setSettings({ ...settings, requestRetry: Number(event.target.value) || 2 })}
              />
            </div>
            <div className="field">
              <label>{text('concurrency')}</label>
              <input
                type="number"
                value={settings.requestConcurrency}
                onChange={(event) =>
                  setSettings({ ...settings, requestConcurrency: Number(event.target.value) || 1 })
                }
              />
            </div>
          </div>

          <button className="primary-btn full" onClick={saveSettings}>
            {text('save')}
          </button>
        </section>
      </div>

      {error && <div className="error">{error}</div>}
    </div>
  );
}

