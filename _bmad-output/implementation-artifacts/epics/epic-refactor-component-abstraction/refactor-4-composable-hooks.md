# Story: refactor-4 — 组合式 Skill 列表 Hooks 拆分

**Epic:** epic-refactor-component-abstraction
**Phase:** 2（中风险 — 逻辑层）
**Status:** done
**Spec:** `spec-component-abstraction-and-reuse.md`
**Depends on:** refactor-1（useConfirmDialog）

---

## Context

SkillGrid 和 SkillListView 共享大量逻辑（筛选、搜索、删除确认、键盘导航），但布局差异大，不适合合并组件。当前各自重复调用 `useFilteredSkills` + `useSkillSearch` + `useRovingFocus` + 删除状态管理。

Spec 决策：保留两个视图组件，通过组合式 Hooks 共享逻辑，将重复逻辑拆分为 3 个独立 Hook：
1. `useSkillFiltering` — 筛选 + 搜索 + 空状态判断
2. `useSkillActions` — 删除确认 + 列表操作（基于 useConfirmDialog）
3. `useKeyboardNav` — roving focus + 键盘事件（Space/Enter/Delete）

---

## Acceptance Criteria

- [ ] AC1: `useSkillFiltering` 封装 `useFilteredSkills` + `useSkillSearch` + `isCategoryEmpty` 逻辑
- [ ] AC2: `useSkillActions` 基于 `useConfirmDialog` 封装删除确认 + 列表操作
- [ ] AC3: `useKeyboardNav` 封装 roving focus + Space/Enter/Delete 键盘事件处理
- [ ] AC4: SkillGrid 迁移后搜索/筛选/删除/键盘导航行为不变
- [ ] AC5: SkillListView 迁移后搜索/筛选/删除/键盘导航行为不变
- [ ] AC6: 现有测试全部通过

---

## Tasks

### Task 1: 创建 `src/hooks/useSkillFiltering.ts`

- [ ] 封装 `useFilteredSkills` + `useSkillSearch` + `isCategoryEmpty` 计算
- [ ] 接口：接收 `skills, categories, selectedCategory, selectedSource, searchQuery`
- [ ] 返回 `{ filteredSkills, isCategoryEmpty }`
- [ ] 编写单元测试 `tests/unit/hooks/useSkillFiltering.test.ts`

### Task 2: 创建 `src/hooks/useSkillActions.ts`

- [ ] 基于 `useConfirmDialog` 封装删除确认逻辑
- [ ] 接口：接收 `onConfirmDelete: (target) => Promise<void>`
- [ ] 返回 `{ confirmState, requestDelete, handleConfirmDelete, handleCancelDelete }`
- [ ] 编写单元测试 `tests/unit/hooks/useSkillActions.test.ts`

### Task 3: 创建 `src/hooks/useKeyboardNav.ts`

- [ ] 封装 roving focus + Space/Enter/Delete 事件处理
- [ ] 接口：接收 `itemCount, isActive, onSelect, onPreview, onDelete`
- [ ] 返回 `{ focusedIndex, getItemProps, getWrappedItemProps }`
- [ ] 编写单元测试 `tests/unit/hooks/useKeyboardNav.test.ts`

### Task 4: 迁移 SkillGrid.tsx

- [ ] 替换重复逻辑为组合式 Hooks 调用
- [ ] SkillGrid 只关心渲染层
- [ ] 验证搜索/筛选/删除/键盘导航行为不变
- [ ] 运行 `tests/unit/components/skills/SkillGrid.test.tsx` 通过

### Task 5: 迁移 SkillListView.tsx

- [ ] 替换重复逻辑为组合式 Hooks 调用
- [ ] SkillListView 只关心渲染层
- [ ] 验证搜索/筛选/删除/键盘导航行为不变
- [ ] 运行全量测试通过

### Task 6: 最终验证

- [ ] `tsc --noEmit` 零错误
- [ ] `vitest run` 全部通过
- [ ] `npm run lint` 零错误
- [ ] 手动验证 SkillGrid/SkillListView 搜索/删除/键盘导航功能正常

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| Started | 2026-04-16T15:36 |
| Completed | 2026-04-16T15:39 |
| Test Results | useSkillFiltering.test ✅ 6 tests · 全量 ✅ 1157 tests |
| Review Status | Hook+迁移已在先前完成，本次补充 useSkillFiltering 单元测试并验证 |
