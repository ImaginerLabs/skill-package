---
title: "Product Brief: Skill Manager"
status: "approved"
created: "2026-04-10"
updated: "2026-04-10"
inputs: ["用户对话记录", "现有 .codebuddy/skills/ 目录结构分析", "UI/UX 设计系统推荐", "Claude 官方 skill-creator 方法论"]
---

# 产品简报：Skill Manager — 本地 AI 技能管理器

## 执行摘要

AI Coding 时代，开发者积累了大量私人 Skill 技能文件（Markdown 格式的 Prompt 工程资产），散落在不同 IDE 的各自目录中。当开发者同时使用 CodeBuddy、Cursor、Windsurf 等多个 AI IDE 时，这些 Skill 文件无法统一管理、无法跨 IDE 同步，更无法组合编排成更强大的工作流。

**Skill Manager** 是一个面向个人开发者的本地 Web 应用，提供可视化的 Skill 浏览、分类管理、工作流编排和一键同步能力。它不是又一个编辑器——它是你私人 AI 技能仓库的**中控台**。项目采用公版 + Fork 模式，开发者 fork 后在自己的分支中维护个人配置和 Skill 资产，项目本身只提供纯粹的业务逻辑引擎。

## 问题

开发者在 AI Coding 实践中面临的核心痛点：

- **Skill 散落各处**：CodeBuddy 的 `.codebuddy/skills/`、Cursor 的 `.cursor/rules/`、Windsurf 的 `.windsurf/rules/` 等，每个 IDE 都有自己的 Skill 存放路径，手动同步极其痛苦
- **无法可视化浏览**：Skill 文件是 Markdown，只能在文件管理器中逐个打开查看，缺乏分类、搜索、场景化浏览的能力
- **无法组合编排**：单个 Skill 解决单个问题，但复杂工作流需要多个 Skill 按顺序协作，目前只能手动复制粘贴
- **导入导出困难**：在某个 IDE 中积累的好用 Skill，想迁移到另一个 IDE 需要手动操作，格式可能还不兼容

现状是：开发者要么放弃跨 IDE 同步，要么花大量时间手动维护——这两种选择都在浪费生产力。

## 解决方案

Skill Manager 提供四大核心能力：

### 1. 可视化 Skill 浏览（只读）
- 分类（Category）和场景（Scenario）两个维度浏览所有 Skill
- 支持搜索、筛选、标签过滤
- Markdown 渲染预览，YAML Frontmatter 元数据展示
- **不提供新建和编辑能力**——Skill 的创作应该在 IDE 中通过 Agent 完成，Web 只做管理

### 2. 工作流编排
- 通过可视化界面将多个已有 Skill 按顺序编排成工作流
- 编排结果基于**工作流标准模板**自动生成一个全新的标准 Skill 文件（`.md` 格式）
- 工作流 Skill 内部引用并组合其他 Skill 的能力，形成多步骤协作流程
- 用户在 UI 上选择 Skill 并排序，为每个 Step 填写描述，系统自动生成工作流文件

### 3. 一键同步到 IDE
- 预设各 IDE 的 Skill 存放路径（默认先支持 CodeBuddy）
- 用户可按 IDE 维度选择需要同步的 Skill 包
- 通过 Node.js 脚本执行实际的文件同步操作
- 提供配置页面自定义同步路径
- **V1 为单向同步（仓库 → IDE）**，仓库是 Single Source of Truth

### 4. 从 IDE 导入
- 根据预设路径扫描 IDE 中已有的 Skill 文件
- 展示发现的 Skill 列表，允许用户选择性导入
- 导入时需选择分类归属
- 支持清理 IDE 中的旧 Skill 文件
- 导入是独立的反向操作（IDE → 仓库），不属于"同步"范畴

## Skill 文件格式标准

### 基本格式

Skill 文件是 `.md` 文件（Markdown），采用 **YAML Frontmatter + Markdown 正文** 格式，兼容 Claude 官方 skill-creator 标准：

```markdown
---
name: skill-name
description: "Skill 的描述，包括触发条件和功能说明"
category: coding
tags: [react, typescript]
author: alex
version: 1.0.0
---

# Skill 标题

Skill 正文内容（纯 Markdown）...
```

### Frontmatter 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | Skill 唯一标识符（Claude 官方标准字段） |
| `description` | ✅ | Skill 描述，包括触发条件（Claude 官方标准字段） |
| `category` | ✅ | 分类归属（系统扩展字段，用于 Web 端分类浏览） |
| `tags` | ❌ | 标签数组（系统扩展字段，用于搜索和筛选） |
| `author` | ❌ | 作者（系统扩展字段） |
| `version` | ❌ | 版本号（系统扩展字段） |
| `type` | ❌ | 类型标识，工作流 Skill 为 `workflow`（系统扩展字段） |

### 工作流 Skill 格式

工作流 Skill 也是标准 `.md` 文件，通过 `type: workflow` 标识，正文中按 Step 引用其他 Skill：

```markdown
---
name: code-quality-workflow
description: "组合代码审查和测试覆盖的完整代码质量工作流。当用户需要对代码进行全面质量检查时使用。"
type: workflow
category: workflows
---

# 代码质量工作流

本工作流按顺序执行以下 Skill，完成完整的代码质量检查流程。

## Step 1: 代码审查

**使用 Skill:** `code-review`

执行全面的代码审查，检查代码风格、潜在 bug、性能问题等。
将审查结果作为上下文传递给下一步。

## Step 2: 测试覆盖分析

**使用 Skill:** `staged-test-coverage`

基于代码审查的结果，分析测试覆盖情况，
设计补充测试用例覆盖发现的薄弱环节。
```

### 格式说明

- **文件扩展名**：`.md`（不是 `.yaml`）
- **YAML Frontmatter**：文件头部被 `---` 包裹的元数据区域，使用 YAML 语法
- **Markdown 正文**：Frontmatter 之后的内容，是 Skill 的实际指令，使用 Markdown 语法
- **从 IDE 导入时**：如果原 Skill 缺少 `category` 字段，导入流程会要求用户选择分类

## 差异化优势

- **公版 + Fork 模式**：项目本身是纯业务逻辑引擎，用户 fork 后在自己的 Git 分支中维护个人配置和 Skill 资产。这意味着零服务器成本、完全私有、天然版本控制
- **只做管理不做编辑**：刻意不提供 Skill 编辑能力，避免与 IDE 内的 Agent 创作能力重复，保持产品边界清晰
- **标准化格式**：统一采用 YAML Frontmatter + Markdown 正文格式（`.md` 文件），兼容 Claude 官方 skill-creator 标准，确保跨 IDE 兼容性
- **工作流编排是唯一的创作入口**：通过编排组合已有 Skill 生成新的工作流 Skill，这是 Web 端唯一的"创建"能力，也是最有价值的差异化功能

## 目标用户

**主要用户：个人开发者**
- 同时使用多个 AI IDE 进行开发
- 积累了一定数量的私人 Skill/Prompt 资产
- 希望统一管理、跨 IDE 复用这些资产
- 技术水平中级以上，熟悉 Git 操作，能够 fork 和维护自己的分支

## 成功标准

| 指标 | 目标 |
|------|------|
| Skill 浏览体验 | 用户能在 3 秒内找到目标 Skill |
| 同步效率 | 一键完成 Skill 到目标 IDE 的同步，无需手动操作 |
| 工作流创建 | 用户能在 5 分钟内完成一个多 Skill 工作流编排 |
| 导入成功率 | 从 IDE 导入的 Skill 100% 保持格式完整性 |
| Fork 上手时间 | 新用户 fork 后 10 分钟内完成首次配置和使用 |

## 范围

### V1 包含
- React + TypeScript 前端 + Node.js + Express 后端（前后端分离）
- Skill 分类浏览、搜索、Markdown 预览
- 工作流编排器（顺序组合多个 Skill，基于标准模板自动生成工作流文件）
- CodeBuddy IDE 同步支持（默认路径 `.codebuddy/skills`）
- 从 CodeBuddy 导入 Skill（含分类选择）
- 本地 YAML 配置文件驱动
- 暗色主题 UI（开发者工具风格）

### V1 不包含
- Skill 在线编辑/创建（除工作流编排外）
- 多用户协作/团队功能
- 云端同步/远程服务器
- Cursor、Windsurf 等其他 IDE 支持（V2）
- Skill 市场/社区分享

## 项目目录结构

```
skill-package/
├── src/                    # 公版代码（不 gitignore）
│   ├── client/             # React 前端
│   └── server/             # Node.js 后端
├── skills/                 # 用户的 Skill 文件（用户 fork 后维护）
│   ├── coding/             # 分类目录
│   ├── writing/
│   └── workflows/          # 工作流 Skill
├── config/                 # 用户配置（YAML 格式）
│   ├── settings.yaml       # 全局设置（IDE 路径、同步偏好）
│   └── categories.yaml     # 分类定义
├── scripts/                # 同步脚本
└── .gitignore
```

**分离策略**：`src/` 是公版代码区，`skills/` 和 `config/` 是用户数据区。用户 fork 后主要在后两个目录操作，上游更新时 merge conflict 只会发生在 `src/` 中。

## 冷启动策略

不预置示例 Skill 包。首次使用的正确路径是：**从 IDE 导入已有 Skill → 在 Web 上分类管理**。Web 首页在空状态时展示引导流程："检测到你还没有 Skill，点击从 CodeBuddy 导入"。

## UI 信息架构

```
┌─────────────────────────────────────────────┐
│  Sidebar                │  Main Content      │
│  ┌───────────────────┐  │                    │
│  │ 🔍 搜索           │  │  Skill 卡片网格    │
│  ├───────────────────┤  │  ┌──┐ ┌──┐ ┌──┐   │
│  │ 📁 全部 Skills    │  │  │  │ │  │ │  │   │
│  │ 📁 Coding         │  │  └──┘ └──┘ └──┘   │
│  │ 📁 Writing        │  │  ┌──┐ ┌──┐ ┌──┐   │
│  │ 📁 Workflow       │  │  │  │ │  │ │  │   │
│  │ 📁 ...            │  │  └──┘ └──┘ └──┘   │
│  ├───────────────────┤  │                    │
│  │ ⚡ 工作流编排      │  │                    │
│  │ 🔄 同步管理       │  │                    │
│  │ ⚙️ 设置           │  │                    │
│  └───────────────────┘  │                    │
└─────────────────────────────────────────────┘
```

## 愿景

如果 V1 成功验证了核心价值，Skill Manager 将逐步演进为：

- **V2**：支持更多 IDE（Cursor、Windsurf、JetBrains 系列），提供 IDE 插件实现双向同步
- **V3**：工作流编排增强——支持条件分支、参数传递、变量绑定等高级逻辑
- **长期**：成为个人开发者的 AI 技能资产管理平台，可能扩展到团队协作场景，甚至形成 Skill 社区生态

## 技术方案概要

| 维度 | 选型 |
|------|------|
| 前端 | React + TypeScript + Tailwind CSS + React Router |
| 后端 | Node.js + Express |
| 数据存储 | 文件系统（`.md` Skill 文件 + `.yaml` 配置文件） |
| Frontmatter 解析 | `gray-matter` |
| Markdown 渲染 | `react-markdown` + `remark-gfm` |
| 文件监听 | `chokidar` |
| 同步机制 | Node.js `fs-extra`（文件复制，单向推送） |
| UI 风格 | 暗色主题，Code Dark (#0F172A) + Run Green (#22C55E) |
| 字体 | Fira Code（代码/标题）+ Fira Sans（正文） |
| 部署 | 本地运行（localhost） |

### 默认 IDE 路径配置

```yaml
# config/settings.yaml
sync:
  targets:
    codebuddy:
      name: "CodeBuddy"
      path: ".codebuddy/skills"
      enabled: true
```

## 决策记录

| # | 决策项 | 结论 | 状态 |
|---|--------|------|------|
| 1 | Skill 文件格式 | `.md` 文件（YAML Frontmatter + Markdown 正文），兼容 Claude 官方标准 | ✅ 已确认 |
| 2 | 项目配置格式 | 统一 YAML（独立的 `.yaml` 文件，与 Skill 文件的 Frontmatter 格式一致） | ✅ 已确认 |
| 3 | 工作流引用格式 | 正文中 `## Step N` + `**使用 Skill:** \`name\`` 引用，Frontmatter 中 `type: workflow` 标识 | ✅ 已确认 |
| 4 | 工作流模板 | 编排器内部输出模板，用户在 UI 编排后系统自动生成标准 `.md` 文件 | ✅ 已确认 |
| 5 | 同步方向 | V1 单向（仓库 → IDE），导入是独立反向操作 | ✅ 已确认 |
| 6 | 代码/数据分离 | `src/` 公版代码 + `skills/` 用户数据 + `config/` 用户配置，三区分离 | ✅ 已确认 |
| 7 | 冷启动 | 不预置示例，空状态引导用户从 IDE 导入 | ✅ 已确认 |
| 8 | 技术栈 | React + TS + Tailwind（前端）、Node.js + Express（后端） | ✅ 已确认 |
| 9 | UI 风格 | 暗色主题，Code Dark + Run Green，Fira Code/Sans 字体 | ✅ 已确认 |
| 10 | Skill 模板脚手架 | 不提供独立的空白 Skill 模板创建能力，Web 端不做编辑 | ✅ 已确认 |
