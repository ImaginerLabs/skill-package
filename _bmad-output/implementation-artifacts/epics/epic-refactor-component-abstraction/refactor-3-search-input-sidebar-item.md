# Story: refactor-3 — SearchInput + SidebarItem 创建与迁移

**Epic:** epic-refactor-component-abstraction
**Phase:** 1（低风险高收益 — 基础设施层）
**Status:** ready-for-dev
**Spec:** `spec-component-abstraction-and-reuse.md`

---

## Context

### SearchInput

项目中存在搜索输入模式的重复（左侧 Search 图标 + Input + placeholder）：
1. **SkillSelector.tsx:42-55** — 手动组合 `<Search>` + `<Input>`，`placeholder="搜索 Skill..."`

Spec 定义了更完整的 SearchInput：受控组件、清空按钮（有内容时显示 ×）、placeholder 默认值、autoFocus。

### SidebarItem

CategoryTree 和 SourceTree 中存在几乎相同的选中/未选中样式：
1. **CategoryTree.tsx:49-53** — `border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium`
2. **SourceTree.tsx:90-94** — `border-l-[3px] border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium`

注意：两处 border-l 粗细不一致（2px vs 3px），SidebarItem 统一为 3px（spec 设计）。CategoryTree 使用 `font-medium`，spec 要求 active 用 `font-semibold` 与 hover 区分。

---

## Acceptance Criteria

- [ ] AC1: `SearchInput` 是纯受控组件，`value` + `onChange` 由父组件管理
- [ ] AC2: `SearchInput` 有输入内容时显示 × 清空按钮，点击触发 `onChange("")`
- [ ] AC3: `SearchInput` 左侧 Search 图标 muted-foreground 色，输入时变 primary 色
- [ ] AC4: `SearchInput` 默认 placeholder 使用 i18n
- [ ] AC5: `SidebarItem` 使用 CVA variants（`active: true/false` + `state: default/disabled`）
- [ ] AC6: `SidebarItem` active 状态：border-l 3px primary + accent 背景 + font-semibold
- [ ] AC7: `SidebarItem` hover 状态：accent 背景 + 无字重变化（与 active 可区分）
- [ ] AC8: CategoryTree 迁移后视觉样式一致
- [ ] AC9: SourceTree 迁移后视觉样式一致
- [ ] AC10: SkillSelector 迁移后搜索行为不变
- [ ] AC11: 所有新组件无硬编码中文字符串
- [ ] AC12: 现有测试全部通过

---

## Tasks

### Task 1: 创建 `src/components/shared/SearchInput.tsx`

- [ ] 定义 props：`value?: string / onChange?: (value: string) => void / placeholder?: string / autoFocus?: boolean / className?: string`
- [ ] 实现：左侧 Search 图标 + Input + 有内容时显示 × 清空按钮
- [ ] Focus 时边框高亮（primary 色 outline）
- [ ] 默认 placeholder 使用 `t("common.search")` 或类似 i18n key
- [ ] 编写单元测试 `tests/unit/components/SearchInput.test.tsx`

### Task 2: 创建 `src/components/shared/SidebarItem.tsx`

- [ ] 定义 CVA variants（按 spec Design Notes）：
  - `active: true` — `border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-semibold`
  - `active: false` — `border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]`
  - `state: disabled` — `opacity-50 cursor-not-allowed pointer-events-none`
- [ ] Props：`active?: boolean / state?: "default" | "disabled" / icon?: React.ReactNode / label: React.ReactNode / badge?: React.ReactNode / onClick?: () => void / className?: string`
- [ ] 编写单元测试 `tests/unit/components/SidebarItem.test.tsx`

### Task 3: 迁移 SkillSelector.tsx

- [ ] 替换手动组合的 Search + Input 为 `<SearchInput value={query} onChange={setQuery} />`
- [ ] 验证搜索筛选行为不变
- [ ] 运行 `tests/unit/components/workflow/SkillSelector.test.tsx` 通过

### Task 4: 迁移 CategoryTree.tsx

- [ ] 替换重复的选中/未选中 className 为 `<SidebarItem active={...} icon={...} label={...} badge={...} onClick={...} />`
- [ ] 统一 border-l 粗细为 3px（spec 标准）
- [ ] 统一 active 字重为 `font-semibold`
- [ ] 验证视觉样式一致
- [ ] 运行 `tests/unit/components/CategoryTree.test.tsx` 通过

### Task 5: 迁移 SourceTree.tsx

- [ ] 替换重复的选中/未选中 className 为 `<SidebarItem active={...} icon={...} label={...} badge={...} onClick={...} />`
- [ ] 验证视觉样式一致
- [ ] 运行 `tests/unit/components/skills/SourceTree.test.tsx` 通过

### Task 6: 最终验证

- [ ] `tsc --noEmit` 零错误
- [ ] `vitest run` 全部通过
- [ ] `npm run lint` 零错误
- [ ] 手动验证 CategoryTree/SourceTree 选中样式一致且与 hover 可区分
- [ ] 手动验证 SearchInput 清空按钮行为

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| Started | 2026-04-16T15:35 |
| Completed | 2026-04-16T15:36 |
| Test Results | SearchInput.test ✅ 7 tests · SidebarItem.test ✅ 9 tests · 全量通过 |
| Review Status | 组件+迁移已在先前完成，本次补充 SidebarItem 单元测试并验证 |
