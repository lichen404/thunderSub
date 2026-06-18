# ThunderSub ⚡

> 迅雷影音智能字幕下载工具 — 自动解析本地视频，匹配并下载迅雷高清字幕


---

## 截图

<p align="center">
  <img src="assets/icon.png" width="128" alt="ThunderSub Logo" />
</p>

## 功能

- 🔍 **自动解析** — 选择本地视频文件，自动计算 CID 并从迅雷接口匹配字幕
- 📥 **智能下载** — 显示匹配的字幕列表（多语言、多格式），一键下载
- ⚡ **队列管理** — 并发下载任务队列，实时进度反馈
- 📋 **下载历史** — 记录最近 20 条下载记录，方便回溯
- 🌐 **多语言** — 支持中文 / English 界面切换
- 🎯 **自定义命名** — 灵活的字幕文件命名规则
- 🔄 **自动更新** — 基于 GitHub Releases 的自动更新支持

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | [Electron](https://www.electronjs.org/) 33 |
| UI 层 | [React](https://react.dev/) 18 + [TypeScript](https://www.typescriptlang.org/) |
| 构建 | [electron-vite](https://electron-vite.org/) + [electron-builder](https://www.electron.build/) |
| 包管理 | [pnpm](https://pnpm.io/) |
| 持久化 | [electron-store](https://github.com/sindresorhus/electron-store) |
| 图标 | [sharp](https://sharp.pixelplumbing.com/) |

## 快速开始

### 开发环境

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发模式（含热重载）
pnpm dev
```

### 打包构建

```bash
# Windows 安装包
pnpm dist

# macOS DMG
pnpm dist:mac

# Linux AppImage + deb
pnpm dist:linux

# 三平台全部打包
pnpm dist:all
```

构建产物输出到 `release/` 目录。


## 项目结构

```
thunderSub/
├── assets/                  # 图标资源
│   ├── icon.svg             # 源文件（闪电 + SUB 徽标）
│   ├── icon.png             # 512×512 应用图标
│   ├── icon.ico             # Windows 安装程序图标
│   └── icon.icns            # macOS 应用图标
├── build/
│   └── installer.nsh        # NSIS 安装程序自定义配置
├── src/
│   ├── main/                # Electron 主进程
│   │   ├── index.ts         # 窗口创建、应用生命周期
│   │   ├── ipc.ts           # IPC 通信处理
│   │   ├── updater.ts       # 自动更新
│   │   ├── store.ts         # 持久化存储
│   │   ├── logger.ts        # 日志
│   │   ├── network/         # HTTP 客户端
│   │   ├── parser/          # 字幕解析器（迅雷 + Mock）
│   │   └── tasks/           # 下载队列
│   ├── preload/             # preload 脚本（contextBridge）
│   ├── renderer/            # React 渲染进程
│   │   └── src/
│   │       ├── App.tsx      # 主界面组件
│   │       ├── i18n.ts      # 国际化
│   │       └── styles.css   # 全局样式
│   └── shared/              # 共享类型定义
│       └── types.ts
├── .github/
│   └── workflows/
│       └── release.yml      # GitHub Actions CI/CD
├── package.json
├── electron.vite.config.ts
└── tsconfig.json
```

## 安装程序特性

- **向导模式** — 支持选择安装目录
- **桌面快捷方式** — 安装时自动创建
- **开始菜单** — 自动注册到开始菜单
- **安装后启动** — 可选择安装完成后立即运行
- **自动更新** — 应用启动后自动检查 GitHub Releases 更新

## 发布流程

```bash
# 打标签并推送，GitHub Actions 会自动构建并创建 Release
git tag v1.0.0
git push origin v1.0.0
```

前往 [GitHub Releases 页面](https://github.com/lichen/thunderSub/releases) 查看构建产物。

## 许可证

MIT © [lichen](https://github.com/lichen)
