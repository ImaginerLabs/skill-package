# Skill Manager / Skill 管理器

> 本地 AI Skill 文件的浏览、编排与 IDE 同步工具  
> A local tool for browsing, orchestrating, and syncing AI Skill files to your IDE

---

## 简介 / Introduction

**Skill Manager** 是一个运行在本地的全栈 Web 应用，帮助你管理 AI 编程助手（如 CodeBuddy）所使用的 Skill 文件。你可以通过它浏览、搜索、编排工作流，并将 Skill 一键同步到 IDE。

**Skill Manager** is a locally-running full-stack web application for managing AI coding assistant Skill files (e.g., CodeBuddy). Browse, search, orchestrate workflows, and sync Skills to your IDE with one click.

---

## 功能特性 / Features

| 功能          | 说明                                           | Feature  | Description                                          |
| ------------- | ---------------------------------------------- | -------- | ---------------------------------------------------- |
| 📚 Skill 浏览 | 分类目录树 + 卡片/列表双视图 + Markdown 预览   | Browse   | Category tree, grid/list view, Markdown preview      |
| 🔍 模糊搜索   | Fuse.js 前端内存搜索，< 200ms 响应             | Search   | Fuse.js in-memory fuzzy search, < 200ms              |
| 🔗 工作流编排 | 拖拽排序，将多个 Skill 组合为工作流文件        | Workflow | Drag-and-drop orchestration, generate workflow `.md` |
| 🔄 IDE 同步   | 将选中 Skill 推送到 IDE 目录（支持 CodeBuddy） | Sync     | Push selected Skills to IDE directory                |
| 📥 IDE 导入   | 从 IDE 目录扫描并导入 Skill 到仓库             | Import   | Scan and import Skills from IDE directory            |
| ⚙️ 配置管理   | 管理 IDE 路径、分类定义等配置                  | Settings | Manage IDE paths, category definitions               |
| ⌨️ 键盘快捷键 | `⌘K` 全局搜索，`Alt+↑/↓` 步骤排序              | Hotkeys  | `⌘K` command palette, `Alt+↑/↓` step reorder         |

---

## 技术栈 / Tech Stack

| 层级     | 技术                                  | Layer    | Tech                                 |
| -------- | ------------------------------------- | -------- | ------------------------------------ |
| 前端框架 | React 19 + TypeScript                 | Frontend | React 19 + TypeScript                |
| 构建工具 | Vite 8                                | Build    | Vite 8                               |
| 样式     | Tailwind CSS v4 + shadcn/ui           | Styling  | Tailwind CSS v4 + shadcn/ui          |
| 状态管理 | Zustand 5                             | State    | Zustand 5                            |
| 后端     | Node.js + Express 5                   | Backend  | Node.js + Express 5                  |
| 数据存储 | 文件系统（`.md` + `.yaml`，无数据库） | Storage  | File system (`.md` + `.yaml`, no DB) |
| 搜索     | Fuse.js                               | Search   | Fuse.js                              |
| 拖拽     | @dnd-kit                              | DnD      | @dnd-kit                             |
| 测试     | Vitest + Playwright                   | Testing  | Vitest + Playwright                  |

---

## 快速开始 / Quick Start

### 环境要求 / Requirements

- Node.js >= 18
- npm >= 9

### 安装与启动 / Install & Run

```bash
# 克隆仓库 / Clone the repo
git clone https://github.com/your-username/skill-package.git
cd skill-package

# 安装依赖 / Install dependencies
npm install

# 启动开发服务器（前后端同时启动）/ Start dev server (client + server)
npm run dev
```

浏览器访问 / Open in browser: **http://localhost:5173**

### 生产模式 / Production

```bash
# 构建 / Build
npm run build

# 启动（单进程，端口 3000）/ Start (single process, port 3000)
npm start
```

### 全局命令 / Global CLI

```bash
# 全局安装后可直接启动 / After global install
npm link
skill-manager
```

---

## 项目结构 / Project Structure

```
skill-package/
├── src/                    # 前端源码 / Frontend source
│   ├── components/         # React 组件（按功能域划分）/ Components (feature-based)
│   │   ├── ui/             # shadcn/ui 基础组件 / Base UI components
│   │   ├── layout/         # 布局组件 / Layout components
│   │   ├── skills/         # Skill 浏览 / Skill browsing
│   │   ├── workflow/       # 工作流编排 / Workflow orchestration
│   │   ├── sync/           # IDE 同步 / IDE sync
│   │   ├── import/         # 导入管理 / Import management
│   │   ├── settings/       # 设置 / Settings
│   │   └── shared/         # 共享组件 / Shared components
│   ├── stores/             # Zustand 状态管理 / State management
│   ├── hooks/              # 自定义 Hooks / Custom hooks
│   └── lib/                # 工具库 / Utilities
├── server/                 # 后端源码 / Backend source
│   ├── routes/             # API 路由 / API routes
│   ├── services/           # 业务逻辑 / Business logic
│   ├── utils/              # 工具函数 / Utilities
│   └── middleware/         # Express 中间件 / Middleware
├── shared/                 # 前后端共享类型 / Shared types & schemas
├── skills/                 # Skill 文件目录 / Skill files
│   ├── coding/
│   ├── writing/
│   ├── devops/
│   └── workflows/
├── config/                 # 用户配置 / User config (YAML)
├── tests/                  # 集成测试 & E2E / Integration & E2E tests
└── bin/                    # CLI 入口 / CLI entry
```

---

## 开发指南 / Development

### 常用命令 / Scripts

```bash
npm run dev           # 启动开发服务器 / Start dev server
npm run build         # 构建生产版本 / Build for production
npm run typecheck     # TypeScript 类型检查 / Type check
npm run lint          # ESLint 检查 / Lint
npm run lint:fix      # 自动修复 lint 问题 / Auto-fix lint
npm run format        # Prettier 格式化 / Format code
npm run test          # 运行单元测试（watch 模式）/ Run unit tests (watch)
npm run test:run      # 运行单元测试（单次）/ Run unit tests (once)
npm run test:coverage # 测试覆盖率报告 / Coverage report
npm run test:e2e      # 运行 E2E 测试 / Run E2E tests
npm run test:all      # 运行全部测试 / Run all tests
```

### API 概览 / API Overview

```
GET    /api/skills              # 获取所有 Skill 列表 / List all Skills
GET    /api/skills/:id          # 获取 Skill 详情 / Get Skill detail
PUT    /api/skills/:id/meta     # 更新 Skill 元数据 / Update metadata
DELETE /api/skills/:id          # 删除 Skill / Delete Skill
GET    /api/categories          # 获取分类列表 / List categories
GET    /api/workflows           # 获取工作流列表 / List workflows
POST   /api/sync/push           # 推送到 IDE / Push to IDE
POST   /api/sync/import         # 从 IDE 导入 / Import from IDE
GET    /api/config              # 读取配置 / Get config
POST   /api/refresh             # 刷新 Skill 缓存 / Refresh cache
GET    /api/health              # 健康检查 / Health check
```

---

## Skill 文件格式 / Skill File Format

每个 Skill 是一个带有 YAML Frontmatter 的 Markdown 文件：

Each Skill is a Markdown file with YAML Frontmatter:

```markdown
---
name: my-skill
description: 这个 Skill 的功能描述
category: coding
tags: [review, typescript]
author: Alex
version: 1.0.0
---

# Skill 正文内容

在这里编写 Skill 的具体指令和说明...
```

---

## 许可证 / License

MIT © Alex
