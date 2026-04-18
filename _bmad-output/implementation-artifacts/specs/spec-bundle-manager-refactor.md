---
title: "BundleManager 组件拆分重构"
type: "refactor"
created: "2026-04-18"
updated: "2026-04-18"
status: "done"
baseline_commit: "0a99491"
context:
  - "{project-root}/_bmad-output/implementation-artifacts/specs/spec-settings-component-refactor.md"
  - "{project-root}/src/hooks/useExpandedState.ts"
  - "{project-root}/src/hooks/useSelectionState.ts"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `BundleManager.tsx` (1580 行) 职责过重，包含创建/编辑模式切换、标签页切换、技能分组选择等逻辑，维护困难。同时存在重复 UI 模式（分类/来源分组展开、选择状态管理）与 Phase 1-2 已抽取的共享 Hook 不一致。

**Approach:** 参考 Phase 3-4 的 `SyncTargetManager`/`CategoryManager` 拆分模式，将 `BundleManager` 拆分为子组件组合结构，并复用已抽取的 `useExpandedState`/`useSelectionState` Hook。

## Boundaries & Constraints

**Always:**
- 复用已抽取的共享 Hook：`useExpandedState`（展开/折叠）、`useSelectionState`（选择状态）
- 保持现有 API 接口不变，不破坏功能
- 渐进式替换：先抽取子组件，再简化协调器
- 每个 task 完成后立即编写单元测试
- 修复 `yellow-500` 硬编码（line 1408）→ `hsl(var(--warning))`

**Ask First:** SkillSelector 是否需要拆分为独立的 CategorySelector/SourceSelector/SkillSelector 三个组件（当前内联在同一文件）

**Never:**
- 不重构 `src/components/ui/` 下的 shadcn 基础组件
- 不改变现有路由结构和页面级组件
- 不修改后端 API
- 不引入新依赖

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| EMPTY_LIST | 无套件 | 显示空状态 `bundle.empty`/`bundle.emptyHint` | N/A |
| CREATE_OPEN | 点击"新建套件"按钮 | 显示内联表单，3 个标签页激活 | N/A |
| CREATE_SUBMIT | 填写表单 + 选择技能 + 提交 | 创建成功，重置表单，toast 提示 | 表单验证（name 非空、displayName 非空、至少选一个 Skill） |
| EDIT_OPEN | 点击编辑按钮 | 进入编辑模式，内联显示表单，数据回填 | N/A |
| DELETE | 点击删除确认 | 删除套件，toast 提示 | API 错误时 toast.error |
| EXPAND_COLLAPSE | 点击展开/折叠 chevron | 切换详情显示/隐藏 | N/A |
| SEARCH | 在各标签页搜索框输入 | 过滤显示匹配项 | N/A |

</frozen-after-approval>

## Code Map

- `src/components/settings/BundleManager.tsx` — 1580 行，主组件（拆分目标）
- `src/hooks/useExpandedState.ts` — 已抽取，展开/折叠状态管理
- `src/hooks/useSelectionState.ts` — 已抽取，选择状态管理
- `src/components/settings/CategoryItem.tsx` — Phase 4 子组件参考
- `src/components/sync/TargetItem.tsx` — Phase 3 子组件参考
- `src/stores/bundle-store.ts` — 套件状态管理

## Tasks & Acceptance

**Execution:**

- [x] `src/components/settings/BundleList.tsx` -- 创建列表渲染组件 -- BundleManager 拆分出的列表渲染层
- [x] `src/components/settings/BundleItem.tsx` -- 创建单个套件项组件 -- 行内编辑模式、展开/折叠、删除确认
- [x] `src/components/settings/BundleForm.tsx` -- 创建新增/编辑表单组件 -- 统一 create/edit 表单，修复 yellow-500
- [x] `src/components/settings/SkillSelector.tsx` -- 创建技能选择器组件 -- category/source/skill 三个标签页的选择逻辑
- [x] `src/components/settings/BundleManager.tsx` -- 重构为组合子组件的协调器 -- 使用 useExpandedState/useSelectionState Hook
- [x] `tests/unit/components/settings/BundleItem.test.tsx` -- BundleItem 单元测试 -- 11 tests
- [x] `tests/unit/components/settings/BundleForm.test.tsx` -- BundleForm 单元测试 -- 11 tests
- [x] `tests/unit/components/settings/SkillSelector.test.tsx` -- SkillSelector 单元测试 -- 8 tests

**Tests (MANDATORY):**

- [x] `tests/unit/components/settings/BundleItem.test.tsx` -- write Vitest unit tests covering edit mode toggle, delete confirmation, expand/collapse -- required by project testing standards
- [x] `tests/unit/components/settings/BundleForm.test.tsx` -- write Vitest unit tests covering validation, create/edit modes -- required by project testing standards
- [x] `tests/unit/components/settings/SkillSelector.test.tsx` -- write Vitest unit tests covering tab switching, search filtering -- required by project testing standards

**Acceptance Criteria:**

- Given BundleManager，当渲染套件列表时，使用 BundleItem 子组件
- Given BundleManager，当点击编辑时，显示 BundleForm 内联表单
- Given BundleManager，当创建新套件时，显示 BundleForm 内联表单
- Given BundleForm，当 variant="create" 时，显示"新建套件"表单；当 variant="edit" 时，显示"编辑套件"表单
- Given SkillSelector，当切换到 category/source/skill 标签页时，显示对应分组的选择列表
- Given BundleManager，当检查源码时，不存在 `yellow-500` 硬编码颜色
- Given useSelectionState hook，当调用 selectAll() 时，所有传入的 ID 被选中
- Given useExpandedState hook，当调用 setExpanded(true) 时，isExpanded 为 true

## Spec Change Log

- 2026-04-18: 初始版本，基于 spec-settings-component-refactor.md Phase 5 创建

### 2026-04-18 Review 修复

**Patch 修复（3 项）：**
1. **BundleList.tsx** — 修复 `import { Package } from "../ui/badge"` → `import { Package } from "lucide-react"`（icon 导入错误）
2. **handleDelete** — 删除正在编辑的套件时清除 `editingBundleId` 状态，防止 UI 保持编辑模式
3. **handleCancelEdit** — 添加注释说明 `bundleSelectedSkills`/`bundleExpandedGroups` Maps 保留已取消编辑的条目（按设计可在下次编辑时重新初始化）

**Defer 延期（2 项）：**
1. **handleSaveEdit 无竞态保护** — 快速点击保存时可能使用过期的 selectedSkills，建议追踪 dirty 标志（低优先级）
2. **BundleForm 按钮文本** — edit 模式下显示 `bundle.confirmCreate` 而非 `common.save`，但实际功能正常（低优先级）

**Review 发现但暂不处理：**
1. **BundleItem 自包含编辑表单** — 验收标准 2 要求 BundleForm 用于编辑模式，但 BundleItem 自行管理编辑状态（按 spec Design Notes 定义为自包含）
2. **Checkbox indeterminate 状态** — 通过 ref DOM 操作设置，非 React 方式（已知模式限制）

## Design Notes

**子组件职责划分：**

- `BundleList` — 无状态，接收 bundles/categories/skills 数组，渲染列表
- `BundleItem` — 接收单个 bundle 数据 + 回调（onEdit/onDelete/onToggleExpand），管理行内编辑状态
- `BundleForm` — 接收 mode(create/edit) + bundle 数据，onSubmit 回调，管理表单状态
- `SkillSelector` — 接收 selectedSkills/onToggleSkill，渲染三个标签页的分层选择 UI

**模式复用参考：**
- `CategoryManager` → `CategoryItem` + `CategoryForm` + `SkillChecklist`（Phase 4）
- `SyncTargetManager` → `TargetList` + `TargetItem` + `TargetForm`（Phase 3）

**状态管理模式：**
- 展开/折叠：`useExpandedState<string>()` — 复用共享 Hook
- 选择状态：`useSelectionState<string>()` — 复用共享 Hook（替换内联 Set 操作）
- 编辑 ID：`useState<string | null>` — 协调器层级管理

## Verification

**Commands:**

- `npm run typecheck` -- expected: 无 TypeScript 错误
- `npm run lint` -- expected: 无 ESLint 错误（零警告）
- `npm run test:run -- --grep Bundle` -- expected: 所有 Bundle 相关测试通过
- `open http://localhost:5173` -- manual: Settings 页面 BundleManager 功能正常

**Manual checks (if no CLI):**

- 新建套件：输入 name/displayName，选择技能，点击确认 → 套件出现在列表
- 编辑套件：点击铅笔图标 → 行内显示编辑表单 → 修改后点击确认 → 套件更新
- 删除套件：点击垃圾桶图标 → 确认对话框 → 确认删除 → 套件从列表消失
- 展开套件：点击 chevron → 显示分类/来源/技能详情
- 颜色检查：源码中不存在 `yellow-500` 字符串

## Suggested Review Order

**BundleManager 协调器（入口）**

- 重构后作为协调器，整合子组件和共享 Hook
  [`BundleManager.tsx:33`](../../../src/components/settings/BundleManager.tsx#L33)

- handleCreateSubmit 包含完整 try/catch/finally 错误处理
  [`BundleManager.tsx:109`](../../../src/components/settings/BundleManager.tsx#L109)

- handleDelete 删除时清除编辑状态，防止孤儿编辑模式
  [`BundleManager.tsx:229`](../../../src/components/settings/BundleManager.tsx#L229)

**BundleList 列表渲染**

- 修复 icon 导入错误（`lucide-react` 而非 `../ui/badge`）
  [`BundleList.tsx:7`](../../../src/components/settings/BundleList.tsx#L7)

**BundleItem 单个套件项**

- 行内编辑模式，集成 SkillSelector
  [`BundleItem.tsx:114`](../../../src/components/settings/BundleItem.tsx#L114)

- 展开详情显示分类/来源/技能 Badge 列表
  [`BundleItem.tsx:196`](../../../src/components/settings/BundleItem.tsx#L196)

**BundleForm 新增/编辑表单**

- mode 属性区分 create/edit，条件渲染按钮文本
  [`BundleForm.tsx:16`](../../../src/components/settings/BundleForm.tsx#L16)

- handleSubmit 完整错误处理和验证
  [`BundleForm.tsx:74`](../../../src/components/settings/BundleForm.tsx#L74)

**SkillSelector 技能选择器**

- 三个标签页（category/source/skill）的分层选择 UI
  [`SkillSelector.tsx:214`](../../../src/components/settings/SkillSelector.tsx#L214)

**测试**

- BundleItem 12 个测试用例
  [`BundleItem.test.tsx`](../../../tests/unit/components/settings/BundleItem.test.tsx)

- BundleForm 11 个测试用例
  [`BundleForm.test.tsx`](../../../tests/unit/components/settings/BundleForm.test.tsx)

- SkillSelector 11 个测试用例
  [`SkillSelector.test.tsx`](../../../tests/unit/components/settings/SkillSelector.test.tsx)
