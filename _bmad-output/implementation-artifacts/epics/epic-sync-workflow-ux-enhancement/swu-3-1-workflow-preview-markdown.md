---
status: ready-for-dev
created: 2026-04-16
epic: epic-sync-workflow-ux-enhancement
story_id: swu-3-1
title: 工作流预览 Markdown 渲染
acceptanceCriteria:
  - "预览内容使用 ReactMarkdown 渲染"
  - "Markdown 格式正确渲染（标题/段落/列表/粗斜体/代码块）"
  - "代码块使用 rehype-highlight 语法高亮"
  - "支持 remark-gfm（表格/任务列表/删除线）"
  - "预览区域高度设为 max-h-[400px]"
  - "内容超过高度时可滚动查看"
  - "暗色主题代码块使用 github-dark 主题"
  - "亮色主题自动回退到 github-light"
technicalNotes:
  - "修改 WorkflowPreview.tsx 组件"
  - "引入 react-markdown, rehype-highlight, remark-gfm"
  - "修复 ScrollArea 高度策略（添加固定高度 h-[400px]）"
  - "样式使用 Tailwind 或手动样式"
dependencies: []
---

# Story SWU-3.1: 工作流预览 Markdown 渲染

## Context

- **Epic:** Epic-SWU-3: 工作流预览修复
- **Priority:** P0
- **Estimate:** 0.5 Story

## Problem Statement

工作流预览使用 `<pre>` 纯文本展示，无法渲染 Markdown 格式；ScrollArea max-h-[300px] 可能不生效，长内容无法滚动。

## Solution

修改 WorkflowPreview 组件，使用 ReactMarkdown 渲染内容，修复 ScrollArea 高度策略。

## Tasks / Subtasks

- [ ] Task 1: 修改 WorkflowPreview 组件
  - [ ] 1.1 修改 `src/components/workflow/WorkflowPreview.tsx`
  - [ ] 1.2 引入 ReactMarkdown, remarkGfm, rehypeHighlight
  - [ ] 1.3 替换 `<pre>` 为 ReactMarkdown 组件
  - [ ] 1.4 设置代码高亮主题

- [ ] Task 2: 修复 ScrollArea 高度策略
  - [ ] 2.1 设置 max-h-[400px] 和 h-[400px]
  - [ ] 2.2 确保内容可滚动

- [ ] Task 3: 样式调整
  - [ ] 3.1 代码块样式 bg-[hsl(var(--muted))]
  - [ ] 3.2 标题、段落、列表样式
  - [ ] 3.3 暗色/亮色主题适配

- [ ] Task 4: 单元测试
  - [ ] 4.1 组件渲染测试
  - [ ] 4.2 Markdown 渲染测试

## Dev Agent Record

| Date | Action | Notes |
|------|--------|-------|
| 2026-04-16 | Created | Story file created |

## QA Notes

- 验证 Markdown 格式正确渲染
- 验证代码块语法高亮
- 验证内容可滚动

## Dependencies

None

## Blocked By

None

## Unblocked

None