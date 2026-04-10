---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
inputDocuments: ["product-brief-skill-package.md"]
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: developer_tool
  domain: general
  complexity: low
  projectContext: greenfield
---

# Product Requirements Document — Skill Manager

**Author:** Alex
**Date:** 2026-04-10

---

## Executive Summary

Skill Manager 是一个面向个人开发者的本地 Web 应用，解决 AI Coding 时代的核心资产管理问题：**私人 Skill 文件散落在不同 IDE 中，无法统一管理、跨 IDE 同步和智能编排。**

开发者在 CodeBuddy、Cursor、Windsurf 等多个 AI IDE 中积累了大量 Skill 技能文件（Markdown 格式的 Prompt 工程资产），但每个 IDE 都有独立的存放路径（`.codebuddy/skills/`、`.cursor/rules/`、`.windsurf/rules/`），手动同步极其痛苦。Skill Manager 提供可视化浏览、分类管理、工作流编排和一键同步四大核心能力，成为开发者私人 AI 技能仓库的**中控台**。

**目标用户：** 同时使用多个 AI IDE 的个人开发者，技术水平中级以上，熟悉 Git 操作。

**核心洞察：** Skill 文件是开发者最有价值的 Prompt 工程资产，但目前没有任何工具把它们当作"资产"来管理。

### What Makes This Special

- **公版 + Fork 模式**：项目本身是纯业务逻辑引擎，用户 fork 后在自己的 Git 分支中维护个人配置和 Skill 资产。零服务器成本、完全私有、天然版本控制。
- **只做管理不做编辑**：不提供 Skill 正文编辑能力（正文创作在 IDE 中通过 Agent 完成），但允许编辑 Frontmatter 元数据（分类、标签等），保持管理效率。
- **工作流编排是唯一的创作入口**：通过编排组合已有 Skill 生成新的工作流 Skill，这是 Web 端唯一的"创建"能力。
- **标准化格式**：统一采用 YAML Frontmatter + Markdown 正文格式（`.md` 文件），兼容 Claude 官方 skill-creator 标准。

## Project Classification

| 维度 | 值 |
|------|-----|
| 项目类型 | Developer Tool（开发者工具） |
| 领域 | General（通用软件开发） |
| 复杂度 | Low（标准需求、基本安全） |
| 项目上下文 | Greenfield（全新项目） |

---

## Success Criteria

### User Success

- **Skill 发现效率**：用户能在 3 秒内通过分类浏览或搜索找到目标 Skill
- **同步零摩擦**：一键完成 Skill 到目标 IDE 的同步，无需手动文件操作
- **工作流编排直觉化**：用户能在 5 分钟内完成一个多 Skill 工作流编排
- **导入无损**：从 IDE 导入的 Skill 100% 保持格式完整性（YAML Frontmatter + Markdown 正文）
- **冷启动顺畅**：新用户 fork 后 10 分钟内完成首次配置和使用

### Business Success

- **3 个月目标**：至少 30 个活跃 Fork（有实际 commit 活动），证明公版 + Fork 模式可行
- **6 个月目标**：至少 100 个活跃 Fork，Fork 用户月均 commit ≥ 2 次
- **12 个月目标**：支持 3+ IDE，形成跨 IDE Skill 管理的事实标准

### Technical Success

- **本地启动时间** < 3 秒（`npm start` 到页面可交互）
- **Skill 文件解析成功率** 100%（所有符合 YAML Frontmatter + Markdown 格式的文件）
- **同步操作耗时** < 2 秒（100 个 Skill 文件的批量同步）
- **零外部依赖**：不依赖任何云服务或远程 API，纯本地运行

### Measurable Outcomes

| 指标 | MVP 目标 | 测量方式 |
|------|----------|----------|
| Skill 搜索响应时间 | < 200ms（500 个 Skill 规模） | 前端性能监控 |
| 页面首次加载时间 | < 2s | Lighthouse |
| 同步成功率 | 100% | 同步日志 |
| Frontmatter 解析成功率 | 100% | 单元测试 |
| 工作流生成正确率 | 100% | 生成文件格式校验 |

---

## Product Scope

### MVP — Minimum Viable Product

**核心价值交付：** 让开发者能在一个 Web 界面中浏览所有 Skill，并一键同步到 CodeBuddy。

MVP 包含：
1. **Skill 可视化浏览**：分类目录树 + 卡片网格 + Markdown 渲染预览
2. **搜索与筛选**：按名称、描述、标签搜索，按分类筛选
3. **工作流编排器**：选择 Skill → 排序 → 填写描述 → 自动生成工作流 `.md` 文件
4. **CodeBuddy 同步**：一键将选定 Skill 推送到 `.codebuddy/skills/` 目录
5. **CodeBuddy 导入**：扫描 `.codebuddy/skills/` 目录，选择性导入并分类
6. **YAML 配置驱动**：`settings.yaml` + `categories.yaml` 管理全局配置
7. **暗色主题 UI**：开发者工具风格，Code Dark + Run Green

### Growth Features (Post-MVP)

- 支持 Cursor IDE（`.cursor/rules/`）
- 支持 Windsurf IDE（`.windsurf/rules/`）
- Skill 依赖关系可视化图谱
- 工作流编排增强：Step 间参数传递描述
- 批量操作：批量同步、批量分类
- Skill 版本历史（基于 Git diff）

### Vision (Future)

- 支持 JetBrains 系列 IDE
- 工作流编排支持条件分支和并行步骤
- IDE 插件实现双向实时同步
- Skill 社区市场（可选的公共分享）
- 团队协作模式

---

## User Journeys

### Journey 1: Alex — 资深全栈开发者的首次使用

**背景：** Alex 是一名有 8 年经验的全栈开发者，同时使用 CodeBuddy 和 Cursor 进行 AI 辅助开发。他在 CodeBuddy 中积累了 30+ 个私人 Skill，但每次切换到 Cursor 时都要手动复制，已经忍受了 3 个月。

**Opening Scene：** Alex 在 GitHub 上发现了 Skill Manager，fork 到自己的账号，`git clone` 后运行 `npm install && npm start`。浏览器打开 `localhost:3000`，看到一个暗色主题的空白界面，提示"检测到你还没有 Skill，点击从 CodeBuddy 导入"。

**Rising Action：** Alex 点击导入按钮，系统扫描 `~/.codebuddy/skills/` 目录，发现 32 个 Skill 文件。列表展示每个 Skill 的名称和描述。Alex 逐个选择需要导入的 Skill，为每个选择分类（coding、writing、workflow 等）。导入完成后，Web 界面立刻展示了分类整齐的 Skill 卡片网格。

**Climax：** Alex 点击一个 Skill 卡片，Markdown 渲染的预览完美展示了 Skill 的全部内容。他在搜索框输入"review"，瞬间筛选出 3 个代码审查相关的 Skill。这一刻他意识到：终于有一个地方能一目了然地看到自己所有的 AI 技能资产了。

**Resolution：** Alex 的 30+ 个 Skill 现在统一管理在 Skill Manager 中，通过 Git 版本控制。他再也不用担心 Skill 丢失或版本混乱。

### Journey 2: Alex — 工作流编排创建

**背景：** Alex 发现自己每次做代码提交前都要手动依次调用"代码审查"、"测试覆盖分析"、"提交信息生成"三个 Skill。他想把这三个步骤编排成一个自动化工作流。

**Opening Scene：** Alex 在侧边栏点击"⚡ 工作流编排"，进入编排器界面。

**Rising Action：** 编排器左侧展示所有可用的 Skill 列表。Alex 依次将 `code-review`、`staged-test-coverage`、`staged-fast-commit` 拖入右侧的工作流画布。他为每个 Step 填写简短描述："执行全面代码审查" → "分析测试覆盖并补充用例" → "生成规范化提交信息"。

**Climax：** Alex 点击"生成工作流"，系统自动生成一个标准的工作流 `.md` 文件，Frontmatter 中 `type: workflow`，正文中按 Step 引用每个 Skill。预览界面完美展示了生成的工作流文件。

**Resolution：** 新的工作流 Skill 自动保存到 `skills/workflows/` 目录，下次 Alex 只需调用这一个工作流 Skill，就能自动执行完整的代码提交前检查流程。

### Journey 3: Alex — 一键同步到 IDE

**背景：** Alex 在 Skill Manager 中整理好了所有 Skill，现在需要把它们同步到 CodeBuddy 的工作项目中。

**Opening Scene：** Alex 在侧边栏点击"🔄 同步管理"，进入同步配置界面。

**Rising Action：** 界面展示已配置的 IDE 目标（CodeBuddy，路径 `.codebuddy/skills`）。Alex 看到一个 Skill 选择列表，可以勾选需要同步的 Skill。他全选了 coding 分类和新创建的工作流 Skill。

**Climax：** Alex 点击"同步"按钮，进度条快速推进，2 秒内 35 个 Skill 文件全部复制到目标路径。同步日志显示"35/35 成功，0 失败"。

**Resolution：** Alex 打开 CodeBuddy，所有同步的 Skill 立刻可用。以后每次在 Skill Manager 中调整 Skill 后，只需一键同步即可更新 IDE 中的版本。

### Journey 4: 系统管理 — 配置与维护

**背景：** Alex 需要添加一个新的 Skill 分类，并修改 CodeBuddy 的同步路径。

**Opening Scene：** Alex 在侧边栏点击"⚙️ 设置"，进入配置页面。

**Rising Action：** 配置页面展示两个区域：分类管理和 IDE 同步路径。Alex 在分类管理中添加了一个新分类"devops"。然后修改 CodeBuddy 的同步路径为项目特定路径。

**Resolution：** 配置自动保存到 `config/settings.yaml` 和 `config/categories.yaml`，通过 Git 版本控制。Alex 的个人配置安全地保存在自己的 fork 分支中。

### Journey Requirements Summary

| 旅程 | 揭示的核心能力 |
|------|----------------|
| 首次使用 | IDE 扫描、Skill 导入、分类选择、空状态引导 |
| 工作流编排 | Skill 选择器、排序、描述编辑、工作流文件生成 |
| 一键同步 | IDE 目标配置、Skill 选择、批量文件复制、同步日志 |
| 配置维护 | 分类 CRUD、IDE 路径配置、YAML 配置读写 |

---

## Developer Tool Specific Requirements

### Project-Type Overview

Skill Manager 是一个本地运行的开发者工具，核心是文件系统操作（读取、解析、复制 Markdown 文件）和 Web 可视化界面。不涉及云服务、用户认证或数据库。

### Technical Architecture Considerations

**前后端分离架构：**
- 前端：React + TypeScript SPA，通过 REST API 与后端通信
- 后端：Node.js + Express，提供 Skill CRUD API、同步 API、配置 API
- 数据层：文件系统（`.md` Skill 文件 + `.yaml` 配置文件），无数据库

**文件系统操作：**
- Skill 文件解析：`gray-matter` 解析 YAML Frontmatter + Markdown 正文
- 文件监听：`chokidar` 监听 `skills/` 目录变化，实时更新 Web 界面
- 文件同步：`fs-extra` 执行文件复制操作

**IDE 路径管理：**
- 默认支持 CodeBuddy：`.codebuddy/skills/`
- 路径配置存储在 `config/settings.yaml`
- 同步脚本支持绝对路径和相对路径

### Implementation Considerations

- **跨平台兼容**：文件路径处理需兼容 macOS、Windows、Linux
- **文件编码**：统一 UTF-8，处理 BOM 标记
- **大文件处理**：Skill 文件通常 < 50KB，无需分页或流式处理
- **并发安全**：单用户本地应用，无并发写入风险

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach：** Problem-Solving MVP — 解决"Skill 散落各处无法统一管理"这个核心痛点。

**Resource Requirements：** 1 名全栈开发者，预计 2-3 周完成 MVP。

### MVP Feature Set (Phase 1)

**Core User Journeys Supported：**
- ✅ 首次使用（导入 + 浏览）
- ✅ 工作流编排
- ✅ 一键同步到 CodeBuddy
- ✅ 基础配置管理

**Must-Have Capabilities：**
1. Skill 文件解析（YAML Frontmatter + Markdown）
2. 分类目录浏览 + 卡片网格展示
3. 搜索（名称、描述、标签）
4. Markdown 渲染预览
5. 工作流编排器（选择 → 排序 → 生成）
6. CodeBuddy 同步（仓库 → IDE，单向）
7. CodeBuddy 导入（IDE → 仓库）
8. YAML 配置读写
9. 暗色主题 UI

### Post-MVP Features

**Phase 2 (Growth)：**
- Cursor / Windsurf IDE 支持
- Skill 依赖关系图谱
- 批量操作
- 工作流参数传递

**Phase 3 (Expansion)：**
- JetBrains IDE 支持
- 条件分支工作流
- IDE 插件双向同步
- 社区市场

### Risk Mitigation Strategy

**Technical Risks：**
- 不同 IDE 的 Skill 格式差异 → V1 只支持 CodeBuddy，格式统一为 YAML Frontmatter + Markdown
- 文件系统权限问题 → 提供清晰的错误提示和权限检查

**Market Risks：**
- 开发者是否真的需要跨 IDE 同步 → MVP 快速验证，通过 GitHub Star 和 Fork 数量衡量
- 公版 + Fork 模式是否被接受 → 提供详细的 README 和快速上手指南

---

## Functional Requirements

### Skill 浏览与发现

- FR1: 用户可以按分类目录树浏览所有 Skill
- FR2: 用户可以在卡片网格视图中查看 Skill 列表，每张卡片展示名称、描述和分类标签
- FR3: 用户可以点击 Skill 卡片查看完整的 Markdown 渲染预览
- FR4: 用户可以通过关键词搜索 Skill（模糊匹配名称、描述、标签字段，多关键词以空格分隔，取 AND 逻辑）
- FR5: 用户可以按分类筛选 Skill 列表
- FR6: 用户可以查看 Skill 的 YAML Frontmatter 元数据（名称、描述、分类、标签、类型）
- FR7: 系统在 Skill 列表为空时展示引导流程，提示用户从 IDE 导入

### 工作流编排

- FR8: 用户可以从已有 Skill 列表中选择多个 Skill 加入工作流
- FR9: 用户可以通过拖拽调整工作流中 Skill 的执行顺序
- FR10: 用户可以为工作流中的每个 Step 填写描述文字
- FR11: 用户可以为工作流设置名称和整体描述
- FR12: 系统根据编排结果自动生成标准格式的工作流 `.md` 文件（Frontmatter 含 `type: workflow`，正文含 `## Step N` + `**使用 Skill:** \`name\``）
- FR13: 用户可以预览生成的工作流文件内容
- FR14: 生成的工作流文件自动保存到 `skills/workflows/` 目录
- FR14b: 用户可以从工作流编排中移除已添加的 Step
- FR14c: 用户可以删除已创建的工作流 Skill
- FR14d: 用户可以编辑已创建的工作流（重新打开编排器，修改步骤顺序、添加/移除步骤、修改描述），编辑后覆盖保存原工作流文件

### IDE 同步

- FR15: 用户可以查看已配置的 IDE 同步目标列表
- FR16: 用户可以选择需要同步的 Skill（支持按分类批量选择）
- FR17: 用户可以一键将选定的 Skill 文件扁平化复制到目标 IDE 的 Skill 目录（不保留分类子目录结构，因为 IDE 通常使用扁平目录）
- FR17b: 同步目标路径为用户配置的**绝对路径**（指向具体项目的 IDE Skill 目录），用户可配置多个项目路径
- FR17c: 当目标目录中已存在同名 Skill 文件时，系统默认覆盖并在同步日志中标注
- FR17d: 同步前系统检测源端是否存在跨分类同名文件（如 `coding/utils.md` 和 `devops/utils.md`），若存在则提示用户处理冲突后再同步，防止扁平化复制时意外覆盖
- FR18: 系统在同步完成后展示同步结果（成功数、覆盖数、失败数、详细日志）
- FR19: 系统在同步前检查目标路径是否存在，不存在时提示用户并提供自动创建选项

### IDE 导入

- FR20: 用户可以触发扫描指定 IDE 的 Skill 目录
- FR21: 系统展示扫描发现的 Skill 文件列表（名称、描述、文件路径）
- FR22: 用户可以选择需要导入的 Skill 文件
- FR23: 用户在导入时为 Skill 选择分类归属（支持批量选择多个 Skill 统一设置分类）
- FR24: 系统将导入的 Skill 文件复制到对应分类目录，并补充缺失的 Frontmatter 字段：`category` 为用户选择的分类，`name` 缺失时使用文件名（去除扩展名），`description` 缺失时留空
- FR25: 用户可以选择导入后清理 IDE 中的原始 Skill 文件

### Skill 管理

- FR25b: 用户可以删除已导入的 Skill 文件
- FR25c: 用户可以将 Skill 移动到其他分类
- FR25d: 用户可以编辑 Skill 的 Frontmatter 元数据（分类、标签、描述），但不能编辑 Markdown 正文

### 配置管理

- FR26: 用户可以查看和修改 IDE 同步目标路径（支持配置多个项目路径）
- FR27: 用户可以查看、添加、修改和删除 Skill 分类
- FR28: 系统将配置变更持久化到 `config/settings.yaml` 和 `config/categories.yaml`
- FR29: 系统在启动时读取配置文件并应用设置

### 系统能力

- FR30: 系统解析 `.md` 文件的 YAML Frontmatter 和 Markdown 正文
- FR31: 系统在用户手动刷新或执行操作后重新扫描 `skills/` 目录更新数据（MVP 不使用文件监听，降低复杂度）
- FR32: 系统区分普通 Skill 和工作流 Skill（通过 Frontmatter 中的 `type` 字段）

### 错误处理

- FR33: 系统在解析 Skill 文件时，如果 YAML Frontmatter 语法错误，将该文件标记为解析失败并在 UI 中提示（显示文件名和错误原因），不阻塞其他文件的正常加载
- FR34: 系统在同步操作失败时提供详细错误信息和恢复建议（包括目标路径不可写、磁盘空间不足、文件被锁定等场景）
- FR35: 系统在文件操作（读取、写入、删除、移动）失败时提供清晰的错误提示，作为横切关注点覆盖所有涉及文件操作的功能模块（浏览、导入、编排、同步）
- FR36: 每个功能模块（浏览、编排、同步、导入、设置）提供独立的空状态引导，引导用户完成对应模块的首次操作

---

## Non-Functional Requirements

### Performance

- NFR1: Skill 搜索响应时间 < 200ms（本地文件系统，500 个 Skill 文件规模）
- NFR2: 页面首次加载时间 < 2s（Lighthouse Performance Score > 80）
- NFR3: 同步操作耗时 < 2s（100 个 Skill 文件的批量复制）
- NFR4: Markdown 渲染时间 < 500ms（单个 Skill 文件，最大 50KB）

### Security

- NFR5: 系统仅在 localhost 运行，不暴露外部网络端口
- NFR6: 文件操作限制在配置的目录范围内，防止路径遍历攻击
- NFR7: 同步操作前进行目标路径合法性校验

### Accessibility

- NFR8: Web 界面支持键盘导航（Tab 切换、Enter 确认、Esc 取消）
- NFR9: 所有交互元素提供 ARIA 标签
- NFR10: 暗色主题满足 WCAG 2.1 AA 对比度标准（文本对比度 ≥ 4.5:1）

### Integration

- NFR11: 支持 macOS、Windows、Linux 三大操作系统的文件路径格式
- NFR12: 支持 UTF-8 编码的 Markdown 文件，正确处理中英文混合内容

---

## Adversarial Review Findings

以下问题在 Party Mode 对抗性审查中被发现并已在本 PRD 中解决：

| # | 问题 | 来源 | 解决方案 | 状态 |
|---|------|------|----------|------|
| 1 | 同步目标路径项目级 vs 全局级 | Winston | FR17b: 用户配置绝对路径，支持多项目 | ✅ 已解决 |
| 2 | Skill 目录与 IDE 目录映射 | Winston | FR17: 扁平化复制，不保留分类子目录 | ✅ 已解决 |
| 3 | 缺少 Skill 删除/移动/重分类 | Sally | FR25b/25c/25d: 新增管理操作 | ✅ 已解决 |
| 4 | 缺少 Frontmatter 编辑能力 | Dr. Quinn | FR25d: 允许编辑元数据，不编辑正文 | ✅ 已解决 |
| 5 | 同步冲突处理 | Murat | FR17c: 默认覆盖，日志标注 | ✅ 已解决 |
| 6 | 错误处理需求缺失 | Murat | FR33-FR36: 新增错误处理章节 | ✅ 已解决 |
| 7 | 导入批量分类 | Sally | FR23: 支持批量选择统一分类 | ✅ 已解决 |
| 8 | 工作流编辑/删除 | Sally | FR14b/14c/14d: 新增移除、删除和编辑操作 | ✅ 已解决 |
| 9 | 搜索匹配逻辑 | Murat | FR4: 明确模糊匹配 + AND 逻辑 | ✅ 已解决 |
| 10 | 性能指标负载条件 | Murat | NFR1: 明确 500 Skill 规模 | ✅ 已解决 |
| 11 | 导入缺失字段处理 | Murat | FR24: 明确各字段的默认值策略 | ✅ 已解决 |
| 12 | 工作流 Skill 可执行性 | Dr. Quinn | 已知限制：工作流 Skill 的实际执行依赖 IDE 的 Skill 引擎能力，V1 作为组织和文档化工具提供价值 | ⚠️ 已知限制 |
| 13 | 文件监听必要性 | Winston | FR31: MVP 改为手动刷新，降低复杂度 | ✅ 已解决 |
| 14 | 各模块空状态引导 | Sally | FR36: 每个功能模块独立空状态引导 | ✅ 已解决 |
