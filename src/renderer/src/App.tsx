import { useEffect, useMemo, useState } from 'react';
import type { AppLanguage, AppSettings, DownloadTask, HistoryRecord, SubtitleItem } from '../../shared/types';
import { t } from './i18n';
import './styles.css';

type AppTab = 'addVideo' | 'downloadHistory' | 'settings';

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
  const [activeTab, setActiveTab] = useState<AppTab>('addVideo');
  const [showAbout, setShowAbout] = useState(false);

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
    <div className="app-container">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-wrapper" style={{ position: 'relative' }}>
            <div className="brand-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="brand-sub-badge">sub</span>
          </div>
          <span className="brand-name">ThunderSub</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-button ${activeTab === 'addVideo' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('addVideo');
              setShowAbout(false);
            }}
          >
            <div className="icon-wrapper">
              <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <span className="nav-label">{text('addVideo')}</span>
          </button>

          <button
            className={`nav-button ${activeTab === 'downloadHistory' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('downloadHistory');
              setShowAbout(false);
            }}
          >
            <div className="icon-wrapper">
              <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span className="nav-label">{text('downloadHistory')}</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className={`nav-button footer-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              setShowAbout(false);
            }}
            title={text('settings')}
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
          </button>

          <button
            className={`nav-button footer-button ${showAbout ? 'active' : ''}`}
            onClick={() => setShowAbout(!showAbout)}
            title="About"
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
          </button>
        </div>
      </aside>

      <main className="main-viewport">
        {showAbout ? (
          <section className="card">
            <h2>{text('appTitle')}</h2>
            <p className="muted" style={{ margin: '12px 0' }}>
              Version 1.0.0 (MVP)
            </p>
            <p className="muted" style={{ lineHeight: 1.6 }}>
              这是一个基于 Electron + React + TypeScript 构建的高性能迅雷影音视频字幕下载工具。
              支持自动解析本地视频对应的迅雷高清字幕，提供多语言与多格式一键下载和任务队列并发管理。
            </p>
          </section>
        ) : (
          <>
            {activeTab === 'addVideo' && (
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
            )}

            {activeTab === 'downloadHistory' && (
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
            )}

            {activeTab === 'settings' && (
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
                      onChange={(event) =>
                        setSettings({ ...settings, requestRetry: Number(event.target.value) || 2 })
                      }
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
            )}
          </>
        )}
      </main>

      {error && <div className="error">{error}</div>}
    </div>
  );
}
