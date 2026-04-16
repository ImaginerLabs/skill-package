---
status: ready-for-dev
created: 2026-04-16
epic: epic-sync-workflow-ux-enhancement
story_id: swu-1-2
title: Diff 预览目标选择器
acceptanceCriteria:
  - "用户点击「预览变更」按钮后，显示目标选择弹窗（单选模式）"
  - "弹窗展示所有启用的同步目标（Radio 列表）"
  - "用户选择目标后，直接执行 Diff 并展示差异报告"
  - "差异报告对应用户选择的目标（而非硬编码第一个）"
  - "弹窗标题显示「选择预览目标」"
technicalNotes:
  - "复用 SyncTargetSelector 组件（单选模式）"
  - "修改 DiffReportView 触发流程，增加目标选择步骤"
dependencies:
  - "swu-1-1-sync-target-multi-selector"
---

# Story SWU-1.2: Diff 预览目标选择器

## Context

- **Epic:** Epic-SWU-1: 同步目标选择器
- **Priority:** P0
- **Estimate:** 0.5 Story
- **Depends on:** Story SWU-1.1

## Problem Statement

Diff 预览硬编码取 enabledTargets[0]，用户无法选择对哪个目标进行差异对比。

## Solution

复用 SyncTargetSelector 组件（单选模式），Diff 前先选择目标。

## Tasks / Subtasks

- [ ] Task 1: 复用 SyncTargetSelector 组件（单选模式）
  - [ ] 1.1 SyncTargetSelector 支持 mode="single" 单选模式
  - [ ] 1.2 单选模式下使用 Radio 组件替代 Checkbox
  - [ ] 1.3 选择目标后直接执行 Diff

- [ ] Task 2: 修改 Diff 执行流程
  - [ ] 2.1 修改 `src/components/sync/SyncExecutor.tsx` 中 handleDiff 函数
  - [ ] 2.2 先打开目标选择弹窗
  - [ ] 2.3 选择目标后执行 executeDiff(selectedTargetId)

- [ ] Task 3: 单元测试
  - [ ] 3.1 单选模式测试
  - [ ] 3.2 Diff 执行流程测试

## Dev Agent Record

| Date | Action | Notes |
|------|--------|-------|
| 2026-04-16 | Created | Story file created |

## QA Notes

- 验证 Diff 报告对应选择的目标
- 验证单选模式行为正确

## Dependencies

- Story SWU-1.1（复用组件）

## Blocked By

- Story SWU-1.1

## Unblocked

None