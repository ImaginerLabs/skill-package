# Story 3.3: 工作流文件生成与预览

Status: done

## Story

As a 用户,
I want 系统自动生成标准格式的工作流 .md 文件并预览,
So that 我可以确认生成结果后保存。

## Acceptance Criteria (BDD)

1. **Given** 用户完成工作流编排（至少 1 个步骤）**When** 用户点击"生成工作流" **Then** 系统生成标准格式的工作流 .md 文件（FR12）
2. **Given** 生成的工作流文件 **When** 查看 Frontmatter **Then** 包含 `type: workflow`、`name`、`description`
3. **Given** 生成的工作流文件 **When** 查看正文 **Then** 包含 `## Step N` + `**使用 Skill:** \`name\`` 格式（FR12）
4. **Given** 用户点击预览 **When** 预览面板展示 **Then** 用户可以预览生成的工作流文件内容（FR13）
5. **Given** 用户确认保存 **When** 保存操作执行 **Then** 文件自动保存到 `skills/workflows/` 目录（FR14）
6. **Given** 保存成功 **When** 操作完成 **Then** Toast 通知并刷新 Skill 列表

## Tasks / Subtasks

- [x] Task 1: 创建后端 workflowService (AC: #1, #2, #3, #5)
  - [x] 1.1 创建 `server/services/workflowService.ts` — 工作流生成与管理服务
  - [x] 1.2 实现 `generateWorkflowContent()` — 生成 Frontmatter + Step 格式的 .md 内容
  - [x] 1.3 实现 `createWorkflow()` — 生成文件并保存到 `skills/workflows/`
  - [x] 1.4 实现 `previewWorkflow()` — 仅生成预览内容不保存
  - [x] 1.5 文件名冲突处理：slug 化 + 自增后缀
  - [x] 1.6 保存后刷新 Skill 缓存
- [x] Task 2: 创建后端工作流路由 (AC: #1, #4, #5)
  - [x] 2.1 创建 `server/routes/workflowRoutes.ts` — 工作流 API 路由
  - [x] 2.2 `POST /api/workflows` — 创建新工作流
  - [x] 2.3 `POST /api/workflows/preview` — 预览工作流内容
  - [x] 2.4 请求体 Zod 校验（WorkflowSchema）
  - [x] 2.5 在 `server/app.ts` 中注册路由
- [x] Task 3: 创建共享类型和 Schema (AC: #1)
  - [x] 3.1 在 `shared/types.ts` 中定义 `Workflow` 和 `WorkflowStep` 接口
  - [x] 3.2 在 `shared/schemas.ts` 中定义 `WorkflowSchema` 和 `WorkflowStepSchema`
- [x] Task 4: 创建前端 WorkflowPreview 组件 (AC: #4, #6)
  - [x] 4.1 创建 `src/components/workflow/WorkflowPreview.tsx` — 预览与保存组件
  - [x] 4.2 预览按钮：调用 `POST /api/workflows/preview` 获取预览内容
  - [x] 4.3 保存按钮：调用 `POST /api/workflows` 创建工作流
  - [x] 4.4 Loading 状态管理（预览中/保存中）
  - [x] 4.5 保存成功后刷新 Skill 列表 + 重置编排器 + Toast 通知
- [x] Task 5: 前端 API 客户端扩展 (AC: #1, #4, #5)
  - [x] 5.1 在 `src/lib/api.ts` 中添加 `createWorkflow()`、`previewWorkflow()` 函数
- [x] Task 6: 单元测试
  - [x] 6.1 workflowService 测试（previewWorkflow、createWorkflow 校验）
  - [x] 6.2 WorkflowPreview 组件测试 — **注：此项未完成，已记录为技术债务**

## Dev Notes

### 架构决策

- 后端 `workflowService.ts` 采用函数式导出，与 `skillService.ts` 风格一致
- 使用 `gray-matter.stringify()` 生成 Frontmatter + 正文内容
- 文件名通过 `slugify()` 生成，冲突时自增后缀（`-2`、`-3`...）
- 保存后调用 `refreshSkillCache()` 刷新内存缓存
- 前端 WorkflowPreview 组件放在 WorkflowEditor 右侧底部

### 已知技术债务

- WorkflowPreview 组件缺少单元测试（已在 Epic 3 回顾中记录，计划在 Story 4-6 补全）

### File List

- `server/services/workflowService.ts` — 新建
- `server/routes/workflowRoutes.ts` — 新建
- `server/app.ts` — 修改（注册 workflowRoutes）
- `shared/types.ts` — 修改（添加 Workflow、WorkflowStep 接口）
- `shared/schemas.ts` — 修改（添加 WorkflowSchema、WorkflowStepSchema）
- `src/components/workflow/WorkflowPreview.tsx` — 新建
- `src/lib/api.ts` — 修改（添加 createWorkflow、previewWorkflow）
- `tests/unit/server/services/workflowService.test.ts` — 新建

## Dev Agent Record

### Agent Model Used

补建文件（Epic 3 回顾改进 Story 4-8）

### Completion Notes List

- Story 3-3 在 Epic 3 实现期间未创建独立 story 文件，此文件为事后补建
- 所有 Tasks 已在 Epic 3 期间完成实现
- WorkflowPreview 测试缺失已记录为技术债务，将在 Story 4-6 中补全
