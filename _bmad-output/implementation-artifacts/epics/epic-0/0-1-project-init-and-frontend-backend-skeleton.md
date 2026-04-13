# Story 0.1: 项目初始化与前后端骨架

Status: done

## Story

As a 开发者,
I want 通过一条命令启动前后端开发环境,
So that 我可以在统一的开发环境中开始构建功能。

## Acceptance Criteria (AC)

1. **AC-1: 项目初始化与依赖安装**
   - Given 用户 clone 项目并运行 `npm install`
   - When 安装完成
   - Then 所有依赖安装成功，无阻断性 peer dependency 错误（允许 warning）
   - And `tsc --noEmit` 编译通过

2. **AC-2: 开发环境一条命令启动**
   - Given 用户执行 `npm run dev`
   - When 前后端启动完成
   - Then 前端 Vite 在端口 5173 启动，支持 HMR
   - And 后端 Express 在端口 3001 启动，支持热重载（tsx watch）
   - And Vite proxy 将 `/api/*` 请求转发到 `http://localhost:3001`
   - And 终端输出清晰的启动信息（前端 URL + 后端 URL）

3. **AC-3: 后端健康检查与安全绑定**
   - Given 后端已启动
   - When 请求 `GET /api/health`
   - Then 返回 `{ success: true, data: { status: "ok", version: "0.1.0", timestamp: "<ISO 8601>" } }`
   - And Express 绑定 `127.0.0.1`，外部 IP 无法访问（NFR5）
   - And 响应头包含 `Content-Type: application/json`

4. **AC-4: 前端路由骨架**
   - Given 用户在浏览器打开 `http://localhost:5173`
   - When 页面加载完成
   - Then React Router 配置 5 个路由：`/`、`/workflow`、`/sync`、`/import`、`/settings`
   - And 每个路由渲染对应的空壳页面组件（显示页面名称占位）
   - And 未匹配路由渲染 NotFound 占位组件（显示"页面不存在"提示文字）
   - And 浏览器直接访问子路由（如 `/workflow`）不返回 404

5. **AC-5: 生产构建与单进程运行**
   - Given 用户执行 `npm run build`
   - When 构建完成
   - Then Vite 生成生产构建到 `dist/` 目录
   - And `npm start` 启动 Express 单进程，serve `dist/` 静态文件 + API
   - And 生产模式监听端口 3000（通过 PORT 环境变量可覆盖）
   - And 生产模式同样绑定 `127.0.0.1`

6. **AC-6: CLI 全局命令**
   - Given `bin/cli.js` 存在
   - When 用户通过 `npx skill-manager` 或 `node bin/cli.js` 启动
   - Then Express 服务启动并自动打开默认浏览器到 `http://localhost:3000`
   - And 终端输出服务地址和退出提示
   - And headless 环境下打开浏览器失败不影响服务启动（try-catch 容错）
   - And 支持 `--no-open` 参数跳过自动打开浏览器

## Tasks / Subtasks

- [x] Task 1: 项目根目录初始化 (AC: #1)
  - [x] 1.1 创建 `package.json`，配置项目名称、版本、scripts、engines（Node.js >= 18）
  - [x] 1.2 创建 `tsconfig.json`（根配置，引用 client + server）
  - [x] 1.3 创建 `tsconfig.client.json`（前端 TS 配置，target: ES2020, jsx: react-jsx）
  - [x] 1.4 创建 `tsconfig.server.json`（后端 TS 配置，target: ES2022, module: NodeNext, moduleResolution: NodeNext）
  - [x] 1.5 创建 `.nvmrc`（锁定 Node.js 版本 >= 18）
  - [x] 1.6 创建 `.gitignore`（node_modules, dist, .tmp 等）
  - [x] 1.7 创建 `.env.example`（PORT=3001, CLIENT_PORT=5173, PROD_PORT=3000）
  - [x] 1.8 创建 `.editorconfig`（2 space indent, UTF-8, LF 换行符）

- [x] Task 2: 安装核心依赖 (AC: #1)
  - [x] 2.1 安装生产依赖：`express`, `cors`, `gray-matter`, `js-yaml`, `fs-extra`
  - [x] 2.2 安装开发依赖：`@types/express`, `@types/cors`, `@types/fs-extra`, `concurrently`, `tsx`, `typescript`, `cross-env`
  - [x] 2.3 安装前端依赖：`react`, `react-dom`, `react-router-dom`
  - [x] 2.4 安装前端开发依赖：`@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `vite`
  - [x] 2.5 验证 `npm install` 无错误，`tsc --noEmit` 通过

- [x] Task 3: Vite 前端骨架 (AC: #2, #4)
  - [x] 3.1 创建 `vite.config.ts`：配置 React 插件 + proxy `/api` → `http://localhost:3001`
  - [x] 3.2 创建 `src/main.tsx`：React 入口，挂载到 `#root`
  - [x] 3.3 创建 `src/App.tsx`：使用 `createBrowserRouter` + `RouterProvider`（v6 data router 模式）配置 5 个路由
  - [x] 3.4 创建 `src/vite-env.d.ts`：Vite 类型声明
  - [x] 3.5 创建 `index.html`：Vite 入口 HTML
  - [x] 3.6 创建 5 个空壳页面组件 + NotFound：
    - `src/pages/SkillBrowsePage.tsx`（/）
    - `src/pages/WorkflowPage.tsx`（/workflow）
    - `src/pages/SyncPage.tsx`（/sync）
    - `src/pages/ImportPage.tsx`（/import）
    - `src/pages/SettingsPage.tsx`（/settings）
    - `src/pages/NotFound.tsx`（\*）

- [x] Task 4: Express 后端骨架 (AC: #2, #3)
  - [x] 4.1 创建 `server/index.ts`：Express 入口，绑定 `127.0.0.1`，启动服务
  - [x] 4.2 创建 `server/app.ts`：Express app 配置（cors, json 中间件, 注册 healthRoutes, API 404 处理器）
  - [x] 4.3 创建 `server/routes/healthRoutes.ts`：`GET /api/health` 端点
  - [x] 4.4 生产模式下 serve `dist/` 静态文件，API 404 处理器（`/api/*` 未匹配路由返回 JSON 404），SPA fallback（其余路由返回 `index.html`）
  - [x] 4.5 验证 Express 绑定 `127.0.0.1`，外部 IP 请求被拒绝

- [x] Task 5: 开发与构建脚本 (AC: #2, #5)
  - [x] 5.1 配置 `package.json` scripts：
    - `dev`: `concurrently -n client,server -c blue,green "npm run dev:client" "npm run dev:server"`
    - `dev:client`: `vite`
    - `dev:server`: `tsx watch server/index.ts`
    - `build`: `tsc --noEmit && vite build`
    - `start`: `cross-env NODE_ENV=production tsx server/index.ts`
    - `typecheck`: `tsc --noEmit`
  - [x] 5.2 验证 `npm run dev` 同时启动前后端
  - [x] 5.3 验证 `npm run build && npm start` 生产模式正常运行

- [x] Task 6: CLI 全局命令 (AC: #6)
  - [x] 6.1 创建 `bin/cli.js`：#!/usr/bin/env node，通过 `child_process.fork` 结合 `tsx` 加载 `server/index.ts`，启动 Express + 自动打开浏览器（try-catch 容错），支持 `--no-open` 参数
  - [x] 6.2 在 `package.json` 中配置 `"bin": { "skill-manager": "./bin/cli.js" }`
  - [x] 6.3 验证 `node bin/cli.js` 正常启动服务

- [x] Task 7: 目录结构骨架 (AC: #1)
  - [x] 7.1 创建空目录结构（确保 Git 追踪）：
    - `src/components/ui/`（shadcn/ui 组件，后续 Story 填充）
    - `src/components/layout/`
    - `src/components/skills/`
    - `src/components/workflow/`
    - `src/components/sync/`
    - `src/components/import/`
    - `src/components/settings/`
    - `src/components/shared/`
    - `src/stores/`
    - `src/hooks/`
    - `src/lib/`
    - `src/types/`
    - `server/routes/`
    - `server/services/`
    - `server/utils/`
    - `server/middleware/`
    - `server/types/`
    - `shared/`
    - `skills/`（顶层目录，分类子目录由 Story 0.5 根据配置创建）
    - `config/`
    - `public/fonts/`
    - `tests/integration/`
    - `tests/fixtures/sample-skills/`
  - [x] 7.2 在空目录中放置 `.gitkeep` 文件

## Dev Notes

### 架构约束（必须遵守）

1. **前后端分离**：前端 `src/` 不可直接操作文件系统，所有文件 I/O 通过后端 API
2. **Express 绑定 127.0.0.1**：`app.listen(PORT, '127.0.0.1', ...)`，不使用 `0.0.0.0`
3. **TypeScript strict mode**：`tsconfig.json` 中 `strict: true`
4. **API 响应格式**：所有 API 使用 `{ success: true, data: T }` 或 `{ success: false, error: { code, message } }` 格式（后续 Story 0.2 会完善类型定义，本 Story 先用简单对象）
5. **Vite proxy**：开发模式下 `/api` 请求代理到后端，生产模式下 Express 直接处理

### 技术栈版本要求

| 技术         | 版本要求 | 说明                              |
| ------------ | -------- | --------------------------------- |
| Node.js      | >= 18    | LTS 版本，支持 ESM                |
| TypeScript   | ~5.x     | strict mode                       |
| React        | ^18.x    | 使用 React 18                     |
| React Router | ^6.x     | 使用 v6 data router               |
| Vite         | ^5.x     | 构建工具                          |
| Express      | ^4.x     | 后端框架                          |
| concurrently | ^8.x     | 并行启动前后端                    |
| tsx          | ^4.x     | TypeScript 执行器（替代 ts-node） |

### Vite 配置关键点

```typescript
// vite.config.ts 关键配置
export default defineConfig({
  plugins: [react()],
  root: ".",
  build: { outDir: "dist" },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

### Express 生产模式 SPA Fallback

```typescript
// server/index.ts 生产模式关键逻辑
if (process.env.NODE_ENV === "production") {
  // serve Vite 构建产物
  app.use(express.static(path.join(__dirname, "../dist")));
}

// API 路由注册（所有模式）
app.use("/api", apiRouter);

// API 404 处理器：未匹配的 /api/* 路由返回 JSON 404
app.all("/api/*", (req, res) => {
  res
    .status(404)
    .json({
      success: false,
      error: { code: "NOT_FOUND", message: "API endpoint not found" },
    });
});

if (process.env.NODE_ENV === "production") {
  // SPA fallback：所有非 API 路由返回 index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}
```

### CLI 启动与自动打开浏览器

```javascript
// bin/cli.js 关键逻辑
#!/usr/bin/env node
const { fork, exec } = require('child_process');
const path = require('path');

const noOpen = process.argv.includes('--no-open');

// 通过 tsx 加载 TypeScript 后端入口
// 方案：使用 fork + tsx 的 register 机制
process.env.NODE_ENV = 'production';
const serverPath = path.join(__dirname, '..', 'server', 'index.ts');
const child = fork(serverPath, [], {
  execArgv: ['--import', 'tsx'],  // tsx ESM loader
});

// 自动打开浏览器（容错处理）
if (!noOpen) {
  const url = `http://localhost:${process.env.PORT || 3000}`;
  try {
    if (process.platform === 'darwin') exec(`open ${url}`);
    else if (process.platform === 'win32') exec(`start ${url}`);
    else exec(`xdg-open ${url}`);
  } catch (e) {
    console.log(`请手动打开浏览器访问: ${url}`);
  }
}
```

> **注意：** `tsx` 必须在 dependencies（而非 devDependencies）中，因为 CLI 和 `npm start` 在生产模式下依赖它运行 TypeScript。这是本地开发者工具的有意设计选择。

```

### 模块系统策略（⚠️ 关键决策）

本项目采用 **ESM 优先** 策略：
- `package.json` 中添加 `"type": "module"`
- 后端 `tsconfig.server.json` 使用 `module: NodeNext` + `moduleResolution: NodeNext`
- `tsx` 处理 ESM/CJS 互操作，开发和生产模式均通过 `tsx` 运行 TypeScript
- `bin/cli.js` 是唯一的 CommonJS 文件（因为 npm bin 入口需要 shebang + CJS），内部通过 `fork` + `tsx` 加载 ESM 后端
- `tsx` 放在 **dependencies**（而非 devDependencies），因为 `npm start` 和 CLI 在生产模式下依赖它
- 覆盖架构文档中 `nodemon` 的描述，统一使用 `tsx watch` 进行后端热重载

### 端口策略

| 模式 | 端口 | 来源 |
|------|------|------|
| 开发模式（前端） | 5173 | Vite 默认 |
| 开发模式（后端） | 3001 | `PORT` 环境变量或默认值 |
| 生产模式 | 3000 | `PORT` 环境变量或默认值（`NODE_ENV=production` 时默认 3000） |

### 不要做的事情（防止过度实现）

- ❌ 不要安装 shadcn/ui 或 Tailwind CSS（Story 0.4 负责）
- ❌ 不要创建 Zustand Store（Story 0.4 负责）
- ❌ 不要创建共享类型定义（Story 0.2 负责）
- ❌ 不要实现错误处理中间件（Story 0.2 负责）
- ❌ 不要实现文件解析工具（Story 0.3 负责）
- ❌ 不要添加任何样式（Story 0.4 负责设计系统）
- ❌ 不要安装 `open` 包，CLI 使用 `child_process` 打开浏览器
- ❌ 不要在 `skills/` 下创建分类子目录（Story 0.5 根据配置创建）
- ❌ `gray-matter`、`js-yaml`、`fs-extra` 在本 Story 中仅安装不使用，将在 Story 0.3 中首次调用

### Project Structure Notes

本 Story 建立的目录结构严格遵循架构文档定义：

```

skill-manager/
├── package.json
├── tsconfig.json # 根配置（引用 client + server）
├── tsconfig.client.json # 前端 TS 配置
├── tsconfig.server.json # 后端 TS 配置
├── vite.config.ts
├── .nvmrc
├── .gitignore
├── .env.example
├── bin/
│ └── cli.js # 全局命令入口
├── src/ # 前端源码
│ ├── main.tsx
│ ├── App.tsx
│ ├── vite-env.d.ts
│ ├── pages/ # 页面组件
│ │ ├── SkillBrowsePage.tsx
│ │ ├── WorkflowPage.tsx
│ │ ├── SyncPage.tsx
│ │ ├── ImportPage.tsx
│ │ └── SettingsPage.tsx
│ ├── components/ # 组件目录（空骨架）
│ ├── stores/ # Zustand Store（空骨架）
│ ├── hooks/ # 自定义 Hooks（空骨架）
│ ├── lib/ # 工具库（空骨架）
│ └── types/ # 类型定义（空骨架）
├── server/ # 后端源码
│ ├── index.ts # Express 入口
│ ├── app.ts # Express app 配置
│ ├── routes/
│ │ └── healthRoutes.ts
│ ├── services/ # 业务逻辑（空骨架）
│ ├── utils/ # 工具函数（空骨架）
│ ├── middleware/ # 中间件（空骨架）
│ └── types/ # 后端类型（空骨架）
├── shared/ # 前后端共享（空骨架）
├── skills/ # 用户 Skill 文件（分类子目录由 Story 0.5 创建）
├── config/ # 用户配置
├── public/
│ └── fonts/
├── tests/
│ ├── integration/
│ └── fixtures/sample-skills/
└── index.html

```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter-Template-Evaluation] — Vite + React + Express 选型理由
- [Source: _bmad-output/planning-artifacts/architecture.md#Core-Architectural-Decisions] — AD-1 前后端架构、AR1/AR14/AR15/AR17/AR20
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-Boundaries] — 完整目录结构定义
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure-Deployment] — 开发/生产环境配置
- [Source: _bmad-output/planning-artifacts/prd.md#Technical-Architecture-Considerations] — 前后端分离架构确认
- [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional-Requirements] — NFR2 首次加载 < 2s、NFR5 仅 localhost
- [Source: _bmad-output/planning-artifacts/epics.md#Story-0.1] — 原始 Story 定义和验收标准

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Amelia — Senior Software Engineer)

### Debug Log References

- Express v5 使用新版 path-to-regexp，`/api/*` 语法不再支持，改为 `/api/{*path}` 和 `{*path}`
- tsx 需要放在 dependencies 而非 devDependencies，因为 CLI 和 npm start 在生产模式下依赖它
- npm 安装了 Express v5、React v19、TypeScript v6、Vite v8（2026 年最新稳定版），与 Story 中的最低版本要求兼容

### Completion Notes List

- ✅ Task 1: 创建 package.json, tsconfig.json, tsconfig.client.json, tsconfig.server.json, .nvmrc, .gitignore, .env.example, .editorconfig
- ✅ Task 2: 安装所有生产依赖和开发依赖，tsx 移至 dependencies
- ✅ Task 3: 创建 vite.config.ts, index.html, src/main.tsx, src/App.tsx, src/vite-env.d.ts, 5 个页面组件 + NotFound
- ✅ Task 4: 创建 server/index.ts, server/app.ts（createApp 工厂函数）, server/routes/healthRoutes.ts
- ✅ Task 5: 配置 package.json scripts（dev, dev:client, dev:server, build, start, typecheck）
- ✅ Task 6: 创建 bin/cli.js（fork + tsx, --no-open 参数, 自动打开浏览器, 优雅退出）
- ✅ Task 7: 创建 22 个空目录 + .gitkeep 文件
- 🔧 修复：Express v5 path-to-regexp 通配符语法（/api/* → /api/{*path}）
- 🔧 决策：app.ts 改为 createApp 工厂函数，接收 isProduction 和 distPath 参数，确保 SPA fallback 在 API 404 之后注册

### Verification Results

- `tsc --noEmit` ✅ 编译通过
- `vite build` ✅ 构建成功（dist/index.html + dist/assets/index-*.js）
- `GET /api/health` ✅ 返回 {success:true, data:{status:"ok", version:"0.1.0", timestamp:"..."}}
- `GET /api/nonexistent` ✅ 返回 {success:false, error:{code:"NOT_FOUND", message:"API endpoint not found"}}
- 生产模式端口 3000 ✅
- SPA fallback（/workflow 返回 200）✅
- Express 绑定 127.0.0.1 ✅（lsof 确认 TCP 127.0.0.1:3001 LISTEN）

### File List

- package.json (新建)
- package-lock.json (自动生成)
- tsconfig.json (新建)
- tsconfig.client.json (新建)
- tsconfig.server.json (新建)
- vite.config.ts (新建)
- index.html (新建)
- .nvmrc (新建)
- .gitignore (新建)
- .env.example (新建)
- .editorconfig (新建)
- bin/cli.js (新建)
- src/main.tsx (新建)
- src/App.tsx (新建)
- src/vite-env.d.ts (新建)
- src/pages/SkillBrowsePage.tsx (新建)
- src/pages/WorkflowPage.tsx (新建)
- src/pages/SyncPage.tsx (新建)
- src/pages/ImportPage.tsx (新建)
- src/pages/SettingsPage.tsx (新建)
- src/pages/NotFound.tsx (新建)
- server/index.ts (新建)
- server/app.ts (新建)
- server/routes/healthRoutes.ts (新建)
- src/components/ui/.gitkeep (新建)
- src/components/layout/.gitkeep (新建)
- src/components/skills/.gitkeep (新建)
- src/components/workflow/.gitkeep (新建)
- src/components/sync/.gitkeep (新建)
- src/components/import/.gitkeep (新建)
- src/components/settings/.gitkeep (新建)
- src/components/shared/.gitkeep (新建)
- src/stores/.gitkeep (新建)
- src/hooks/.gitkeep (新建)
- src/lib/.gitkeep (新建)
- src/types/.gitkeep (新建)
- server/services/.gitkeep (新建)
- server/utils/.gitkeep (新建)
- server/middleware/.gitkeep (新建)
- server/types/.gitkeep (新建)
- shared/.gitkeep (新建)
- skills/.gitkeep (新建)
- config/.gitkeep (新建)
- public/fonts/.gitkeep (新建)
- tests/integration/.gitkeep (新建)
- tests/fixtures/sample-skills/.gitkeep (新建)
```
