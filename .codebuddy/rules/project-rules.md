---
# 注意不要修改本文头文件，如修改，CodeBuddy（内网版）将按照默认逻辑设置
type: always
---

# BMad 关键文件索引

> 优先级说明：**P0** 必读（每次任务前加载）→ **P1** 高优先（任务相关时加载）→ **P2** 按需参考 → **P3** 归档备查

---

## P0 · 项目上下文（必读）

| 文件路径 | 说明 |
|----------|------|
| `_bmad-output/project-context.md` | **项目上下文（AI Agent 规则与项目约定）— 每次任务前优先加载** |

---

## P1 · 配置文件

| 文件路径 | 说明 |
|----------|------|
| `_bmad/bmm/config.yaml` | BMad 主配置：用户名、语言、输出目录、项目知识路径 |
| `_bmad/_config/manifest.yaml` | BMad 全局 manifest，模块与技能注册表 |
| `_bmad/bmb/config.yaml` | BMad Builder 模块配置 |
| `_bmad/cis/config.yaml` | CIS 模块配置 |
| `_bmad/core/config.yaml` | Core 模块配置 |
| `_bmad/tea/config.yaml` | TEA（测试架构）模块配置 |

---

## P1 · 核心规划产物

| 文件路径 | 说明 |
|----------|------|
| `_bmad-output/planning-artifacts/architecture.md` | 架构决策文档（AD-1 ~ AD-40，主架构文件） |
| `_bmad-output/planning-artifacts/prd/prd.md` | 主产品需求文档（PRD） |
| `_bmad-output/planning-artifacts/epics/epics.md` | 全量 Epics 列表（主 Epic 文件） |
| `_bmad-output/planning-artifacts/ux/ux-design-specification.md` | UX 设计规范文档 |

---

## P2 · 扩展规划产物

| 文件路径 | 说明 |
|----------|------|
| `_bmad-output/planning-artifacts/prd/prd-external-skills-hub.md` | External Skills Hub PRD |
| `_bmad-output/planning-artifacts/prd/prd-category-settings-and-bundles.md` | 分类设置与套件 PRD |
| `_bmad-output/planning-artifacts/prd/prd-sidebar-redesign.md` | Sidebar 重设计 PRD |
| `_bmad-output/planning-artifacts/prd/prd-epic6-ux-polish.md` | Epic 6 UX 优化 PRD |
| `_bmad-output/planning-artifacts/prd/prd-nav-category-fix.md` | 导航分类修复 PRD |
| `_bmad-output/planning-artifacts/epics/epic-ux-improvement.md` | UX 改进 Epic |
| `_bmad-output/planning-artifacts/brief/product-brief-skill-package.md` | Skill Package 产品简报 |
| `_bmad-output/planning-artifacts/brief/product-brief-external-skills-hub.md` | External Skills Hub 产品简报 |

---

## P2 · 实施产物

| 文件路径 | 说明 |
|----------|------|
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | Sprint 状态追踪文件 |
| `_bmad-output/implementation-artifacts/deferred-work.md` | 延期工作记录 |
| `_bmad-output/implementation-artifacts/specs/spec-changelog-versioning.md` | Changelog 版本管理规范 |
| `_bmad-output/implementation-artifacts/specs/spec-light-dark-theme-toggle.md` | 明暗主题切换规范 |
| `_bmad-output/implementation-artifacts/specs/spec-activity-heatmap-tooltip.md` | 活动热力图 Tooltip 规范 |

---

## P3 · 实施报告（归档）

| 文件路径 | 说明 |
|----------|------|
| `_bmad-output/planning-artifacts/reports/implementation-readiness-report-2026-04-14.md` | 最新实施就绪报告（2026-04-14） |
| `_bmad-output/planning-artifacts/reports/implementation-readiness-report-2026-04-13.md` | 实施就绪报告（2026-04-13） |
| `_bmad-output/planning-artifacts/reports/implementation-readiness-report-2026-04-10.md` | 实施就绪报告（2026-04-10） |

---

## 附录：BMad Skills 名称对照表

### Core 模块（核心工具集）

| Skill 名称 | 简码 | 作用描述 | 触发方式 |
|-----------|------|---------|---------|
| `bmad-help` | BH | BMad 帮助导航，分析当前状态并推荐下一步操作 | 说 "bmad help" 或 "what to do next" |
| `bmad-party-mode` | PM | 多 Agent 群组讨论，让多个 Agent 从不同视角协作对话 | 说 "party mode" 或 "group discussion" |
| `bmad-brainstorming` | BSP | 交互式头脑风暴，使用多种创意技法引导构思 | 说 "help me brainstorm" |
| `bmad-advanced-elicitation` | — | 深度批判与优化，推动 LLM 重新审视和改进输出 | 提及 socratic、first principles、pre-mortem、red team 等方法 |
| `bmad-distillator` | DG | 无损压缩文档，生成 token 高效的蒸馏版本供下游 LLM 消费 | 说 "distill documents" |
| `bmad-editorial-review-prose` | EP | 文案润色审查，检查文本的沟通问题并给出修改建议 | 说 "review for prose" |
| `bmad-editorial-review-structure` | ES | 结构性编辑审查，提出裁剪、重组和简化建议 | 说 "structural review" |
| `bmad-review-adversarial-general` | AR | 对抗性审查，以批判视角审查内容并生成发现报告 | 说 "critical review" |
| `bmad-review-edge-case-hunter` | ECH | 边界用例猎手，遍历所有分支路径和边界条件 | 需要穷举边界分析时使用 |
| `bmad-index-docs` | ID | 文档索引生成，创建/更新 index.md 引用文件夹内所有文档 | 说 "create index" |
| `bmad-shard-doc` | SD | 文档分片，将大型 Markdown 按二级标题拆分为多个小文件 | 说 "shard document" |

### BMad Method 模块（产品开发方法论）

#### Agent Skills（角色代理）

| Agent 名称 | 代号 | 角色定位 | 触发方式 |
|-----------|------|---------|---------|
| `bmad-agent-analyst` | Mary | 📊 战略业务分析师 + 需求专家 | 说 "talk to Mary" 或 "business analyst" |
| `bmad-agent-pm` | John | 📋 产品经理，专注 PRD 创建和需求发现 | 说 "talk to John" 或 "product manager" |
| `bmad-agent-ux-designer` | Sally | 🎨 UX 设计师 + UI 专家 | 说 "talk to Sally" 或 "UX designer" |
| `bmad-agent-architect` | Winston | 🏗️ 系统架构师 + 技术设计负责人 | 说 "talk to Winston" 或 "architect" |
| `bmad-agent-dev` | Amelia | 💻 高级软件工程师，执行 Story 实现和代码开发 | 说 "talk to Amelia" 或 "developer agent" |
| `bmad-agent-tech-writer` | Paige | 📚 技术文档专家 + 知识管理者 | 说 "talk to Paige" 或 "tech writer" |

#### Workflow Skills（工作流技能）

| 阶段 | Skill 名称 | 简码 | 作用描述 |
|------|-----------|------|---------|
| **分析** | `bmad-product-brief` | CB | 产品简报创建，通过引导式发现梳理产品概念 |
| **分析** | `bmad-prfaq` | WB | PRFAQ 挑战，Working Backwards 方法压力测试产品概念 |
| **分析** | `bmad-domain-research` | DR | 领域研究，行业深度调研和专业术语梳理 |
| **分析** | `bmad-market-research` | MR | 市场研究，竞争格局、客户需求和趋势分析 |
| **分析** | `bmad-technical-research` | TR | 技术研究，技术可行性和架构方案评估 |
| **分析** | `bmad-document-project` | DP | 项目文档化，分析现有项目生成 AI 可用的文档 |
| **规划** | `bmad-create-prd` | CP | 创建 PRD（产品需求文档），专家引导式产出 |
| **规划** | `bmad-validate-prd` | VP | 验证 PRD，对照标准检查 PRD 质量 |
| **规划** | `bmad-edit-prd` | EP | 编辑 PRD，修改已有的 PRD 文档 |
| **规划** | `bmad-create-ux-design` | CU | 创建 UX 设计，规划 UX 模式和设计规范 |
| **方案** | `bmad-create-architecture` | CA | 创建技术架构，引导式记录技术决策 |
| **方案** | `bmad-create-epics-and-stories` | CE | 创建 Epics 和 Stories，将需求拆解为史诗和用户故事 |
| **方案** | `bmad-check-implementation-readiness` | IR | 实现就绪检查，验证 PRD/UX/架构/Epics 是否对齐完整 |
| **方案** | `bmad-generate-project-context` | GPC | 生成项目上下文，扫描代码库生成 LLM 优化的 project-context.md |
| **实现** | `bmad-sprint-planning` | SP | Sprint 规划，生成实现计划供 Agent 按序执行 |
| **实现** | `bmad-sprint-status` | SS | Sprint 状态，汇总进度并路由到下一个工作流 |
| **实现** | `bmad-create-story` | CS/VS | 创建 Story / 验证 Story，准备和校验故事文件 |
| **实现** | `bmad-dev-story` | DS | 开发 Story，执行故事实现任务和测试 |
| **实现** | `bmad-code-review` | CR | 代码审查，使用多层并行审查 |
| **实现** | `bmad-checkpoint-preview` | CK | 检查点预览，LLM 辅助的人工审查 |
| **实现** | `bmad-qa-generate-e2e-tests` | QA | QA 自动化测试，为已实现功能生成端到端测试 |
| **实现** | `bmad-quick-dev` | QQ | 快速开发，统一的意图输入→代码输出工作流 |
| **实现** | `bmad-correct-course` | CC | 航向修正，管理 Sprint 执行中的重大变更 |
| **实现** | `bmad-retrospective` | ER | 回顾总结，Epic 完成后的经验教训提取 |

### BMad Builder 模块（构建器）

| Skill 名称 | 简码 | 作用描述 |
|-----------|------|---------|
| `bmad-bmb-setup` | SB | 安装/更新 BMad Builder 模块配置 |
| `bmad-agent-builder` (Build) | BA | 通过对话式发现创建、编辑或重建 Agent Skill |
| `bmad-agent-builder` (Analyze) | AA | 对已有 Agent 进行质量分析 |
| `bmad-workflow-builder` (Build) | BW | 创建、编辑或重建 Workflow/Utility Skill |
| `bmad-workflow-builder` (Analyze) | AW | 对已有 Workflow/Skill 进行质量分析 |
| `bmad-workflow-builder` (Convert) | CW | 将任意 Skill 转换为 BMad 兼容的结果导向格式 |
| `bmad-module-builder` (Ideate) | IM | 头脑风暴和规划 BMad 模块 |
| `bmad-module-builder` (Create) | CM | 将已构建的 Skills 脚手架为可安装的 BMad 模块 |
| `bmad-module-builder` (Validate) | VM | 验证模块结构的完整性和准确性 |

### Creative Intelligence Suite 模块（创意智能套件）

#### Agent Skills（创意角色）

| Agent 名称 | 代号 | 角色定位 | 触发方式 |
|-----------|------|---------|---------|
| `bmad-cis-agent-brainstorming-coach` | Carson | 🧠 精英头脑风暴专家，创意技法引导 | 说 "talk to Carson" |
| `bmad-cis-agent-creative-problem-solver` | Dr. Quinn | 🔬 系统性问题解决大师 | 说 "talk to Dr. Quinn" |
| `bmad-cis-agent-design-thinking-coach` | Maya | 🎨 设计思维大师，以人为本的设计流程 | 说 "talk to Maya" |
| `bmad-cis-agent-innovation-strategist` | Victor | ⚡ 颠覆式创新策略师 | 说 "talk to Victor" |
| `bmad-cis-agent-presentation-master` | Caravaggio | 🎨 视觉传达与演示专家 | 说 "talk to Caravaggio" |
| `bmad-cis-agent-storyteller` | Sophia | 📖 叙事大师 | 说 "talk to Sophia" |

#### Workflow Skills（创意工作流）

| Skill 名称 | 简码 | 作用描述 |
|-----------|------|---------|
| `bmad-cis-design-thinking` | — | 设计思维引导，6 个阶段 30 种方法 |
| `bmad-cis-innovation-strategy` | — | 创新策略，6 大类 30 种战略框架 |
| `bmad-cis-problem-solving` | — | 系统性问题解决，6 大类 30 种方法 |
| `bmad-cis-storytelling` | — | 叙事构建，6 大类 25 种故事框架 |

### Test Architecture Enterprise 模块（测试架构）

#### Agent Skill

| Agent 名称 | 代号 | 角色定位 | 触发方式 |
|-----------|------|---------|---------|
| `bmad-tea` | Murat | 🧪 测试架构大师 + 质量顾问 | 说 "talk to Murat" 或 "test architect" |

#### Workflow Skills（测试工作流）

| Skill 名称 | 简码 | 作用描述 | 阶段 |
|-----------|------|---------|------|
| `bmad-teach-me-testing` | TMT | 测试教学，7 节课程渐进式学习 | 学习 |
| `bmad-testarch-test-design` | TD | 测试设计，基于风险的测试规划 | 方案设计 |
| `bmad-testarch-framework` | TF | 测试框架初始化 | 方案设计 |
| `bmad-testarch-ci` | CI | CI/CD 配置，搭建质量流水线 | 方案设计 |
| `bmad-testarch-atdd` | AT | ATDD 验收测试驱动开发 | 实现 |
| `bmad-testarch-automate` | TA | 测试自动化，扩展测试覆盖率 | 实现 |
| `bmad-testarch-test-review` | RV | 测试审查，质量审计 | 实现 |
| `bmad-testarch-nfr` | NR | 非功能需求评估 | 实现 |
| `bmad-testarch-trace` | TR | 可追溯性矩阵 | 实现 |

### 快速查找表

| 我想... | 推荐使用的 Skill |
|--------|-----------------|
| 创建产品需求文档 | `bmad-create-prd` |
| 设计技术架构 | `bmad-create-architecture` |
| 头脑风暴创意 | `bmad-brainstorming` 或 `talk to Carson` |
| 设计思维流程 | `bmad-cis-design-thinking` |
| 制定创新策略 | `bmad-cis-innovation-strategy` |
| 解决复杂问题 | `bmad-cis-problem-solving` 或 `talk to Dr. Quinn` |
| 构建叙事故事 | `bmad-cis-storytelling` 或 `talk to Sophia` |
| 多角度审视决策 | `bmad-party-mode` |
| 深度批判优化 | `bmad-advanced-elicitation` |
| 压缩文档供 AI 消费 | `bmad-distillator` |
| 规划测试策略 | `bmad-testarch-test-design` 或 `talk to Murat` |
| 创建自定义 Agent | `bmad-agent-builder` |
| 创建自定义 Workflow | `bmad-workflow-builder` |
| 获取帮助导航 | `bmad-help` |
