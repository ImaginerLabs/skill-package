---
name: tech-stack-detection
description: 当用户说「检测技术栈」「分析项目配置」「这个项目用了什么技术」「tech stack」「项目技术选型」「技术栈分析」「项目架构」「技术体系」「依赖分析」「技术栈检测」时触发。按照固定的文件读取顺序，逐步分析项目依赖、构建工具、框架、代码规范等配置，最终给出完整的技术栈结论。适用于前端项目、Node.js 项目、全栈项目的技术栈识别。
category: understand
---

# 前端项目技术栈检测

## 核心能力

给定一个前端项目路径，按照预定义的文件读取顺序，系统性地扫描项目配置文件，识别技术栈组成、版本信息、工程化配置，最终输出一份清晰的技术栈全景报告。

## 适用场景

- 接手新项目，快速了解技术选型
- 评估项目升级/迁移的可行性
- 统一团队对项目技术栈的认知
- 排查构建/运行问题前，先了解工具链配置
- 技术方案评审前的背景调研
- 团队知识传递与项目交接

## 关联技能

| 技能名称               | 协作关系 | 使用场景                                   |
| ---------------------- | -------- | ------------------------------------------ |
| `context-learning`     | 前置技能 | 检测技术栈后，深入理解某个模块的实现逻辑   |
| `staged-code-review`   | 配合使用 | 技术栈检测后，按对应技术规则审查暂存区代码 |
| `frontend-code-review` | 配合使用 | 了解技术栈后，进行针对性的代码质量检查     |
| `code-comment-writer`  | 后续技能 | 检测技术栈后，为代码添加符合项目风格的注释 |

---

## 文件读取顺序

按以下优先级**依次读取**，每读取一个文件即提取关键信息，直到获得足够的结论：

### 第一层：项目基础信息

| 顺序 | 文件                                                 | 提取目标                                      |
| ---- | ---------------------------------------------------- | --------------------------------------------- |
| 1    | `package.json`                                       | 框架、核心依赖、devDependencies、scripts 命令 |
| 2    | `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` | 包管理器类型（npm / yarn / pnpm）             |

### 第二层：构建工具配置

| 顺序 | 文件                                       | 提取目标                             |
| ---- | ------------------------------------------ | ------------------------------------ |
| 3    | `vite.config.ts` / `vite.config.js`        | 构建工具（Vite）、插件、alias、proxy |
| 4    | `webpack.config.js` / `webpack.config.ts`  | 构建工具（Webpack）、loader、plugin  |
| 5    | `next.config.js` / `next.config.ts`        | Next.js 配置、SSR/SSG 模式           |
| 6    | `craco.config.js` / `react-scripts`（CRA） | CRA 项目标识                         |
| 7    | `rollup.config.js`                         | 构建工具（Rollup）                   |

### 第三层：语言与类型配置

| 顺序 | 文件                                   | 提取目标                                |
| ---- | -------------------------------------- | --------------------------------------- |
| 8    | `tsconfig.json` / `tsconfig.base.json` | 是否使用 TypeScript、编译目标、路径别名 |
| 9    | `babel.config.js` / `.babelrc`         | Babel 预设、插件（是否支持装饰器等）    |

### 第四层：代码规范配置

| 顺序 | 文件                                              | 提取目标                        |
| ---- | ------------------------------------------------- | ------------------------------- |
| 10   | `.eslintrc` / `.eslintrc.js` / `eslint.config.js` | ESLint 规则集、是否有自定义规则 |
| 11   | `.prettierrc` / `prettier.config.js`              | 代码格式化配置                  |
| 12   | `stylelint.config.js` / `.stylelintrc`            | CSS 规范检查                    |
| 13   | `.editorconfig`                                   | 编辑器统一配置                  |

### 第五层：Git 与提交规范

| 顺序 | 文件                   | 提取目标                                 |
| ---- | ---------------------- | ---------------------------------------- |
| 14   | `.husky/` 目录         | Git Hooks 配置（pre-commit、commit-msg） |
| 15   | `commitlint.config.js` | 提交信息规范                             |
| 16   | `.gitignore`           | 忽略规则（辅助判断构建产物目录）         |

### 第六层：环境与部署配置

| 顺序 | 文件                                            | 提取目标                     |
| ---- | ----------------------------------------------- | ---------------------------- |
| 17   | `.env` / `.env.development` / `.env.production` | 环境变量、API 地址、特性开关 |
| 18   | `Dockerfile` / `docker-compose.yml`             | 容器化部署方式               |
| 19   | `nginx.conf`                                    | 部署服务器配置、路由规则     |

> **读取策略**：文件不存在则跳过，不报错。每层读取完毕后，若已能确定核心技术栈，可跳过后续层级，直接输出结论。

---

## 技术栈识别规则

### 框架识别（来自 package.json dependencies）

| 关键包          | 识别结论                             |
| --------------- | ------------------------------------ |
| `react`         | React 项目                           |
| `vue`           | Vue 项目（结合版本区分 Vue2 / Vue3） |
| `next`          | Next.js（React SSR/SSG）             |
| `nuxt`          | Nuxt.js（Vue SSR/SSG）               |
| `@angular/core` | Angular 项目                         |
| `svelte`        | Svelte 项目                          |
| `@tarojs/taro`  | Taro 小程序项目                      |
| `remix`         | Remix（React 全栈框架）              |

### 构建工具识别

| 关键包/文件             | 识别结论                |
| ----------------------- | ----------------------- |
| `vite` in devDeps       | Vite                    |
| `webpack` in devDeps    | Webpack                 |
| `react-scripts` in deps | CRA（Create React App） |
| `@vue/cli-service`      | Vue CLI                 |
| `turbo`                 | Turborepo（Monorepo）   |
| `rsbuild`               | Rspack（Rust 构建工具） |

### 状态管理识别

| 关键包                       | 识别结论     |
| ---------------------------- | ------------ |
| `redux` / `@reduxjs/toolkit` | Redux        |
| `zustand`                    | Zustand      |
| `mobx`                       | MobX         |
| `pinia`                      | Pinia（Vue） |
| `jotai` / `recoil`           | 原子状态管理 |
| `valtio`                     | Valtio       |
| `xstate`                     | 状态机管理   |

### CSS 方案识别

| 关键包/文件                               | 识别结论     |
| ----------------------------------------- | ------------ |
| `tailwindcss`                             | Tailwind CSS |
| `styled-components` / `@emotion/react`    | CSS-in-JS    |
| `sass` / `less`                           | 预处理器     |
| `@mui/material` / `antd` / `@arco-design` | UI 组件库    |
| `@chakra-ui/react`                        | Chakra UI    |
| `unocss`                                  | UnoCSS       |

### 测试框架识别

| 关键包                   | 识别结论       |
| ------------------------ | -------------- |
| `jest` / `vitest`        | 单元测试框架   |
| `@testing-library/react` | React 测试工具 |
| `cypress` / `playwright` | E2E 测试框架   |
| `@storybook/react`       | 组件文档工具   |

---

## 输出格式

```markdown
## 技术栈检测报告：`[项目名/路径]`

### 📋 概览

- **项目类型**：Web 应用 / 小程序 / SSR 应用 / Monorepo
- **主要框架**：[框架名称] [版本]
- **构建工具**：[工具名称] [版本]
- **语言**：TypeScript / JavaScript

---

### 🎯 核心技术栈

| 类别      | 技术选型                   | 版本  | 备注 |
| --------- | -------------------------- | ----- | ---- |
| 框架      | React / Vue / ...          | x.x.x |      |
| 构建工具  | Vite / Webpack / ...       | x.x.x |      |
| 语言      | TypeScript / JavaScript    | x.x   |      |
| 包管理器  | pnpm / yarn / npm          | x.x.x |      |
| 状态管理  | Zustand / Redux / ...      | x.x.x | 如有 |
| 路由      | react-router / vue-router  | x.x.x | 如有 |
| CSS 方案  | Tailwind / CSS-in-JS / ... | —     |      |
| UI 组件库 | Ant Design / MUI / ...     | x.x.x | 如有 |
| 测试框架  | Jest / Vitest / ...        | x.x.x | 如有 |

---

### ⚙️ 工程化配置

| 工具       | 状态      | 备注                               |
| ---------- | --------- | ---------------------------------- |
| ESLint     | ✅ 已配置 | 使用 xxx 规则集                    |
| Prettier   | ✅ 已配置 | —                                  |
| Husky      | ✅ 已配置 | pre-commit + commit-msg            |
| TypeScript | ✅ 已配置 | target: ESNext                     |
| 环境变量   | ✅ 已配置 | .env.development / .env.production |
| Docker     | ✅ 已配置 | 多阶段构建                         |

---

### 📜 关键 Scripts

| 命令            | 说明           | 备注         |
| --------------- | -------------- | ------------ |
| `npm run dev`   | 启动开发服务器 | 端口: 3000   |
| `npm run build` | 生产构建       | 输出到 dist/ |
| `npm run lint`  | 代码检查       | —            |
| `npm run test`  | 运行测试       | —            |

---

### 🔗 依赖关系图
```

项目依赖结构：
├── 核心框架：React 18.x
│ ├── 状态管理：Zustand
│ ├── 路由：react-router-dom
│ └── UI 库：Ant Design 5.x
├── 构建工具：Vite 5.x
│ ├── 插件：@vitejs/plugin-react
│ └── CSS：Tailwind CSS
└── 工程化：
├── ESLint + Prettier
├── Husky + commitlint
└── TypeScript 5.x

```

---

### 💡 配置亮点 & 注意事项

**亮点：**
- [值得关注的优秀配置实践]

**注意事项：**
- [需要关注的风险点或待优化项]

**潜在问题：**
- [配置冲突或版本兼容性问题]

---

### 📁 检测依据（读取的文件）

**已读取：**
- `package.json` ✅
- `vite.config.ts` ✅
- `tsconfig.json` ✅

**未找到：**
- `webpack.config.js` ⚠️ 未配置
- `.eslintrc` ⚠️ 未配置（建议添加）

---

### 🚀 下一步建议

1. [基于检测结果的改进建议]
2. [技术栈升级或优化方向]
3. [工程化完善建议]
```

---

## 输出原则

- **结论优先**：先给出核心技术栈表格，再展开细节。
- **版本明确**：尽量从 `package.json` 中提取精确版本号。
- **缺失即跳过**：文件不存在不报错，不猜测，直接跳过。
- **异常标注**：若发现配置冲突或不常见组合（如同时存在多个构建工具），在「注意事项」中明确指出。
- **不展开源码**：只读配置文件，不深入业务代码。
- **可操作建议**：输出结果应包含具体的下一步行动建议。

---

## 最佳实践

### 1. 快速检测模式

当用户只需要了解核心技术栈时，可以只读取第一层和第二层文件，快速给出结论：

```bash
# 优先读取的核心文件
1. package.json
2. tsconfig.json
3. vite.config.ts / webpack.config.js
```

### 2. 深度检测模式

当需要进行技术方案评审或迁移评估时，应完整读取所有层级文件，输出详细报告。

### 3. 对比检测模式

当用户需要对比多个项目的技术栈时，可以为每个项目生成统一格式的报告，便于横向对比。

### 4. 版本兼容性检查

在检测技术栈时，应关注以下常见兼容性问题：

- React 18 与 React 17 的 Breaking Changes
- Vue 3 与 Vue 2 的 API 差异
- TypeScript 版本与框架版本的兼容性
- Node.js 版本与构建工具的要求

---

## 常见问题处理

| 问题                | 处理方式                                          |
| ------------------- | ------------------------------------------------- |
| package.json 不存在 | 提示非 Node.js 项目，建议检查是否为其他类型项目   |
| 多个框架依赖共存    | 标注为「混合项目」，列出所有框架并说明可能的原因  |
| 版本号缺失          | 使用 `latest` 或 `unknown` 标注，建议用户手动确认 |
| 配置文件格式异常    | 尝试解析，失败则跳过并在报告中标注                |

---

## 示例输出

### 示例 1：React + Vite 项目

```markdown
## 技术栈检测报告：`my-react-app`

### 📋 概览

- **项目类型**：Web 应用（SPA）
- **主要框架**：React 18.2.0
- **构建工具**：Vite 5.0.0
- **语言**：TypeScript 5.3.0

### 🎯 核心技术栈

| 类别      | 技术选型     | 版本   |
| --------- | ------------ | ------ |
| 框架      | React        | 18.2.0 |
| 构建工具  | Vite         | 5.0.0  |
| 语言      | TypeScript   | 5.3.0  |
| 包管理器  | pnpm         | 8.12.0 |
| 状态管理  | Zustand      | 4.4.0  |
| CSS 方案  | Tailwind CSS | 3.4.0  |
| UI 组件库 | Ant Design   | 5.12.0 |

### 💡 配置亮点

- 采用 Vite + React + TypeScript 现代化技术栈
- 使用 Zustand 轻量级状态管理
- Tailwind CSS 实用优先的样式方案
```

### 示例 2：Taro 小程序项目

```markdown
## 技术栈检测报告：`my-taro-app`

### 📋 概览

- **项目类型**：小程序（多端）
- **主要框架**：Taro 3.6.0
- **构建工具**：Webpack 5
- **语言**：TypeScript 5.0.0

### 🎯 核心技术栈

| 类别     | 技术选型      | 版本   |
| -------- | ------------- | ------ |
| 框架     | Taro          | 3.6.0  |
| UI 框架  | @tarojs/ui    | 3.6.0  |
| 语言     | TypeScript    | 5.0.0  |
| 包管理器 | npm           | 10.2.0 |
| 状态管理 | Redux Toolkit | 2.0.0  |
| CSS 方案 | Sass          | 1.69.0 |

### 💡 注意事项

- 小程序项目需关注分包体积限制
- 建议使用 Taro UI 或 NutUI 作为组件库
```
