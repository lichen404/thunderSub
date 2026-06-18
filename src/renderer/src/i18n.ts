import type { AppLanguage } from '../../shared/types';

const messages = {
  'zh-CN': {
    appTitle: 'ThunderSub 字幕下载器',
    appSubtitle: '核心模式：添加视频、下载历史、设置',
    addVideo: '添加视频',
    selectedVideo: '已选择视频',
    parse: '解析字幕',
    subtitles: '可下载字幕',
    noSubtitles: '添加视频并解析后可下载字幕',
    language: '语言',
    format: '格式',
    download: '下载',
    status: '状态',
    progress: '进度',
    downloadHistory: '下载历史',
    noHistory: '暂无历史记录',
    time: '时间',
    file: '文件',
    savePath: '保存路径',
    settings: '设置',
    uiLanguage: '界面语言',
    downloadDir: '下载目录',
    chooseDir: '选择目录',
    namingRule: '命名规则',
    parser: '解析器',
    apiBase: '迅雷接口地址',
    apiBaseUnset: '未设置',
    timeout: '超时(ms)',
    retry: '重试次数',
    concurrency: '并发数',
    save: '保存设置'
  },
  'en-US': {
    appTitle: 'ThunderSub Subtitle Downloader',
    appSubtitle: 'Core mode: add video, history, settings',
    addVideo: 'Add Video',
    selectedVideo: 'Selected Video',
    parse: 'Parse Subtitles',
    subtitles: 'Available Subtitles',
    noSubtitles: 'Add a video and parse to see subtitles',
    language: 'Language',
    format: 'Format',
    download: 'Download',
    status: 'Status',
    progress: 'Progress',
    downloadHistory: 'History',
    noHistory: 'No history yet',
    time: 'Time',
    file: 'File',
    savePath: 'Save Path',
    settings: 'Settings',
    uiLanguage: 'UI Language',
    downloadDir: 'Download Directory',
    chooseDir: 'Choose Directory',
    namingRule: 'Naming Rule',
    parser: 'Parser',
    apiBase: 'Thunder API Base',
    apiBaseUnset: 'Not set',
    timeout: 'Timeout(ms)',
    retry: 'Retry',
    concurrency: 'Concurrency',
    save: 'Save Settings'
  }
} as const;

export function t(language: AppLanguage, key: keyof (typeof messages)['zh-CN']): string {
  return messages[language][key];
}

