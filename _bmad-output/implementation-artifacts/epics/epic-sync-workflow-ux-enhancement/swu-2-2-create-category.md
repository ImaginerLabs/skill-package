---
status: ready-for-dev
created: 2026-04-16
epic: epic-sync-workflow-ux-enhancement
story_id: swu-2-2
title: 创建新分类功能
acceptanceCriteria:
  - "下拉底部显示「+ 创建新分类」选项"
  - "用户点击后，下拉展开为创建表单"
  - "表单包含 name 输入框（kebab-case）和 displayName 输入框"
  - "name 输入框实时校验格式（正则 /^[a-z0-9]+(-[a-z0-9]+)*$/）"
  - "校验失败显示错误提示"
  - "提交时校验 name 唯一性（调用 API）"
  - "创建成功后：自动选中新分类 → 执行移动 → 刷新列表"
  - "创建失败显示错误提示，不关闭表单"
  - "新分类持久化到 config/categories.yaml"
technicalNotes:
  - "后端新增 POST /api/categories 端点"
  - "创建 categoryService.ts 服务"
  - "校验逻辑：格式 + 唯一性"
  - "创建成功后返回新分类数据供前端更新"
dependencies:
  - "swu-2-1-category-combobox"
---

# Story SWU-2.2: 创建新分类功能

## Context

- **Epic:** Epic-SWU-2: 分类编辑增强
- **Priority:** P0
- **Estimate:** 0.5 Story
- **Depends on:** Story SWU-2.1

## Problem Statement

用户无法在 UI 内创建新分类，需手动编辑 categories.yaml 文件。

## Solution

在 CategoryCombobox 底部添加「创建新分类」选项，点击后展开创建表单，提交后持久化到 categories.yaml。

## Tasks / Subtasks

- [ ] Task 1: 后端 API - 创建分类服务
  - [ ] 1.1 新建 `server/services/categoryService.ts`
  - [ ] 1.2 createCategory(data) 函数
  - [ ] 1.3 格式校验：kebab-case 正则
  - [ ] 1.4 唯一性校验
  - [ ] 1.5 写入 categories.yaml

- [ ] Task 2: 后端路由 - 分类 API
  - [ ] 2.1 新建 `server/routes/categoryRoutes.ts`
  - [ ] 2.2 POST /api/categories 端点
  - [ ] 2.3 Zod 校验请求体

- [ ] Task 3: 前端 - 创建表单 UI
  - [ ] 3.1 修改 CategoryCombobox 组件
  - [ ] 3.2 底部「+ 创建新分类」选项
  - [ ] 3.3 点击展开创建表单
  - [ ] 3.4 name 实时校验
  - [ ] 3.5 提交调用 API

- [ ] Task 4: 前端 - 创建后流程
  - [ ] 4.1 创建成功后自动选中新分类
  - [ ] 4.2 执行 moveSkillCategory
  - [ ] 4.3 刷新列表

- [ ] Task 5: 单元测试
  - [ ] 5.1 categoryService 单元测试
  - [ ] 5.2 创建表单测试

## Dev Agent Record

| Date | Action | Notes |
|------|--------|-------|
| 2026-04-16 | Created | Story file created |

## QA Notes

- 验证 name 格式校验
- 验证 name 唯一性校验
- 验证创建成功后执行移动

## Dependencies

- Story SWU-2.1（依赖 CategoryCombobox 组件）

## Blocked By

- Story SWU-2.1

## Unblocked

None