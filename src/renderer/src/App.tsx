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
  const [isParsing, setIsParsing] = useState(false);
  const [viewFallbackIds, setViewFallbackIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<AppTab>('addVideo');
  const [showAbout, setShowAbout] = useState(false);
  const [thunderApiUrl, setThunderApiUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [committedLanguage, setCommittedLanguage] = useState<AppLanguage>('zh-CN');
  const [toastError, setToastError] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [updateState, setUpdateState] = useState<{
    status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
    version?: string;
    progress?: number;
    message?: string;
  }>({ status: 'idle' });

  useEffect(() => {
    void (async () => {
      const [initialSettings, initialHistory, initialTasks, initialApiUrl, maximized] = await Promise.all([
        window.api.getSettings(),
        window.api.listHistory(),
        window.api.listTasks(),
        window.api.getThunderApiUrl(),
        window.api.isMaximized()
      ]);
      setSettings(initialSettings);
      setCommittedLanguage(initialSettings.language);
      setHistory(initialHistory);
      setTasks(initialTasks);
      setThunderApiUrl(initialApiUrl);
      setIsMaximized(maximized);
    })();

    const offTask = window.api.onTaskUpdate((nextTasks) => {
      setTasks(nextTasks);
      void window.api.listHistory().then((nextHistory) => setHistory(nextHistory));
    });

    const offMaximize = window.api.onMaximizeChange((maximized) => {
      setIsMaximized(maximized);
    });

    const offUpdateChecking = window.api.onUpdateChecking(() => {
      setUpdateState({ status: 'checking' });
    });
    const offUpdateAvailable = window.api.onUpdateAvailable((info) => {
      setUpdateState({ status: 'available', version: info.version });
    });
    const offUpdateNotAvail = window.api.onUpdateNotAvailable(() => {
      setUpdateState({ status: 'not-available' });
      setTimeout(() => setUpdateState({ status: 'idle' }), 4000);
    });
    const offUpdateProgress = window.api.onUpdateDownloadProgress((p) => {
      setUpdateState((s) => ({ ...s, status: 'downloading', progress: p.percent }));
    });
    const offUpdateDownloaded = window.api.onUpdateDownloaded(() => {
      setUpdateState({ status: 'downloaded' });
    });
    const offUpdateError = window.api.onUpdateError((msg) => {
      setUpdateState({ status: 'error', message: msg });
      setTimeout(() => setUpdateState((s) => (s.status === 'error' ? { status: 'idle' } : s)), 5000);
    });

    return () => {
      offTask();
      offMaximize();
      offUpdateChecking();
      offUpdateAvailable();
      offUpdateNotAvail();
      offUpdateProgress();
      offUpdateDownloaded();
      offUpdateError();
    };
  }, []);

  const language: AppLanguage = committedLanguage;
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
    if (!videoPath || isParsing) return;
    setError('');
    setIsParsing(true);
    try {
      const result = await window.api.parseSubtitles(videoPath);
      setSubtitles(result.subtitles);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsParsing(false);
    }
  };

  const downloadSubtitle = async (subtitle: SubtitleItem) => {
    setError('');
    try {
      setViewFallbackIds((prev) => {
        const next = new Set(prev);
        next.delete(subtitle.id);
        return next;
      });
      await window.api.createTask({ videoPath, subtitle });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const openSubtitleFolder = async (subtitleId: string, savePath: string) => {
    setError('');
    try {
      await window.api.openSubtitleSaveFolder(savePath);
    } catch {
      // File not found - remove task so user can re-download
      await window.api.removeTask(videoPath, subtitleId);
      setTasks((prev) => prev.filter((t) => !(t.videoPath === videoPath && t.subtitle.id === subtitleId)));
    }
  };

  const chooseDirectory = async () => {
    if (!settings) return;
    const folder = await window.api.openDirectory();
    if (!folder) return;
    setSettings({ ...settings, downloadDir: folder });
  };

  const saveSettings = async () => {
    if (!settings || isSaving) return;
    setIsSaving(true);
    setSavedMessage('');
    try {
      const updatedSettings = await window.api.updateSettings(settings);
      setSettings(updatedSettings);
      setCommittedLanguage(updatedSettings.language);
      setSavedMessage(language === 'en-US' ? 'Settings saved ✓' : '设置已保存 ✓');
      setTimeout(() => setSavedMessage(''), 2500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = async () => {
    if (!settings) return;
    const confirmed = language === 'en-US'
      ? window.confirm('This will reset all settings and clear download history. Continue?')
      : window.confirm('将重置所有设置并清空下载历史，确定继续吗？');
    if (!confirmed) return;
    try {
      const defaultSettings = await window.api.clearAllData();
      setSettings(defaultSettings);
      setCommittedLanguage(defaultSettings.language);
      setHistory([]);
      setThunderApiUrl(await window.api.getThunderApiUrl());
      setSavedMessage(language === 'en-US' ? 'Data reset ✓' : '数据已重置 ✓');
      setTimeout(() => setSavedMessage(''), 2500);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const subtitleTaskMap = useMemo(() => {
    const map = new Map<string, DownloadTask>();
    for (const task of tasks) {
      if (task.videoPath !== videoPath) continue;
      const key = task.subtitle.id;
      const prev = map.get(key);
      if (!prev || new Date(task.updatedAt).getTime() > new Date(prev.updatedAt).getTime()) {
        map.set(key, task);
      }
    }
    return map;
  }, [tasks, videoPath]);

  const getTaskStatusLabel = (task: DownloadTask): string => {
    if (language === 'en-US') {
      if (task.status === 'pending') return 'Pending';
      if (task.status === 'running') return 'Downloading';
      if (task.status === 'success') return 'Completed';
      return 'Failed';
    }
    if (task.status === 'pending') return '等待中';
    if (task.status === 'running') return '下载中';
    if (task.status === 'success') return '已完成';
    return '失败';
  };

  if (!settings) return null;

  return (
    <div className="app-container">
      {/* Custom Title Bar */}
      <header className="title-bar">
        <div className="title-bar-drag" />
        <div className="title-bar-controls">
          <button
            className="win-control win-minimize"
            onClick={() => window.api.minimizeWindow()}
            aria-label="Minimize"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="1" y="5.5" width="10" height="1" fill="currentColor" />
            </svg>
          </button>
          <button
            className="win-control win-maximize"
            onClick={() => window.api.maximizeWindow()}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="2.5" y="0.5" width="9" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
                <rect x="0.5" y="2.5" width="9" height="9" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="1" y="1" width="10" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </button>
          <button
            className="win-control win-close"
            onClick={() => window.api.closeWindow()}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="app-body">
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
          >
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <span className="nav-label">{text('settings')}</span>
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

        {/* Update indicator */}
        {updateState.status !== 'idle' && (
          <div className="sidebar-update-indicator">
            {updateState.status === 'available' && (
              <button className="update-dot available" title={`Update v${updateState.version} available`} onClick={() => window.api.downloadUpdate()} />
            )}
            {updateState.status === 'downloading' && (
              <div className="update-dl-progress" title={`Downloading... ${updateState.progress}%`}>
                <div className="update-dl-fill" style={{ width: `${updateState.progress ?? 0}%` }} />
              </div>
            )}
            {updateState.status === 'downloaded' && (
              <button className="update-dot downloaded" title="Update ready — click to install" onClick={() => window.api.quitAndInstall()} />
            )}
            {updateState.status === 'not-available' && <span className="update-dot latest" title="Up to date" />}
            {updateState.status === 'error' && <span className="update-dot error" title={updateState.message || 'Update check failed'} />}
          </div>
        )}
      </aside>

      <main className="main-viewport">
        {showAbout ? (
          <section className="card">
            <h2>{text('appTitle')}</h2>
            <p className="muted" style={{ margin: '12px 0' }}>
              Version 1.0.0
            </p>
            <p className="muted" style={{ lineHeight: 1.6 }}>
              这是一个基于 Electron + React + TypeScript 构建的高性能迅雷影音视频字幕下载工具。
              支持自动解析本地视频对应的迅雷高清字幕，提供多语言与多格式下载和任务队列并发管理。
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
                    <button onClick={parseSubtitles} disabled={!videoPath || isParsing}>
                      {isParsing ? `${text('parse')}...` : text('parse')}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label>{text('subtitles')}</label>
                  <div className="list subtitle-list-scroll">
                    {isParsing && <div className="muted">Loading...</div>}
                    {subtitles.length === 0 && <div className="muted">{text('noSubtitles')}</div>}
                    {subtitles.map((item) => {
                      const task = subtitleTaskMap.get(item.id);
                      const canView = task?.status === 'success' && !viewFallbackIds.has(item.id);
                      const isDownloading = task?.status === 'running' || task?.status === 'pending';
                      const buttonText = canView
                        ? language === 'en-US'
                          ? 'View'
                          : '查看'
                        : isDownloading
                          ? language === 'en-US'
                            ? 'Downloading'
                            : '下载中'
                          : text('download');

                      return (
                      <div className="list-item subtitle-entry" key={item.id}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '85%', padding: '2px 0', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '14px', color: '#eef4ff' }}>{item.language}</strong>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 6px',
                              background: 'rgba(0, 162, 255, 0.1)',
                              borderRadius: '4px',
                              fontSize: '10px',
                              color: '#00a2ff',
                              fontWeight: '600',
                              border: '1px solid rgba(0, 162, 255, 0.25)',
                              lineHeight: 1.2
                            }}>
                              {item.format.toUpperCase()}
                            </span>
                            {item.star && (
                              <span style={{ fontSize: '11px', color: '#ffbe0b', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: '500' }}>
                                ★ {item.star}
                              </span>
                            )}
                          </div>
                          {item.name && (
                            <span style={{
                              fontSize: '12px',
                              color: '#626f7a',
                              wordBreak: 'break-all',
                              display: 'block',
                              lineHeight: 1.4
                            }}>
                              {item.name}
                            </span>
                          )}
                          {task && (
                            <div className="subtitle-task-info">
                              <div className="subtitle-task-row">
                                <span
                                  className={`task-status ${
                                    task.status === 'success'
                                      ? 'ok'
                                      : task.status === 'failed'
                                        ? 'bad'
                                        : ''
                                  }`}
                                >
                                  {getTaskStatusLabel(task)}
                                </span>
                                <span className="task-progress-text">
                                  {Math.round(task.progress)}%
                                </span>
                              </div>
                              <div className="task-progress-track">
                                <div
                                  className="task-progress-fill"
                                  style={{ width: `${Math.max(0, Math.min(100, task.progress))}%` }}
                                />
                              </div>
                              {task.error && (
                                <small>{task.error}</small>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (canView && task) {
                              void openSubtitleFolder(item.id, task.savePath);
                              return;
                            }
                            void downloadSubtitle(item);
                          }}
                          disabled={isDownloading}
                        >
                          {buttonText}
                        </button>
                      </div>
                    );
                    })}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'downloadHistory' && (
              <section className="card">
                <div className="card-title-row">
                  <h2>{text('downloadHistory')}</h2>
                  {history.length > 0 && (
                    <span className="history-count">{history.length}/20</span>
                  )}
                </div>
                <div className="list history-list-scroll">
                  {history.length === 0 && <div className="muted">{text('noHistory')}</div>}
                  {history.map((item) => (
                    <div className="list-item subtitle-entry" key={item.id}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '85%', padding: '2px 0', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '14px', color: '#eef4ff' }}>{getFileName(item.videoPath)}</strong>
                          <span className={item.status === 'success' ? 'ok' : 'bad'} style={{ fontSize: '10px', lineHeight: 1.2 }}>
                            {item.status === 'success'
                              ? language === 'en-US'
                                ? 'Completed'
                                : '已完成'
                              : language === 'en-US'
                                ? 'Failed'
                                : '失败'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '12px',
                          color: '#626f7a',
                          wordBreak: 'break-all',
                          display: 'block',
                          lineHeight: 1.4
                        }}>
                          {item.savePath}
                        </span>
                        {item.error && (
                          <small style={{ color: '#ff6b81', display: 'block', marginTop: '4px', fontSize: '12px' }}>
                            {item.error}
                          </small>
                        )}
                      </div>
                      {item.status === 'success' && (
                        <button onClick={async () => {
                          try {
                            await window.api.openSubtitleSaveFolder(item.savePath);
                          } catch {
                            const msg = language === 'en-US'
                              ? `Failed to open: ${item.savePath}`
                              : `无法打开文件：${item.savePath}`;
                            setToastError(msg);
                            setTimeout(() => setToastError(''), 3500);
                          }
                        }}>
                          {language === 'en-US' ? 'View' : '查看'}
                        </button>
                      )}
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
                    onChange={(event) =>
                      setSettings({ ...settings, language: event.target.value as AppLanguage })
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
                    placeholder="{videoName}.{lang}.{format}"
                    value={settings.namingRule}
                    onChange={(event) =>
                      setSettings({ ...settings, namingRule: event.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label>{text('apiBase')}</label>
                  <input
                    value={thunderApiUrl || text('apiBaseUnset')}
                    readOnly
                  />
                </div>

                <div className="inline-3">
                  <div className="field">
                    <label>{text('timeout')}</label>
                    <input
                      type="number"
                      min={100}
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
                      min={0}
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
                      min={1}
                      value={settings.requestConcurrency}
                      onChange={(event) =>
                        setSettings({ ...settings, requestConcurrency: Number(event.target.value) || 3 })
                      }
                    />
                  </div>
                </div>

                {savedMessage && <div className="toast-success">{savedMessage}</div>}

                <button className="primary-btn full" onClick={saveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <span className="btn-loading">
                      <span className="spinner" />
                      <span>{language === 'en-US' ? 'Saving...' : '保存中...'}</span>
                    </span>
                  ) : (
                    text('save')
                  )}
                </button>

                <button
                  className="danger-btn full"
                  onClick={handleClearAll}
                  style={{ marginTop: '12px' }}
                >
                  {language === 'en-US' ? 'Reset All Data' : '重置所有数据'}
                </button>
              </section>
            )}
          </>
        )}
      </main>

      </div>{/* end app-body */}

      {error && <div className="error">{error}</div>}

      {toastError && (
        <div className="toast-error-float">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{toastError}</span>
        </div>
      )}

      {/* Update notification banner */}
      {updateState.status === 'available' && (
        <div className="update-banner">
          <div className="update-banner-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              {language === 'en-US'
                ? `v${updateState.version} available — download & install`
                : `v${updateState.version} 可用 — 下载并安装`}
            </span>
          </div>
          <div className="update-banner-actions">
            <button className="update-banner-btn" onClick={() => window.api.downloadUpdate()}>
              {language === 'en-US' ? 'Download' : '下载'}
            </button>
            <button className="update-banner-close" onClick={() => setUpdateState({ status: 'idle' })}>
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l8 8M10 2L2 10" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {updateState.status === 'downloading' && (
        <div className="update-banner">
          <div className="update-banner-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              {language === 'en-US' ? 'Downloading update...' : '正在下载更新...'}
              <span className="update-banner-percent">{updateState.progress ?? 0}%</span>
            </span>
          </div>
          <div className="update-banner-track">
            <div className="update-banner-fill" style={{ width: `${updateState.progress ?? 0}%` }} />
          </div>
        </div>
      )}

      {updateState.status === 'downloaded' && (
        <div className="update-banner installed">
          <div className="update-banner-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span>
              {language === 'en-US' ? 'Update ready — restart to apply' : '更新已就绪 — 重启以应用'}
            </span>
          </div>
          <button className="update-banner-btn primary" onClick={() => window.api.quitAndInstall()}>
            {language === 'en-US' ? 'Restart' : '重启'}
          </button>
        </div>
      )}
    </div>
  );
}
