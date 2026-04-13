---
title: "Product Brief: External Skills Hub — 外部技能仓库聚合与管理"
status: "draft"
created: "2026-04-13"
updated: "2026-04-13"
inputs:
  [
    "用户对话记录",
    "anthropics/skills 仓库结构分析",
    "现有项目架构分析",
    "现有分类/套件体系分析",
  ]
---

# 产品简报：External Skills Hub — 外部技能仓库聚合与管理

## 执行摘要

Skill Manager 目前管理的是用户自有的私人 Skill 资产。但 AI 技能生态正在爆发——Anthropic 官方发布了 `anthropics/skills` 仓库，社区也在不断涌现高质量的 Skill 集合。开发者需要一种方式，将这些外部优质 Skill **自动拉取、智能筛选、分类归档**到自己的技能仓库中，并保持持续更新。

**External Skills Hub** 是 Skill Manager 的新功能模块，它通过**配置文件驱动的多仓库注册机制**，自动从 GitHub 仓库拉取 Skill，经过原子化通用性筛选后，复制到项目的 `skills/` 目录中。外部 Skill 带有**来源标签**（可点击跳转 GitHub），并以**只读模式**管理——下次同步时自动覆盖更新。同时，项目的预设分类体系将重构，所有出厂分类聚合为一个**默认套件**，为用户提供开箱即用的技能组合。

## 问题

- **优质 Skill 散落在各个 GitHub 仓库中**：Anthropic 官方、社区贡献者都在发布 Skill，但开发者需要手动 clone、手动筛选、手动复制，极其低效
- **缺乏自动更新机制**：外部仓库持续迭代，开发者无法及时获取最新版本的 Skill
- **通用性判断困难**：并非所有外部 Skill 都适合通用场景（如 `slack-gif-creator` 高度定制化），开发者需要逐个评估
- **分类体系不够灵活**：现有 4 个出厂分类（coding/writing/devops/workflows）无法覆盖外部 Skill 的多样性
- **来源不可追溯**：一旦 Skill 被复制到本地，就失去了与上游仓库的关联，无法追溯来源或查看更新

## 解决方案

### 1. 多仓库注册与管理（配置文件驱动）

通过 `config/repositories.yaml` 注册外部 GitHub 仓库：

```yaml
# config/repositories.yaml
repositories:
  - id: anthropic-official
    name: "Anthropic Official Skills"
    url: "https://github.com/anthropics/skills.git"
    branch: main
    # 仓库内 Skill 所在的相对路径
    skillsPath: "skills"
    enabled: true
    # 技能映射：只拉取这些 Skill（白名单模式）
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
    # 明确排除的 Skill（黑名单，优先级高于 include）
    exclude:
      - "slack-gif-creator" # 高度定制化，非通用
      - "algorithmic-art" # 艺术创作，非通用开发场景
      - "brand-guidelines" # 品牌定制，非通用
      - "canvas-design" # 画布设计，非通用
      - "theme-factory" # 主题工厂，非通用
      - "internal-comms" # 内部沟通，非通用
      - "web-artifacts-builder" # 特定场景
      - "doc-coauthoring" # 协作场景，非通用
```

**筛选原则（原子化通用性判断）**：

- ✅ **纳入**：单一职责、可独立使用、不依赖特定上下文、面向通用开发场景
- ❌ **排除**：绑定特定平台/服务（如 Slack）、高度定制化（如品牌设计）、需要特殊环境依赖

### 2. 本地仓库存储（Git 忽略）

外部仓库 clone 到专用目录 `skill-repos/`，该目录被 `.gitignore` 忽略：

```
skill-package/
├── skill-repos/              # ← 新增，git 忽略
│   ├── anthropic-official/   # clone 的 anthropics/skills 仓库
│   ├── community-repo-1/     # 未来扩展的其他仓库
│   └── ...
├── skills/                   # 用户 Skill + 外部同步的 Skill（只读）
│   ├── coding/
│   ├── document-processing/  # ← 新增分类（来自外部 Skill）
│   ├── dev-tools/            # ← 新增分类
│   └── ...
```

### 3. GitHub Action 自动更新

通过 GitHub Action 定时触发（每日一次），自动执行：

```
定时触发 → git pull 所有注册仓库 → 筛选通用 Skill → 复制到 skills/ → 提交 PR
```

**关键流程**：

1. 遍历 `config/repositories.yaml` 中所有 `enabled: true` 的仓库
2. 对每个仓库执行 `git clone`（首次）或 `git pull`（增量更新）到 `skill-repos/`
3. 根据 `include`/`exclude` 规则筛选 Skill
4. 将筛选后的 Skill 复制到 `skills/{targetCategory}/` 目录
5. 为每个 Skill 的 Frontmatter **注入来源元数据**（`source`、`sourceUrl`、`sourceRepo`）
6. 自动创建 PR（而非直接 push），便于人工审核

### 4. 来源标签与只读管理

从外部仓库同步的 Skill，Frontmatter 中自动注入来源信息：

```yaml
---
name: pdf
description: "Read, create, and manipulate PDF documents"
category: document-processing
source: "anthropic-official" # 来源仓库 ID
sourceUrl: "https://github.com/anthropics/skills/tree/main/skills/pdf"
sourceRepo: "https://github.com/anthropics/skills"
readonly: true # 标记为只读
---
```

**前端展示**：

- SkillCard 上显示来源标签（GitHub 图标 + 仓库名），点击跳转到 `sourceUrl`
- 只读 Skill 在 UI 上有视觉区分（如半透明锁图标），不可编辑元数据
- SkillPreview 中显示完整来源信息和"在 GitHub 上查看"链接

### 5. 重构预设分类体系

基于外部 Skill 的加入，重新设计出厂分类：

| 分类 name             | displayName | 描述                           | 来源         |
| --------------------- | ----------- | ------------------------------ | ------------ |
| `coding`              | 编程开发    | 代码编写、调试、重构           | 原有         |
| `writing`             | 文档写作    | 文档、注释、技术写作           | 原有         |
| `devops`              | DevOps      | 部署、CI/CD、运维              | 原有         |
| `workflows`           | 工作流      | 多 Skill 组合的自动化工作流    | 原有         |
| `document-processing` | 文档处理    | PDF/DOCX/XLSX/PPTX 读写转换    | 新增（外部） |
| `dev-tools`           | 开发工具    | MCP 构建、API 集成等开发工具链 | 新增（外部） |
| `testing`             | 测试        | 自动化测试、前端功能验证       | 新增（外部） |
| `design`              | 设计        | 前端设计、UI/UX 相关           | 新增（外部） |
| `meta-skills`         | 元技能      | Skill 创建、优化、评估         | 新增（外部） |

### 6. 出厂分类聚合为默认套件

所有出厂预设分类自动聚合为一个名为 `default` 的默认套件：

```yaml
# 自动生成的默认套件（在 settings.yaml 中）
skillBundles:
  - id: bundle-default
    name: default
    displayName: 默认套件
    description: 包含所有出厂预设分类的完整技能组合
    categoryNames:
      - coding
      - writing
      - devops
      - workflows
      - document-processing
      - dev-tools
      - testing
      - design
      - meta-skills
```

## 差异化优势

- **配置驱动的多仓库架构**：不硬编码任何仓库，通过 YAML 配置文件注册，天然支持无限扩展
- **白名单 + 黑名单双重筛选**：精确控制哪些 Skill 进入本地仓库，避免噪音
- **来源可追溯**：每个外部 Skill 都保留完整的来源链接，一键跳转 GitHub
- **只读保护**：外部 Skill 不可本地编辑，保证与上游的一致性
- **GitHub Action 自动化**：零人工干预的持续更新，开发者始终拥有最新版本

## 目标用户

与 Skill Manager 主产品一致——**个人开发者**，特别是：

- 希望快速获取高质量 Skill 而不想手动搜索和复制的开发者
- 关注 Anthropic 官方和社区 Skill 生态的早期采用者
- 需要统一管理自有 Skill 和外部 Skill 的重度用户

## 成功标准

| 指标                  | 目标                                 |
| --------------------- | ------------------------------------ |
| 外部 Skill 同步成功率 | 100%（GitHub Action 执行无报错）     |
| 来源标签点击率        | >30% 的外部 Skill 浏览会触发来源跳转 |
| 分类覆盖度            | 外部 Skill 100% 归入正确分类         |
| 更新延迟              | 上游仓库更新后 ≤24 小时同步到本地    |
| 仓库扩展              | 架构支持 ≥10 个外部仓库同时注册      |

## 范围

### 本次包含

- `config/repositories.yaml` 配置文件设计与解析
- `skill-repos/` 目录管理（clone/pull）
- GitHub Action 定时同步工作流
- Skill Frontmatter 来源元数据注入
- 前端来源标签展示与跳转
- 只读 Skill 的 UI 标识与保护
- 预设分类体系重构（9 个分类）
- 默认套件自动生成
- 边界情况处理（仓库不可达、Skill 格式异常、分类不存在等）

### 本次不包含

- 仓库注册的 Web UI 管理界面（V2，本次通过配置文件管理）
- 外部 Skill 的版本对比/diff 展示
- 外部 Skill 的评分/评价系统
- 私有仓库支持（需要 token 认证）
- 外部 Skill 的本地 fork/定制能力

## 技术方案概要

| 维度             | 选型                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| 仓库配置         | `config/repositories.yaml`（YAML 格式，`js-yaml` 解析）                              |
| 仓库存储         | `skill-repos/` 目录（`.gitignore` 忽略）                                             |
| 同步引擎         | GitHub Action（`actions/checkout` + shell 脚本）                                     |
| Frontmatter 注入 | `gray-matter`（读取 → 注入 source 字段 → 写回）                                      |
| 来源标签 UI      | `lucide-react` GitHub 图标 + Badge 组件                                              |
| 只读保护         | 后端 `updateSkillMeta` / `deleteSkill` 检查 `readonly` 字段                          |
| 新增类型字段     | `shared/types.ts` 扩展 `SkillMeta` 增加 `source`/`sourceUrl`/`sourceRepo`/`readonly` |

### 边界情况处理

| 场景                                | 处理策略                                                 |
| ----------------------------------- | -------------------------------------------------------- |
| 仓库 clone/pull 失败                | 记录错误日志，跳过该仓库，继续处理其他仓库               |
| Skill 文件格式异常                  | 记录警告，跳过该 Skill，不中断整体流程                   |
| 目标分类不存在                      | 自动创建分类（基于 `targetCategory` 配置）               |
| Skill ID 冲突（外部与本地同名）     | 保持统一命名，本地 Skill 优先，外部 Skill 跳过并记录警告 |
| 仓库被删除/不可达                   | GitHub Action 报告失败，保留上次同步的 Skill 不删除      |
| `include` 中的 Skill 在仓库中不存在 | 记录警告，跳过，不报错                                   |
| 网络超时                            | 设置 clone/pull 超时（60s），超时则跳过                  |

## 决策记录

| #   | 决策项              | 结论                                                | 状态      |
| --- | ------------------- | --------------------------------------------------- | --------- |
| 1   | 外部仓库存储目录    | `skill-repos/`（新建，`.gitignore` 忽略）           | ✅ 已确认 |
| 2   | 同步触发机制        | GitHub Action 定时触发（每日一次）                  | ✅ 已确认 |
| 3   | 外部 Skill 可编辑性 | 只读（下次同步覆盖）                                | ✅ 已确认 |
| 4   | 仓库注册方式        | 配置文件 `config/repositories.yaml`（非 UI）        | ✅ 已确认 |
| 5   | 筛选策略            | 白名单 `include` + 黑名单 `exclude`，白名单优先     | ✅ 已确认 |
| 6   | 出厂分类与套件      | 所有出厂分类聚合为一个 `default` 默认套件           | ✅ 已确认 |
| 7   | 来源标签交互        | SkillCard 显示 GitHub 图标 + 仓库名，点击跳转仓库   | ✅ 已确认 |
| 8   | Skill ID 冲突策略   | 保持统一命名，本地 Skill 优先，冲突时跳过外部 Skill | ✅ 已确认 |
| 9   | GitHub Action 输出  | 创建 PR 而非直接 push，便于审核                     | ✅ 已确认 |

## 愿景

External Skills Hub 是 Skill Manager 从"个人资产管理"走向"技能生态聚合"的第一步：

- **V2**：提供 Web UI 管理仓库注册（增删改查），支持私有仓库（token 认证）
- **V3**：Skill 版本对比——展示上游更新了什么，用户决定是否接受
- **长期**：形成 Skill 发现与推荐引擎，基于用户的技术栈和使用习惯，智能推荐来自各仓库的 Skill
