---
stepsCompleted: ["quick-dev-oneshot"]
inputDocuments:
  ["product-brief-external-skills-hub.md", "prd.md", "project-context.md"]
workflowType: "prd"
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 2
classification:
  projectType: developer_tool
  domain: general
  complexity: medium
  projectContext: brownfield
parentPrd: "prd.md"
---

# Product Requirements Document — External Skills Hub（外部技能仓库聚合与管理）

**Author:** Alex
**Date:** 2026-04-13
**类型:** 功能增量 PRD（Brownfield）
**父 PRD:** [prd.md](./prd.md)

---

## Executive Summary

**External Skills Hub** 是 Skill Manager 的新功能模块，将系统从"个人 Skill 资产管理"扩展为"技能生态聚合平台"。

核心能力：通过**配置文件驱动的多仓库注册机制**，自动从 GitHub 仓库（首批：`anthropics/skills`）拉取高质量 Skill，经过原子化通用性筛选后，同步到项目的 `skills/` 目录中。外部 Skill 带有**来源标签**（可点击跳转 GitHub 仓库），以**只读模式**管理，并通过 **GitHub Action** 定时自动更新。

同时，项目的预设分类体系将从 4 个扩展到 9 个，所有出厂分类聚合为一个**默认套件（default bundle）**，为用户提供开箱即用的技能组合。

**核心价值：** 开发者无需手动搜索、clone、筛选外部 Skill 仓库，系统自动完成拉取→筛选→分类→同步的全流程，并保持与上游仓库的持续同步。

---

## 背景与问题陈述

### 当前问题

1. **优质 Skill 散落各处**：Anthropic 官方发布了 `anthropics/skills` 仓库，社区也在涌现高质量 Skill 集合，但开发者需要手动 clone、手动筛选、手动复制，极其低效。

2. **缺乏自动更新机制**：外部仓库持续迭代，开发者无法及时获取最新版本的 Skill，手动同步成本高。

3. **通用性判断困难**：并非所有外部 Skill 都适合通用场景（如 `slack-gif-creator` 高度定制化），开发者需要逐个评估，缺乏系统化的筛选机制。

4. **分类体系不够灵活**：现有 4 个出厂分类（coding/writing/devops/workflows）无法覆盖外部 Skill 的多样性（如文档处理、测试、设计等）。

5. **来源不可追溯**：一旦 Skill 被手动复制到本地，就失去了与上游仓库的关联，无法追溯来源或查看更新。

### 用户痛点（Jobs-to-be-Done）

> 🎯 **"当我发现一个优质的 Skill 仓库时，我想要系统自动拉取其中通用的 Skill 到我的仓库中，并保持持续更新，这样我不需要手动维护外部 Skill 的同步。"**

---

## Success Criteria

### 用户成功指标

- 外部 Skill 在 UI 中与本地 Skill 无缝混合展示，来源标签清晰可辨
- 用户能一键跳转到外部 Skill 的 GitHub 仓库页面
- 只读 Skill 有明确的视觉标识，用户不会误操作编辑

### 技术成功指标

- GitHub Action 定时同步成功率 100%（无报错）
- 外部 Skill 100% 归入正确分类
- 上游仓库更新后 ≤24 小时同步到本地
- 架构支持 ≥10 个外部仓库同时注册
- 零破坏性变更：现有 Skill 浏览、搜索、同步功能 100% 保留
- 向后兼容：旧版配置文件（无外部仓库相关字段）正常读取

### Measurable Outcomes

| 指标                     | 目标 | 测量方式            |
| ------------------------ | ---- | ------------------- |
| GitHub Action 执行成功率 | 100% | Action 运行日志     |
| 外部 Skill 分类准确率    | 100% | 配置映射校验        |
| 同步延迟                 | ≤24h | Action 定时触发频率 |
| 来源标签渲染正确率       | 100% | UI 测试             |
| 只读保护有效率           | 100% | API 测试            |

---

## 功能范围

### 本次包含（MVP）

1. **仓库配置文件**：`config/repositories.yaml` 设计与解析
2. **`skill-repos/` 目录管理**：外部仓库 clone/pull 的本地存储
3. **GitHub Action 同步工作流**：定时触发 → 拉取 → 筛选 → 复制 → 提交 PR
4. **Skill Frontmatter 来源元数据注入**：`source`、`sourceUrl`、`sourceRepo`、`readonly` 字段
5. **前端来源标签展示与跳转**：SkillCard 上的 GitHub 图标 + 仓库名
6. **只读 Skill 的 UI 标识与保护**：锁图标 + 后端拦截编辑/删除操作
7. **预设分类体系重构**：4 → 9 个分类
8. **默认套件自动生成**：所有出厂分类聚合为 `default` 套件
9. **边界情况处理**：仓库不可达、Skill 格式异常、分类不存在、ID 冲突等

### 本次不包含（后续迭代）

- 仓库注册的 Web UI 管理界面（V2，本次通过配置文件管理）
- 外部 Skill 的版本对比/diff 展示
- 外部 Skill 的评分/评价系统
- 私有仓库支持（需要 token 认证）
- 外部 Skill 的本地 fork/定制能力

---

## User Journeys

### Journey 1: 首次同步 — 外部 Skill 自动入库

**场景：** Alex fork 了 Skill Manager 项目，GitHub Action 首次运行，自动拉取 Anthropic 官方 Skills。

**流程：**

1. GitHub Action 定时触发（每日 UTC 00:00）
2. Action 读取 `config/repositories.yaml`，发现 `anthropic-official` 仓库已注册且 `enabled: true`
3. Action 执行 `git clone https://github.com/anthropics/skills.git` 到 `skill-repos/anthropic-official/`
4. 根据 `include` 白名单筛选出 9 个通用 Skill（pdf、docx、xlsx、pptx、mcp-builder、webapp-testing、skill-creator、frontend-design、claude-api）
5. 将筛选后的 Skill 复制到 `skills/{targetCategory}/` 目录，并注入来源元数据
6. 自动创建 PR："chore: sync external skills from anthropic-official"
7. Alex 审核 PR，确认无误后合并

**成功标准：** 全自动完成，Alex 只需审核 PR

### Journey 2: 浏览外部 Skill — 来源标签与跳转

**场景：** Alex 在 Skill Manager 中浏览 Skill，看到来自外部仓库的 Skill。

**流程：**

1. Alex 打开 Skill Manager，在 SkillBrowsePage 看到卡片网格
2. 来自外部仓库的 Skill 卡片右上角显示 GitHub 图标 + "Anthropic Official" 标签
3. 卡片左下角有一个小锁图标，表示只读
4. Alex 点击来源标签，浏览器新标签页打开 `https://github.com/anthropics/skills/tree/main/skills/pdf`
5. Alex 点击 Skill 卡片进入预览，预览面板底部显示完整来源信息和"在 GitHub 上查看"链接

**成功标准：** 来源信息清晰可见，跳转准确

### Journey 3: 只读保护 — 防止误编辑外部 Skill

**场景：** Alex 尝试编辑一个外部 Skill 的元数据。

**流程：**

1. Alex 在 SkillPreview 中查看一个外部 Skill
2. 元数据编辑区域显示为禁用状态，Tooltip 提示"外部 Skill 为只读，由上游仓库管理"
3. 删除按钮同样禁用，Tooltip 提示"外部 Skill 不可删除"
4. 如果 Alex 通过 API 直接尝试编辑/删除，后端返回 403 + `SKILL_READONLY` 错误

**成功标准：** 前后端双重保护，用户体验友好

### Journey 4: 增量更新 — 上游仓库新增 Skill

**场景：** Anthropic 官方仓库新增了一个 `csv` Skill，Alex 在 `repositories.yaml` 中添加映射后，下次同步自动拉取。

**流程：**

1. Alex 编辑 `config/repositories.yaml`，在 `include` 中添加 `{ name: "csv", targetCategory: "document-processing" }`
2. 提交并推送到 GitHub
3. 下次 GitHub Action 定时触发时，自动拉取 `csv` Skill 并复制到 `skills/document-processing/`
4. Action 创建 PR，Alex 审核合并

**成功标准：** 配置驱动，零代码修改

### Journey Requirements Summary

| 旅程           | 揭示的核心能力                                                   |
| -------------- | ---------------------------------------------------------------- |
| 首次同步       | GitHub Action、仓库 clone、白名单筛选、Frontmatter 注入、PR 创建 |
| 浏览外部 Skill | 来源标签渲染、GitHub 跳转、只读标识                              |
| 只读保护       | 前端禁用、后端拦截、友好提示                                     |
| 增量更新       | 配置驱动、增量 pull、新 Skill 自动入库                           |

---

## 功能需求

### 仓库配置管理

- **FR-EH-01**: 系统读取 `config/repositories.yaml` 配置文件，解析外部仓库注册信息
- **FR-EH-02**: 每个仓库配置包含：`id`（唯一标识）、`name`（显示名称）、`url`（Git 仓库地址）、`branch`（分支名）、`skillsPath`（仓库内 Skill 目录相对路径）、`enabled`（启用开关）
- **FR-EH-03**: 每个仓库配置包含 `include` 白名单数组，每项含 `name`（Skill 名称）和 `targetCategory`（目标分类）
- **FR-EH-04**: 每个仓库配置包含 `exclude` 黑名单数组（Skill 名称列表），黑名单优先级高于白名单
- **FR-EH-05**: 配置文件不存在时，系统正常启动，视为无外部仓库注册（空数组）
- **FR-EH-06**: 配置文件格式错误时，记录错误日志，跳过该文件，不阻塞系统启动

### GitHub Action 同步工作流

- **FR-EH-07**: 提供 `.github/workflows/sync-external-skills.yml` GitHub Action 工作流文件
- **FR-EH-08**: Action 支持定时触发（cron: 每日 UTC 00:00）和手动触发（`workflow_dispatch`）
- **FR-EH-09**: Action 遍历 `config/repositories.yaml` 中所有 `enabled: true` 的仓库
- **FR-EH-10**: 对每个仓库执行 `git clone`（首次）或 `git pull`（增量更新）到 `skill-repos/{id}/` 目录
- **FR-EH-11**: 根据 `include`/`exclude` 规则筛选 Skill 目录
- **FR-EH-12**: 将筛选后的 Skill 目录完整复制到 `skills/{targetCategory}/{skillName}/` 目录
- **FR-EH-13**: 为每个复制的 Skill 的 `SKILL.md`（或主 `.md` 文件）Frontmatter 注入来源元数据：`source`（仓库 ID）、`sourceUrl`（GitHub 文件链接）、`sourceRepo`（仓库链接）、`readonly: true`
- **FR-EH-14**: 如果有文件变更，自动创建 PR（标题格式：`chore: sync external skills from {repoId}`），而非直接 push
- **FR-EH-15**: PR 描述中列出本次同步的变更摘要（新增/更新/删除的 Skill 列表）

### 来源标签展示

- **FR-EH-16**: SkillCard 组件检测 Skill 的 `source` 字段，有值时在卡片右上角显示来源标签
- **FR-EH-17**: 来源标签包含 GitHub 图标（`lucide-react` 的 `Github` 图标）和仓库显示名称
- **FR-EH-18**: 点击来源标签，在浏览器新标签页打开 `sourceUrl`（Skill 在 GitHub 上的具体位置）
- **FR-EH-19**: SkillPreview 组件底部显示完整来源信息区域：仓库名称、仓库链接、"在 GitHub 上查看"按钮
- **FR-EH-20**: 来源标签使用 `muted` 色调，不抢占卡片主要信息的视觉焦点

### 只读 Skill 管理

- **FR-EH-21**: SkillCard 组件检测 Skill 的 `readonly` 字段，为 `true` 时在卡片左下角显示锁图标（`lucide-react` 的 `Lock` 图标）
- **FR-EH-22**: SkillPreview 中，只读 Skill 的元数据编辑区域（分类、标签、描述）显示为禁用状态
- **FR-EH-23**: 只读 Skill 的删除按钮显示为禁用状态，Tooltip 提示"外部 Skill 不可删除"
- **FR-EH-24**: 后端 `updateSkillMeta` API 检测 Skill 的 `readonly` 字段，为 `true` 时返回 403 + `SKILL_READONLY` 错误
- **FR-EH-25**: 后端 `deleteSkill` API 检测 Skill 的 `readonly` 字段，为 `true` 时返回 403 + `SKILL_READONLY` 错误
- **FR-EH-26**: 后端 `moveSkillToCategory` API 检测 Skill 的 `readonly` 字段，为 `true` 时返回 403 + `SKILL_READONLY` 错误

### 预设分类体系重构

- **FR-EH-27**: `config/categories.yaml` 扩展为 9 个出厂分类：
  - 原有：`coding`（编程开发）、`writing`（文档写作）、`devops`（DevOps）、`workflows`（工作流）
  - 新增：`document-processing`（文档处理）、`dev-tools`（开发工具）、`testing`（测试）、`design`（设计）、`meta-skills`（元技能）
- **FR-EH-28**: 新增分类的 `description` 字段准确描述其用途
- **FR-EH-29**: 分类扩展不影响现有 Skill 的分类归属（现有 Skill 保持原分类不变）

### 默认套件

- **FR-EH-30**: 系统启动时检测 `config/settings.yaml` 中是否存在 `name: "default"` 的套件
- **FR-EH-31**: 如果不存在 `default` 套件，自动创建一个包含所有 9 个出厂分类的默认套件
- **FR-EH-32**: 默认套件的属性：`name: "default"`、`displayName: "默认套件"`、`description: "包含所有出厂预设分类的完整技能组合"`
- **FR-EH-33**: 默认套件可被用户编辑（修改包含的分类），但不可删除

### SkillMeta 类型扩展

- **FR-EH-34**: `shared/types.ts` 的 `SkillMeta` 接口新增可选字段：
  - `source?: string` — 来源仓库 ID
  - `sourceUrl?: string` — Skill 在 GitHub 上的 URL
  - `sourceRepo?: string` — 仓库 GitHub URL
  - `readonly?: boolean` — 是否只读
- **FR-EH-35**: `shared/schemas.ts` 的 `SkillMetaSchema` 对应扩展，新增字段均为 optional
- **FR-EH-36**: 后端 `frontmatterParser` 解析 Frontmatter 时提取这些新字段

---

## 非功能需求

### 性能

- **NFR-EH-01**: GitHub Action 单次同步执行时间 < 5 分钟（10 个仓库规模）
- **NFR-EH-02**: 外部 Skill 的来源标签渲染不增加 SkillCard 的渲染时间（< 5ms 额外开销）
- **NFR-EH-03**: 500 个 Skill（含外部 Skill）的搜索响应时间仍 < 200ms

### 兼容性

- **NFR-EH-04**: 旧版 `config/settings.yaml`（无 `skillBundles` 中的 `default` 套件）正常启动，自动创建
- **NFR-EH-05**: 无 `config/repositories.yaml` 文件时系统正常启动，视为无外部仓库
- **NFR-EH-06**: 现有 Skill 浏览、搜索、同步、导入功能零破坏性变更

### 安全

- **NFR-EH-07**: GitHub Action 中的 `git clone` 仅支持 HTTPS 公开仓库（V1 不支持 SSH/token）
- **NFR-EH-08**: `repositories.yaml` 中的 `url` 字段校验为合法的 GitHub HTTPS URL
- **NFR-EH-09**: Frontmatter 注入的 `sourceUrl` 和 `sourceRepo` 字段在前端渲染时使用 `target="_blank"` + `rel="noopener noreferrer"`

### 可维护性

- **NFR-EH-10**: GitHub Action 工作流脚本有清晰的日志输出，每个步骤（clone/pull、筛选、复制、注入）都有独立日志
- **NFR-EH-11**: 同步脚本支持 `--dry-run` 模式，仅输出将要执行的操作而不实际执行

---

## 技术架构

### 数据模型变更

**`shared/types.ts` — `SkillMeta` 扩展：**

```typescript
export interface SkillMeta {
  // ...现有字段...

  /** 来源仓库 ID（外部 Skill 专用） */
  source?: string;
  /** Skill 在 GitHub 上的 URL（外部 Skill 专用） */
  sourceUrl?: string;
  /** 仓库 GitHub URL（外部 Skill 专用） */
  sourceRepo?: string;
  /** 是否只读（外部 Skill 为 true） */
  readonly?: boolean;
}
```

**仓库配置类型（`shared/types.ts` 新增）：**

```typescript
/** 外部仓库 Skill 映射项 */
export interface RepoSkillMapping {
  /** Skill 名称（对应仓库中的目录名） */
  name: string;
  /** 目标分类 */
  targetCategory: string;
}

/** 外部仓库配置 */
export interface ExternalRepository {
  /** 唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** Git 仓库 HTTPS URL */
  url: string;
  /** 分支名 */
  branch: string;
  /** 仓库内 Skill 目录的相对路径 */
  skillsPath: string;
  /** 是否启用 */
  enabled: boolean;
  /** 白名单：只拉取这些 Skill */
  include: RepoSkillMapping[];
  /** 黑名单：排除这些 Skill（优先级高于 include） */
  exclude: string[];
}

/** 仓库配置文件结构 */
export interface RepositoriesConfig {
  repositories: ExternalRepository[];
}
```

### 新增配置文件

**`config/repositories.yaml`：**

```yaml
repositories:
  - id: anthropic-official
    name: "Anthropic Official Skills"
    url: "https://github.com/anthropics/skills.git"
    branch: main
    skillsPath: "skills"
    enabled: true
    include:
      - name: "pdf"
        targetCategory: "document-processing"
      - name: "docx"
        targetCategory: "document-processing"
      - name: "xlsx"
        targetCategory: "document-processing"
      - name: "pptx"
        targetCategory: "document-processing"
      - name: "mcp-builder"
        targetCategory: "dev-tools"
      - name: "webapp-testing"
        targetCategory: "testing"
      - name: "skill-creator"
        targetCategory: "meta-skills"
      - name: "frontend-design"
        targetCategory: "design"
      - name: "claude-api"
        targetCategory: "dev-tools"
    exclude:
      - "slack-gif-creator"
      - "algorithmic-art"
      - "brand-guidelines"
      - "canvas-design"
      - "theme-factory"
      - "internal-comms"
      - "web-artifacts-builder"
      - "doc-coauthoring"
```

### GitHub Action 工作流

**`.github/workflows/sync-external-skills.yml`：**

```yaml
name: Sync External Skills

on:
  schedule:
    - cron: "0 0 * * *" # 每日 UTC 00:00
  workflow_dispatch: # 支持手动触发

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run sync script
        run: node scripts/sync-external-skills.mjs

      - name: Create PR if changes exist
        uses: peter-evans/create-pull-request@v6
        with:
          title: "chore: sync external skills"
          body: "Automated sync of external skills from registered repositories."
          branch: chore/sync-external-skills
          commit-message: "chore: sync external skills"
```

### 同步脚本

**`scripts/sync-external-skills.mjs`** — Node.js 脚本，核心逻辑：

1. 读取 `config/repositories.yaml`
2. 遍历 `enabled: true` 的仓库
3. 对每个仓库：`git clone`（首次）或 `git pull`（增量）到 `skill-repos/{id}/`
4. 根据 `include`/`exclude` 筛选 Skill
5. 复制 Skill 目录到 `skills/{targetCategory}/{skillName}/`
6. 读取 Skill 的主 `.md` 文件，注入 Frontmatter 来源字段
7. 输出变更摘要日志

### 后端变更

**`server/services/skillService.ts` — 只读保护：**

```typescript
// updateSkillMeta 中新增检查
if (skill.readonly) {
  throw AppError.forbidden("SKILL_READONLY", "外部 Skill 为只读，不可编辑");
}

// deleteSkill 中新增检查
if (skill.readonly) {
  throw AppError.forbidden("SKILL_READONLY", "外部 Skill 为只读，不可删除");
}

// moveSkillToCategory 中新增检查
if (skill.readonly) {
  throw AppError.forbidden("SKILL_READONLY", "外部 Skill 为只读，不可移动");
}
```

**`server/types/errors.ts` — 新增错误工厂：**

```typescript
static skillReadonly(skillId: string): AppError {
  return new AppError(403, "SKILL_READONLY", `Skill "${skillId}" is readonly (external skill)`);
}
```

**`shared/constants.ts` — 新增错误码：**

```typescript
SKILL_READONLY: "SKILL_READONLY",
```

### 前端变更

**`src/components/skills/SkillCard.tsx` — 来源标签 + 只读标识：**

- 检测 `skill.source`，有值时渲染来源 Badge（GitHub 图标 + 仓库名）
- 检测 `skill.readonly`，为 `true` 时渲染锁图标
- 来源 Badge 点击事件：`window.open(skill.sourceUrl, '_blank', 'noopener,noreferrer')`

**`src/components/skills/SkillPreview.tsx` — 来源信息区域：**

- 底部新增来源信息区域（仅外部 Skill 显示）
- 元数据编辑区域根据 `readonly` 字段禁用
- 删除按钮根据 `readonly` 字段禁用

### 目录结构变更

```
skill-package/
├── skill-repos/                          # 新增，.gitignore 忽略
│   └── anthropic-official/               # clone 的 anthropics/skills 仓库
├── skills/
│   ├── coding/                           # 原有
│   ├── writing/                          # 原有
│   ├── devops/                           # 原有
│   ├── workflows/                        # 原有
│   ├── document-processing/              # 新增（外部 Skill）
│   │   ├── pdf/
│   │   ├── docx/
│   │   ├── xlsx/
│   │   └── pptx/
│   ├── dev-tools/                        # 新增（外部 Skill）
│   │   ├── mcp-builder/
│   │   └── claude-api/
│   ├── testing/                          # 新增（外部 Skill）
│   │   └── webapp-testing/
│   ├── design/                           # 新增（外部 Skill）
│   │   └── frontend-design/
│   └── meta-skills/                      # 新增（外部 Skill）
│       └── skill-creator/
├── scripts/
│   └── sync-external-skills.mjs          # 新增：同步脚本
├── config/
│   ├── categories.yaml                   # 修改：4 → 9 个分类
│   ├── settings.yaml                     # 修改：新增 default 套件
│   └── repositories.yaml                 # 新增：仓库注册配置
└── .github/
    └── workflows/
        └── sync-external-skills.yml      # 新增：GitHub Action
```

### 文件变更清单

| 文件                                         | 操作     | 说明                                                                                                               |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `shared/types.ts`                            | 修改     | `SkillMeta` 新增 `source`/`sourceUrl`/`sourceRepo`/`readonly`；新增 `ExternalRepository`/`RepositoriesConfig` 类型 |
| `shared/schemas.ts`                          | 修改     | `SkillMetaSchema` 扩展新字段                                                                                       |
| `shared/constants.ts`                        | 修改     | 新增 `SKILL_READONLY` 错误码                                                                                       |
| `server/types/errors.ts`                     | 修改     | 新增 `AppError.skillReadonly()` 工厂方法                                                                           |
| `server/services/skillService.ts`            | 修改     | `updateSkillMeta`/`deleteSkill`/`moveSkillToCategory` 新增 readonly 检查                                           |
| `server/utils/frontmatterParser.ts`          | 修改     | 解析 `source`/`sourceUrl`/`sourceRepo`/`readonly` 字段                                                             |
| `src/components/skills/SkillCard.tsx`        | 修改     | 新增来源标签 + 只读锁图标                                                                                          |
| `src/components/skills/SkillPreview.tsx`     | 修改     | 新增来源信息区域 + readonly 禁用逻辑                                                                               |
| `config/categories.yaml`                     | 修改     | 4 → 9 个出厂分类                                                                                                   |
| `config/repositories.yaml`                   | **新建** | 外部仓库注册配置                                                                                                   |
| `scripts/sync-external-skills.mjs`           | **新建** | 同步脚本                                                                                                           |
| `.github/workflows/sync-external-skills.yml` | **新建** | GitHub Action 工作流                                                                                               |
| `.gitignore`                                 | 修改     | 新增 `skill-repos/` 忽略规则                                                                                       |

**零改动文件：** `categoryService.ts`、`categoryRoutes.ts`、`bundleService.ts`、`bundleRoutes.ts`、`syncService.ts`、`workflowService.ts`

### 边界情况处理

| 场景                                 | 处理策略                                                 |
| ------------------------------------ | -------------------------------------------------------- |
| 仓库 clone/pull 失败（网络错误）     | 记录错误日志，跳过该仓库，继续处理其他仓库               |
| Skill 文件格式异常（无 Frontmatter） | 记录警告，跳过该 Skill，不中断整体流程                   |
| 目标分类不存在                       | 同步脚本自动在 `categories.yaml` 中创建分类              |
| Skill ID 冲突（外部与本地同名）      | 保持统一命名，本地 Skill 优先，外部 Skill 跳过并记录警告 |
| 仓库被删除/不可达                    | GitHub Action 报告失败，保留上次同步的 Skill 不删除      |
| `include` 中的 Skill 在仓库中不存在  | 记录警告，跳过，不报错                                   |
| 网络超时                             | 设置 clone/pull 超时（60s），超时则跳过                  |
| `repositories.yaml` 不存在           | 系统正常启动，视为无外部仓库                             |
| `repositories.yaml` 格式错误         | 记录错误日志，跳过，不阻塞系统                           |
| Frontmatter 注入失败                 | 记录警告，仍复制文件（无来源元数据），不中断             |

---

## 决策记录

| #   | 决策项              | 结论                                                      | 状态      |
| --- | ------------------- | --------------------------------------------------------- | --------- |
| 1   | 外部仓库存储目录    | `skill-repos/`（新建，`.gitignore` 忽略）                 | ✅ 已确认 |
| 2   | 同步触发机制        | GitHub Action 定时触发（每日一次）+ 手动触发              | ✅ 已确认 |
| 3   | 外部 Skill 可编辑性 | 只读（下次同步覆盖）                                      | ✅ 已确认 |
| 4   | 仓库注册方式        | 配置文件 `config/repositories.yaml`（非 UI）              | ✅ 已确认 |
| 5   | 筛选策略            | 白名单 `include` + 黑名单 `exclude`，黑名单优先           | ✅ 已确认 |
| 6   | 出厂分类与套件      | 所有出厂分类聚合为一个 `default` 默认套件                 | ✅ 已确认 |
| 7   | 来源标签交互        | SkillCard 显示 GitHub 图标 + 仓库名，点击跳转 `sourceUrl` | ✅ 已确认 |
| 8   | Skill ID 冲突策略   | 保持统一命名，本地 Skill 优先，冲突时跳过外部 Skill       | ✅ 已确认 |
| 9   | GitHub Action 输出  | 创建 PR 而非直接 push，便于审核                           | ✅ 已确认 |
| 10  | 默认套件可删除性    | 不可删除，可编辑                                          | ✅ 已确认 |

---

## 验收标准

### AC-1: 仓库配置文件

- [ ] `config/repositories.yaml` 存在且格式正确
- [ ] 包含 `anthropic-official` 仓库配置
- [ ] `include` 白名单包含 9 个通用 Skill
- [ ] `exclude` 黑名单包含 8 个非通用 Skill

### AC-2: GitHub Action 工作流

- [ ] `.github/workflows/sync-external-skills.yml` 存在
- [ ] 支持 cron 定时触发（每日 UTC 00:00）
- [ ] 支持 `workflow_dispatch` 手动触发
- [ ] 同步完成后自动创建 PR

### AC-3: 同步脚本

- [ ] `scripts/sync-external-skills.mjs` 存在且可执行
- [ ] 正确读取 `repositories.yaml` 配置
- [ ] 正确执行 `git clone`/`git pull`
- [ ] 正确根据 `include`/`exclude` 筛选 Skill
- [ ] 正确复制 Skill 到目标分类目录
- [ ] 正确注入 Frontmatter 来源元数据
- [ ] 支持 `--dry-run` 模式
- [ ] 仓库不可达时跳过并记录日志
- [ ] Skill 格式异常时跳过并记录日志
- [ ] ID 冲突时跳过外部 Skill 并记录日志

### AC-4: SkillMeta 类型扩展

- [ ] `shared/types.ts` 中 `SkillMeta` 新增 `source`/`sourceUrl`/`sourceRepo`/`readonly` 字段
- [ ] `shared/schemas.ts` 中 Schema 对应扩展
- [ ] `frontmatterParser` 正确解析新字段

### AC-5: 来源标签展示

- [ ] 外部 Skill 的 SkillCard 显示 GitHub 图标 + 仓库名
- [ ] 点击来源标签在新标签页打开 `sourceUrl`
- [ ] SkillPreview 底部显示完整来源信息
- [ ] 本地 Skill 不显示来源标签

### AC-6: 只读保护

- [ ] 外部 Skill 的 SkillCard 显示锁图标
- [ ] SkillPreview 中元数据编辑区域禁用
- [ ] 删除按钮禁用，Tooltip 提示原因
- [ ] 后端 `updateSkillMeta` 拦截只读 Skill 返回 403
- [ ] 后端 `deleteSkill` 拦截只读 Skill 返回 403
- [ ] 后端 `moveSkillToCategory` 拦截只读 Skill 返回 403

### AC-7: 预设分类扩展

- [ ] `categories.yaml` 包含 9 个分类
- [ ] 新增 5 个分类：`document-processing`、`dev-tools`、`testing`、`design`、`meta-skills`
- [ ] 现有 4 个分类不变
- [ ] 现有 Skill 分类归属不变

### AC-8: 默认套件

- [ ] 系统启动时自动创建 `default` 套件（如不存在）
- [ ] 默认套件包含所有 9 个出厂分类
- [ ] 默认套件不可删除
- [ ] 默认套件可编辑

### AC-9: .gitignore 更新

- [ ] `.gitignore` 包含 `skill-repos/` 规则

### AC-10: 向后兼容

- [ ] 无 `repositories.yaml` 时系统正常启动
- [ ] 无外部 Skill 时现有功能零回归
- [ ] 旧版 `settings.yaml` 正常读取

---

_本 PRD 基于 [product-brief-external-skills-hub.md](../product-brief-external-skills-hub.md) 产品简报快速生成_
_生成时间：2026-04-13_
