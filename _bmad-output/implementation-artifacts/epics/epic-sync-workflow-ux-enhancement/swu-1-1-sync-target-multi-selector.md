---
status: ready-for-dev
created: 2026-04-16
epic: epic-sync-workflow-ux-enhancement
story_id: swu-1-1
title: 同步目标多选器
acceptanceCriteria:
  - "用户点击同步按钮后，显示目标选择弹窗"
  - "弹窗展示所有启用的同步目标（Checkbox 列表）"
  - "默认全选所有目标"
  - "用户可勾选/取消勾选目标"
  - "提供「全选」和「取消全选」快捷操作"
  - "用户点击确认后，传递已选目标 ID 数组到执行逻辑"
  - "用户点击取消关闭弹窗"
  - "未选择任何目标时，确认按钮禁用，提示用户至少选择一个目标"
  - "摘要面板（SyncSummaryPanel）展示已选目标名称列表"
technicalNotes:
  - "创建 SyncTargetSelector 组件（多选模式）"
  - "修改 SyncExecutor 调用目标选择器"
  - "传递选中 ID 数组到 executePush(selectedIds, mode)"
  - "后端 pushSync 已支持 targetIds 参数，无需修改"
dependencies: []
---

# Story SWU-1.1: 同步目标多选器

## Context

- **Epic:** Epic-SWU-1: 同步目标选择器
- **Priority:** P0
- **Estimate:** 1 Story

## Problem Statement

用户可添加多个同步目标，但同步时无法指定推送到哪个目标，executePush 始终传 undefined，导致推送到所有目标。用户失去目标控制权。

## Solution

创建 SyncTargetSelector 组件，支持多选目标，用户确认后传递选中 ID 数组到执行逻辑。

## Tasks / Subtasks

- [ ] Task 1: 创建 SyncTargetSelector 组件（多选模式）
  - [ ] 1.1 新建 `src/components/sync/SyncTargetSelector.tsx`
  - [ ] 1.2 Props: mode="multi", targets, defaultSelected, onConfirm, onCancel
  - [ ] 1.3 内部状态 useState 管理选中 ID 数组
  - [ ] 1.4 目标项渲染：Checkbox + name + path
  - [ ] 1.5 全选/取消全选功能
  - [ ] 1.6 确认按钮禁用逻辑（未选目标时）
  - [ ] 1.7 弹窗打开/关闭动画

- [ ] Task 2: 创建 TargetCheckboxList 组件
  - [ ] 2.1 新建 `src/components/sync/TargetCheckboxList.tsx`
  - [ ] 2.2 接收 targets 数组，渲染 Checkbox 列表
  - [ ] 2.3 支持全选/取消全选

- [ ] Task 3: 集成到 SyncExecutor
  - [ ] 3.1 修改 `src/components/sync/SyncExecutor.tsx`
  - [ ] 3.2 点击同步按钮时调用 SyncTargetSelector
  - [ ] 3.3 onConfirm 回调传递 selectedIds 到 executePush
  - [ ] 3.4 SyncSummaryPanel 展示已选目标名称

- [ ] Task 4: 单元测试
  - [ ] 4.1 SyncTargetSelector 组件测试
  - [ ] 4.2 目标选择逻辑测试
  - [ ] 4.3 全选/取消全选测试

## Dev Agent Record

| Date | Action | Notes |
|------|--------|-------|
| 2026-04-16 | Created | Story file created |

## QA Notes

- 验证多选目标后同步结果正确
- 验证摘要面板展示已选目标
- 验证未选目标时按钮禁用

## Dependencies

- 后端 pushSync 已支持 targetIds（无需开发）

## Blocked By

None

## Unblocked

None