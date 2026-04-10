#!/usr/bin/env node

const { fork, exec } = require('child_process');
const path = require('path');

const noOpen = process.argv.includes('--no-open');

// 设置生产模式
process.env.NODE_ENV = 'production';

const port = process.env.PORT || 3000;
const url = `http://localhost:${port}`;

const serverPath = path.join(__dirname, '..', 'server', 'index.ts');

// 通过 fork + tsx 加载 TypeScript 后端入口
const child = fork(serverPath, [], {
  execArgv: ['--import', 'tsx'],
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit',
});

child.on('error', (err) => {
  console.error('服务启动失败:', err.message);
  process.exit(1);
});

// 等待一小段时间后自动打开浏览器（容错处理）
if (!noOpen) {
  setTimeout(() => {
    try {
      const platform = process.platform;
      if (platform === 'darwin') {
        exec(`open ${url}`);
      } else if (platform === 'win32') {
        exec(`start ${url}`);
      } else {
        exec(`xdg-open ${url}`);
      }
    } catch (_e) {
      console.log(`请手动打开浏览器访问: ${url}`);
    }
  }, 1500);
}

console.log(`\n  📦 Skill Manager CLI`);
console.log(`  ➜ 服务地址: ${url}`);
console.log(`  ➜ 按 Ctrl+C 退出\n`);

// 优雅退出
process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit(0);
});
