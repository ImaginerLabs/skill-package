# Story: refactor-5 — EmptyState 增强 + useSortableStep 创建与迁移

**Epic:** epic-refactor-component-abstraction
**Phase:** 2（中风险 — 逻辑层 + 增强）
**Status:** done
**Spec:** `spec-component-abstraction-and-reuse.md`

---

## Context

### EmptyState 增强

当前 `EmptyState.tsx` 仅处理 Skill 浏览的 3 种空状态（无 Skill/无搜索结果/分类为空），接口为 `hasSkills + isCategoryEmpty`。其他模块（SyncTargetManager/SkillSelector/SkillPreview）各自实现空状态 UI。

Spec 要求增强 EmptyState 支持 4 种 variant：`noSkill` / `noResult` / `emptyCategory` / `custom`，使其可复用于全局场景。

### useSortableStep

StepItem 和 CustomStepCard 中存在几乎相同的 `useSortable` + 键盘排序逻辑（`Alt+↑/↓`）：
1. **StepItem.tsx:50-57** — `useSortable({ id: ... })` + `handleKeyDown` (Alt+Arrow)
2. **CustomStepCard.tsx:38-50** — `useSortable({ id: ... })` + `handleKeyDown` (Alt+Arrow)

---

## Acceptance Criteria

- [ ] AC1: EmptyState 支持 `variant: "noSkill" | "noResult" | "emptyCategory" | "custom"`
- [ ] AC2: `variant="noSkill"` 显示引导性空状态（大字号标题 + 引导文案 + 操作按钮）
- [ ] AC3: `variant="noResult"` 显示搜索无结果提示（建议文案 + 清除筛选链接）
- [ ] AC4: `variant="emptyCategory"` 显示分类为空提示（降低视觉优先级）
- [ ] AC5: `variant="custom"` 支持自定义 `icon?` + `title?` + `description?` + `action?`
- [ ] AC6: `useSortableStep` 返回 `{ attributes, listeners, setNodeRef, style, isDragging, handleKeyDown }`
- [ ] AC7: StepItem 迁移后拖拽排序和键盘排序行为不变
- [ ] AC8: CustomStepCard 迁移后拖拽排序和键盘排序行为不变
- [ ] AC9: 所有新组件/Hook 无硬编码中文字符串
- [ ] AC10: 现有测试全部通过

---

## Tasks

### Task 1: 增强 `src/components/skills/EmptyState.tsx`

- [ ] 新增 `variant` prop（默认保持向后兼容：根据 `hasSkills` + `isCategoryEmpty` 自动推断）
- [ ] 实现 variant 映射表（按 spec Design Notes）：
  - `noSkill` → Package icon + 引导标题 + 引导文案 + 操作按钮
  - `noResult` → SearchX icon + 无结果提示 + 建议文案
  - `emptyCategory` → FolderOpen icon + 分类为空提示
  - `custom` → 自定义 icon/title/description/action
- [ ] 新增 `action?: { label: string; onClick: () => void }` prop
- [ ] 保持旧接口 `hasSkills + isCategoryEmpty` 向后兼容（内部映射到 variant）
- [ ] 所有用户可见文本使用 i18n
- [ ] 编写单元测试 `tests/unit/components/EmptyState.test.tsx`

### Task 2: 创建 `src/hooks/useSortableStep.ts`

- [ ] 定义 `UseSortableStepOptions` 接口：`id: string / index: number / onReorder?: (fromIndex: number, toIndex: number) => void`
- [ ] 封装 `useSortable` + `CSS.Transform.toString`
- [ ] 封装 `handleKeyDown`：`Alt+↑` → `onMoveUp`，`Alt+↓` → `onMoveDown`
- [ ] 返回 `{ attributes, listeners, setNodeRef, style, isDragging, handleKeyDown }`
- [ ] 编写单元测试 `tests/unit/hooks/useSortableStep.test.ts`

### Task 3: 迁移 StepItem.tsx

- [ ] 替换 `useSortable` + `handleKeyDown` 为 `useSortableStep`
- [ ] 验证拖拽排序和键盘排序行为不变
- [ ] 运行 `tests/unit/components/workflow/StepItem.test.tsx` 通过

### Task 4: 迁移 CustomStepCard.tsx

- [ ] 替换 `useSortable` + `handleKeyDown` 为 `useSortableStep`
- [ ] 验证拖拽排序和键盘排序行为不变
- [ ] 运行全量测试通过

### Task 5: 迁移 SyncTargetManager 空状态

- [ ] 将手写的引导空状态替换为 `<EmptyState variant="custom" ... />` 或合适 variant
- [ ] 验证视觉和交互不变

### Task 6: 最终验证

- [ ] `tsc --noEmit` 零错误
- [ ] `vitest run` 全部通过
- [ ] `npm run lint` 零错误
- [ ] 手动验证 EmptyState 各 variant 视觉表现
- [ ] 手动验证 StepItem/CustomStepCard 拖拽和键盘排序

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| Started | — |
| Completed | — |
| Test Results | — |
| Review Status | — |
