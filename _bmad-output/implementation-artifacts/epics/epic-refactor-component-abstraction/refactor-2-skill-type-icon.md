# Story: refactor-2 — SkillTypeIcon 创建与迁移

**Epic:** epic-refactor-component-abstraction
**Phase:** 1（低风险高收益 — 基础设施层）
**Status:** done
**Spec:** `spec-component-abstraction-and-reuse.md`

---

## Context

项目中存在 4 处重复的 Skill 类型图标判断：

1. **SkillCard.tsx:83-93** — `skill.type === "workflow" ? <GitBranch size={16} className="mt-0.5 shrink-0 text-[hsl(var(--info))]" /> : <FileText size={16} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />`
2. **SkillList.tsx:51-55** — `skill.type === "workflow" ? <GitBranch size={14} className="shrink-0 text-[hsl(var(--info))]" /> : <FileText size={14} className="shrink-0 text-[hsl(var(--primary))]" />`
3. **SkillPreview.tsx:146-150** — `skill.type === "workflow" ? <GitBranch size={18} className="text-[hsl(var(--info))]" /> : <FileText size={18} className="text-[hsl(var(--primary))]" />`
4. **CommandPalette.tsx:138-140,174-176** — `FileText` 和 `GitBranch` 分别用在常规 Skill 和工作流搜索结果中

注意：spec 要求统一使用 `muted-foreground` 色（弱化图标，让技能名称成为视觉焦点），但当前代码使用 `info`/`primary` 色。迁移时按 spec 设计执行，使用 muted 色统一。

---

## Acceptance Criteria

- [ ] AC1: `SkillTypeIcon` 接收 `type: SkillMeta["type"]` + `size?: number`（默认 16）
- [ ] AC2: `type === "workflow"` 时渲染 `GitBranch`（muted-foreground 色），其他渲染 `FileText`（muted-foreground 色）
- [ ] AC3: SkillCard 迁移后类型图标渲染正确
- [ ] AC4: SkillList 迁移后类型图标渲染正确
- [ ] AC5: SkillPreview 迁移后类型图标渲染正确
- [ ] AC6: CommandPalette 迁移后类型图标渲染正确
- [ ] AC7: 组件内无硬编码中文字符串（全部使用 `t()`）
- [ ] AC8: 现有测试全部通过

---

## Tasks

### Task 1: 创建 `src/components/shared/SkillTypeIcon.tsx`

- [ ] 定义 `SkillTypeIconProps` 接口：`type: SkillMeta["type"]` + `size?: number` + `className?: string`
- [ ] 实现：`type === "workflow"` → `<GitBranch>`，默认 → `<FileText>`
- [ ] 统一使用 `text-[hsl(var(--muted-foreground))]` 色（按 spec 设计）
- [ ] 编写单元测试 `tests/unit/components/SkillTypeIcon.test.tsx`

### Task 2: 迁移 SkillCard.tsx

- [ ] 替换 `skill.type === "workflow" ? <GitBranch .../> : <FileText .../>` 为 `<SkillTypeIcon type={skill.type} size={16} />`
- [ ] 删除 `GitBranch` 和 `FileText` 的 import（如不再使用）
- [ ] 添加 `SkillTypeIcon` import
- [ ] 运行 `tests/unit/components/SkillCard.test.tsx` 通过

### Task 3: 迁移 SkillList.tsx

- [ ] 替换类型图标判断为 `<SkillTypeIcon type={skill.type} size={14} />`
- [ ] 运行全量测试通过

### Task 4: 迁移 SkillPreview.tsx

- [ ] 替换类型图标判断为 `<SkillTypeIcon type={skill.type} size={18} />`
- [ ] 运行全量测试通过

### Task 5: 迁移 CommandPalette.tsx

- [ ] 替换搜索结果中的 `FileText` 和 `GitBranch` 为 `<SkillTypeIcon type={skill.type === "workflow" ? "workflow" : undefined} size={14} />`
- [ ] 注意：CommandPalette 中 regularSkills/workflowSkills 的分组逻辑保留
- [ ] 运行全量测试通过

### Task 6: 最终验证

- [ ] `tsc --noEmit` 零错误
- [ ] `vitest run` 全部通过
- [ ] `npm run lint` 零错误

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| Started | 2026-04-16T15:32 |
| Completed | 2026-04-16T15:35 |
| Test Results | SkillTypeIcon.test.tsx ✅ 7 tests · tsc --noEmit ✅ · vitest run ✅ 1118+7 tests |
| Review Status | 组件+迁移已在先前完成，本次补充单元测试并验证 |
