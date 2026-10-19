#!/usr/bin/env node
// H5 示例页快速验证：打开 uView-Pro-x dev server 指定路由，只收集 console/page 错误，不截图（秒级完成）。
// App 端效果由真机验证，本脚本仅做 H5 侧「页面能否正常挂载、有无运行时报错」的轻量门禁。
// 用法：
//   node scripts/verify-h5.mjs <route>         # route 如 feedback/mask（必填）
//   node scripts/verify-h5.mjs <route> --timeout 8000
//   node scripts/verify-h5.mjs <route> --json
// 前置：常驻 dev server（localhost:9000）已启动；playwright 浏览器已安装。
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.H5_BASE_URL || 'http://localhost:9000';
const args = process.argv.slice(2);
const jsonOut = args.includes('--json');
const timeoutArg = args.indexOf('--timeout');
const TIMEOUT = timeoutArg >= 0 ? Number(args[timeoutArg + 1]) : 8000;
// route 取第一个非 -- 开头的参数，排除 --timeout 的值
const optValues = [timeoutArg].filter((i) => i >= 0).map((i) => args[i + 1]);
const route = args.find((a) => !a.startsWith('--') && !optValues.includes(a));
const url = route ? `${BASE}/#/pages/${route}/index` : `${BASE}/`;

if (!route) {
  console.error('用法: node scripts/verify-h5.mjs <route> [--timeout ms] [--json]');
  console.error('  route 示例: basic/icon、feedback/mask、library/debounce、index/index');
  process.exit(2);
}

// 1. dev server 可达性
let up = false;
try {
  const res = await fetch(BASE, { signal: AbortSignal.timeout(3000) });
  up = res.ok;
} catch { /* 下面统一处理 */ }
if (!up) {
  const msg = `dev server 不可达（${BASE}）。请先启动常驻 dev server 再验证。`;
  if (jsonOut) console.log(JSON.stringify({ ok: false, error: msg }));
  else console.error(`✗ ${msg}`);
  process.exit(1);
}

// 2. 打开页面收集错误（无截图：domcontentloaded + 正文挂载 + 短宽限即可，整体秒级）
const errors = [];
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[console.${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  // 常驻 dev server（Vite HMR websocket 持续有网络活动），networkidle 永不满足必然超时；
  // 走 domcontentloaded + 等 uni-app H5 正文（uni-page-body）挂载 + 300ms 宽限（等首帧与异步报错）。
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
  await page.waitForSelector('uni-page-body', { timeout: TIMEOUT });
  await page.waitForTimeout(300);
} catch (e) {
  errors.push(`[open] ${e.message}`);
} finally {
  if (browser) await browser.close();
}

const ok = errors.length === 0;
if (jsonOut) {
  console.log(JSON.stringify({ ok, url, errors }, null, 2));
} else {
  console.log(`验证 ${route ? `#/pages/${route}/index` : '首页'}（${url}）`);
  if (ok) console.log('✓ 通过：无 console/page 错误');
  else {
    console.error(`✗ 失败：${errors.length} 个错误`);
    for (const e of errors) console.error('  ' + e);
  }
}
process.exit(ok ? 0 : 1);
