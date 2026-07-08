/**
 * 本地更新服务器 — electron-updater 本地测试
 *
 * 用法:
 *   node scripts/local-update-server/serve.mjs              # 有新版本 (0.4.0)
 *   node scripts/local-update-server/serve.mjs no-update    # 无更新
 *   node scripts/local-update-server/serve.mjs error        # 校验失败
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const scenario = process.argv[2] || 'latest';
const scenarioMap = {
  latest: 'latest.yml',
  'no-update': 'no-update.yml',
  error: 'download-error.yml',
};

const ymlFile = scenarioMap[scenario] || 'latest.yml';
const PORT = 8089;

const MIME = {
  '.yml': 'application/x-yaml',
  '.yaml': 'application/x-yaml',
  '.exe': 'application/octet-stream',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
  let filePath = url.pathname;

  // 首页
  if (filePath === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html><head><title>本地更新服务器</title><style>
body{font-family:system-ui;max-width:600px;margin:40px auto;padding:0 20px;background:#111;color:#ddd}
h1{color:#fff}.card{background:#1a1a2e;border-radius:8px;padding:16px;margin:12px 0}
code{background:#2a2a3e;padding:2px 6px;border-radius:4px;font-size:13px}
a{color:#7ecfff}.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600}
.badge-on{background:#1a5c1a;color:#4f4}.badge-off{background:#5c3a00;color:#fb0}
</style></head><body>
<h1>🔧 ThunderSub 本地更新服务器</h1>
<div class="card">
<p>当前场景: <span class="badge ${scenario === 'latest' ? 'badge-on' : 'badge-off'}">${scenario}</span></p>
<p>YML: <code>${ymlFile}</code> | 端口: <code>${PORT}</code></p>
</div>
<div class="card">
<h3>端点</h3>
<ul>
<li><a href="/latest.yml">/latest.yml</a> — 更新清单</li>
<li><a href="/ThunderSub-Setup-0.4.0.exe">/ThunderSub-Setup-0.4.0.exe</a> — mock 安装包</li>
</ul>
</div>
<div class="card">
<h3>切换场景 (重启服务器)</h3>
<pre>node serve.mjs            # 有更新 (0.3.0 → 0.4.0)
node serve.mjs no-update   # 无更新
node serve.mjs error       # 校验失败测试</pre>
</div>
</body></html>`);
    return;
  }

  // /latest.yml
  if (filePath === '/latest.yml') {
    const content = fs.readFileSync(path.join(__dirname, ymlFile), 'utf-8');
    res.writeHead(200, { 'Content-Type': MIME['.yml'] });
    res.end(content);
    return;
  }

  // exe 下载
  if (filePath.endsWith('.exe')) {
    const exePath = path.join(__dirname, filePath);
    if (fs.existsSync(exePath)) {
      const stat = fs.statSync(exePath);
      const ext = path.extname(filePath);
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': stat.size,
      });
      fs.createReadStream(exePath).pipe(res);
    } else {
      const dummy = Buffer.alloc(1024, 'THUNDERSUB_MOCK_UPDATE\n');
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': dummy.length,
      });
      res.end(dummy);
    }
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🔧  ThunderSub 本地更新服务器已启动   ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  地址: http://127.0.0.1:${PORT}            ║`);
  console.log(`║  场景: ${scenario.padEnd(32)}║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});
