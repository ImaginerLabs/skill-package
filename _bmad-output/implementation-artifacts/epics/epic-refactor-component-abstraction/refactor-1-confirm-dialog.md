# Story: refactor-1 — ConfirmDialog + useConfirmDialog 创建与迁移

**Epic:** epic-refactor-component-abstraction
**Phase:** 1（低风险高收益 — 基础设施层）
**Status:** done
**Spec:** `spec-component-abstraction-and-reuse.md`

---

## Context

项目中存在 6 处重复的 AlertDialog 确认模式：
1. **SkillGrid.tsx** — 删除 Skill 确认（受控模式，`deleteTarget` 状态）
2. **SkillListView.tsx** — 删除 Skill 确认（受控模式，与 SkillGrid 几乎相同）
3. **MetadataEditor.tsx** — 删除 Skill 确认（Trigger 模式，`AlertDialogTrigger`）
4. **SyncTargetManager.tsx** — 删除同步目标确认（受控模式，硬编码中文）
5. **CleanupConfirmDialog.tsx** — 清理源文件确认（独立组件，硬编码中文）
6. **ReplaceSyncConfirmDialog.tsx** — 替换同步确认（独立组件，带 AlertTriangle 图标）

需要提取统一的 `ConfirmDialog` 组件 + `useConfirmDialog` Hook，消除重复。

---

## Acceptance Criteria

- [ ] AC1: `ConfirmDialog` 组件支持 `open/onOpenChange/title/description/confirmLabel/cancelLabel/variant(danger|default)/onConfirm/confirmDisabled/defaultFocus("cancel"|"confirm")` props
- [ ] AC2: `useConfirmDialog<T>()` Hook 返回 `{ confirmState: { open, target }, requestConfirm, handleConfirm, handleCancel }`，泛型 target 类型
- [ ] AC3: ConfirmDialog 默认聚焦"取消"按钮（`defaultFocus="cancel"`），危险操作防误触
- [ ] AC4: `variant="danger"` 时确认按钮显示 destructive 样式
- [ ] AC5: SkillGrid 和 SkillListView 迁移后，删除确认行为与重构前完全一致
- [ ] AC6: MetadataEditor 迁移后，删除确认行为与重构前完全一致
- [ ] AC7: SyncTargetManager 迁移后，删除确认行为与重构前完全一致
- [ ] AC8: CleanupConfirmDialog 和 ReplaceSyncConfirmDialog 迁移后，确认行为与重构前完全一致
- [ ] AC9: 所有新创建的共享组件无硬编码中文字符串（全部使用 `t()`）
- [ ] AC10: 现有测试全部通过

---

## Tasks

### Task 1: 创建 `src/hooks/useConfirmDialog.ts`

- [ ] 定义泛型接口 `UseConfirmDialogReturn<T>`
- [ ] 实现 `useConfirmDialog<T>()` Hook
  - `confirmState: { open: boolean; target: T | null }`
  - `requestConfirm(target: T)` — 设置 target 并 open=true
  - `handleConfirm()` — 回调执行后关闭
  - `handleCancel()` — 关闭并清除 target
- [ ] 支持传入 `onConfirm: (target: T) => void | Promise<void>` 回调
- [ ] 编写单元测试 `tests/unit/hooks/useConfirmDialog.test.ts`

### Task 2: 创建 `src/components/shared/ConfirmDialog.tsx`

- [ ] 基于 AlertDialog 封装，支持完整 props
- [ ] 实现 `variant` CVA：`default`（默认按钮样式）和 `danger`（destructive 样式）
- [ ] 实现 `defaultFocus`：`"cancel"` 时 `AlertDialogCancel` 自动聚焦，`"confirm"` 时 `AlertDialogAction` 自动聚焦
- [ ] 所有用户可见文本使用 i18n（`useTranslation` + `t()`）
- [ ] 编写单元测试 `tests/unit/components/ConfirmDialog.test.tsx`

### Task 3: 迁移 SkillGrid.tsx

- [ ] 替换 `deleteTarget` + `setDeleteTarget` + `handleConfirmDelete` 为 `useConfirmDialog`
- [ ] 替换内联 AlertDialog 为 `<ConfirmDialog variant="danger" />`
- [ ] 验证搜索→删除确认→项目移除行为不变
- [ ] 运行现有 `tests/unit/components/skills/SkillGrid.test.tsx` 通过

### Task 4: 迁移 SkillListView.tsx

- [ ] 替换 `deleteTarget` + `setDeleteTarget` + `handleConfirmDelete` 为 `useConfirmDialog`
- [ ] 替换内联 AlertDialog 为 `<ConfirmDialog variant="danger" />`
- [ ] 验证行为不变
- [ ] 运行全量测试通过

### Task 5: 迁移 MetadataEditor.tsx

- [ ] 将 `AlertDialogTrigger` 模式改为 `useConfirmDialog` + `ConfirmDialog`
- [ ] 删除按钮不再用 AlertDialogTrigger，改为 `requestConfirm(skill)` 触发
- [ ] 验证行为不变
- [ ] 运行全量测试通过

### Task 6: 迁移 SyncTargetManager.tsx

- [ ] 替换 `deleteTarget` + `setDeleteTarget` + `handleDelete` 为 `useConfirmDialog`
- [ ] 替换内联 AlertDialog 为 `<ConfirmDialog variant="danger" />`
- [ ] 删除硬编码中文，改用 i18n
- [ ] 验证行为不变
- [ ] 运行全量测试通过

### Task 7: 迁移 CleanupConfirmDialog.tsx

- [ ] 重写为使用 `ConfirmDialog` 组件
- [ ] 删除硬编码中文，改用 i18n
- [ ] 保留 `dialog.open` → `open` 传参和 `onConfirm` 回调
- [ ] 验证行为不变
- [ ] 运行全量测试通过

### Task 8: 迁移 ReplaceSyncConfirmDialog.tsx

- [ ] 重写为使用 `ConfirmDialog` 组件，`variant="danger"`
- [ ] 保留 AlertTriangle 图标（通过 `description` 插入或扩展 `icon` prop）
- [ ] 保留 `skillCount` 动态文案
- [ ] 验证行为不变
- [ ] 运行全量测试通过

### Task 9: 最终验证

- [ ] `tsc --noEmit` 零错误
- [ ] `vitest run` 全部通过
- [ ] `npm run lint` 零错误
- [ ] 手动验证所有 6 处迁移的确认对话框行为

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| Started | — |
| Completed | — |
| Test Results | — |
| Review Status | — |
