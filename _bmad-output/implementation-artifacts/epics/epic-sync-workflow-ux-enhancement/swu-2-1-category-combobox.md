---
status: ready-for-dev
created: 2026-04-16
epic: epic-sync-workflow-ux-enhancement
story_id: swu-2-1
title: 分类 Combobox 选择器
acceptanceCriteria:
  - "用户点击元数据编辑器的「移动分类」输入框，显示下拉列表"
  - "下拉选项展示 displayName（如「编程开发」）而非 name（如 coding）"
  - "下拉支持搜索过滤，用户输入关键词后实时过滤分类列表"
  - "当前分类在列表中默认选中（高亮状态）"
  - "用户选择分类后，调用 moveSkillCategory API 执行移动"
  - "移动成功后刷新列表，元数据面板更新显示"
technicalNotes:
  - "创建 CategoryCombobox 组件"
  - "基于 Radix UI Popover + 自定义列表实现"
  - "分类数据从 skill-store 获取"
  - "复用 MetadataEditor 中的 moveSkillCategory API"
dependencies: []
---

# Story SWU-2.1: 分类 Combobox 选择器

## Context

- **Epic:** Epic-SWU-2: 分类编辑增强
- **Priority:** P0
- **Estimate:** 1 Story

## Problem Statement

元数据编辑器中分类移动使用纯文本输入，用户需手动拼写 name（如 meta-skills），无法选择 displayName（如 元技能），且无法搜索过滤。

## Solution

创建 CategoryCombobox 组件，下拉选择分类，支持搜索和显示 displayName。

## Tasks / Subtasks

- [ ] Task 1: 创建 CategoryCombobox 组件
  - [ ] 1.1 新建 `src/components/skills/CategoryCombobox.tsx`
  - [ ] 1.2 Props: value, onChange, categories[]
  - [ ] 1.3 使用 Radix UI Popover 作为下拉容器
  - [ ] 1.4 搜索输入框 + 分类列表渲染
  - [ ] 1.5 当前分类高亮显示
  - [ ] 1.6 搜索过滤逻辑

- [ ] Task 2: 集成到 MetadataEditor
  - [ ] 2.1 修改 `src/components/skills/MetadataEditor.tsx`
  - [ ] 2.2 替换 Input 为 CategoryCombobox
  - [ ] 2.3 获取分类列表数据
  - [ ] 2.4 onChange 回调调用 moveSkillCategory

- [ ] Task 3: 获取分类列表数据
  - [ ] 3.1 检查 skill-store 是否有分类数据
  - [ ] 3.2 如无，添加 fetchCategories action 或使用现有 API

- [ ] Task 4: 单元测试
  - [ ] 4.1 CategoryCombobox 组件测试
  - [ ] 4.2 搜索过滤测试
  - [ ] 4.3 选择分类测试

## Dev Agent Record

| Date | Action | Notes |
|------|--------|-------|
| 2026-04-16 | Created | Story file created |

## QA Notes

- 验证下拉显示 displayName
- 验证搜索过滤功能
- 验证选择分类后执行移动

## Dependencies

None

## Blocked By

None

## Unblocked

- Story SWU-2.2（创建新分类依赖此 Story）