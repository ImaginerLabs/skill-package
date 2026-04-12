# Story 3.4: 工作流管理（编辑与删除）

Status: done

## Story

As a 用户,
I want 编辑已创建的工作流或删除不再需要的工作流,
So that 我可以持续优化工作流并保持列表整洁。

## Acceptance Criteria (BDD)

1. **Given** 用户在工作流列表中选中一个已有工作流 **When** 用户点击编辑 **Then** 编排器加载该工作流的现有步骤、名称和描述（FR14d）
2. **Given** 编辑模式下 **When** 用户修改步骤/名称/描述 **Then** 用户可以添加/移除步骤、调整顺序、修改步骤描述（FR14d, FR9, FR10, FR14b）
3. **Given** 编辑模式下 **When** 用户保存 **Then** 覆盖原工作流 .md 文件（FR14d）并 Toast 通知刷新列表
4. **Given** 用户在工作流列表中选中一个工作流 **When** 用户点击删除 **Then** 弹出确认对话框（FR14c）
5. **Given** 用户确认删除 **When** 删除执行 **Then** 删除工作流 .md 文件并刷新列表 Toast 通知
6. **Given** 删除操作 **When** 需要撤销 **Then** 删除操作附带 5 秒撤销按钮（UX-DR14）— **注：此项未实现，已记录为技术债务**

## Tasks / Subtasks

- [x] Task 1: 后端工作流管理 API (AC: #3, #5)
  - [x] 1.1 在 `workflowService.ts` 中实现 `getWorkflows()` — 获取所有工作流列表
  - [x] 1.2 在 `workflowService.ts` 中实现 `updateWorkflow()` — 更新已有工作流
  - [x] 1.3 在 `workflowService.ts` 中实现 `deleteWorkflow()` — 删除工作流（含路径安全校验）
  - [x] 1.4 在 `workflowRoutes.ts` 中添加 `GET /api/workflows` 路由
  - [x] 1.5 在 `workflowRoutes.ts` 中添加 `PUT /api/workflows/:id` 路由
  - [x] 1.6 在 `workflowRoutes.ts` 中添加 `DELETE /api/workflows/:id` 路由
- [x] Task 2: 创建前端 WorkflowList 组件 (AC: #1, #4, #5)
  - [x] 2.1 创建 `src/components/workflow/WorkflowList.tsx` — 已有工作流列表
  - [x] 2.2 调用 `GET /api/workflows` 获取工作流列表
  - [x] 2.3 编辑按钮：获取完整 Skill 内容 → 解析步骤 → 加载到编排器
  - [x] 2.4 删除按钮：AlertDialog 确认对话框 → 调用 DELETE API
  - [x] 2.5 删除成功后刷新列表 + Toast 通知
- [x] Task 3: 扩展 WorkflowPreview 支持编辑模式 (AC: #2, #3)
  - [x] 3.1 根据 `editingWorkflowId` 切换"生成工作流"/"更新工作流"按钮
  - [x] 3.2 编辑模式下调用 `PUT /api/workflows/:id` 更新
  - [x] 3.3 保存成功后重置编排器
- [x] Task 4: 扩展 workflow-store 编辑模式 (AC: #1)
  - [x] 4.1 添加 `editingWorkflowId` 状态字段
  - [x] 4.2 添加 `loadWorkflow()` action — 加载已有工作流到编排器
  - [x] 4.3 `reset()` 清空编辑 ID
- [x] Task 5: 前端 API 客户端扩展 (AC: #1, #3, #5)
  - [x] 5.1 在 `src/lib/api.ts` 中添加 `fetchWorkflows()`、`updateWorkflow()`、`deleteWorkflow()` 函数
- [x] Task 6: 集成到 WorkflowEditor (AC: #1)
  - [x] 6.1 在 WorkflowEditor 中嵌入 WorkflowList 组件（左侧底部）
- [x] Task 7: 单元测试
  - [x] 7.1 WorkflowList 组件测试（渲染、删除确认对话框）
  - [x] 7.2 workflowService 测试（getWorkflows、deleteWorkflow）

## Dev Notes

### 架构决策

- WorkflowList 放在 SkillSelector 下方（左侧底部），展示已有工作流
- 编辑模式通过 `workflow-store.editingWorkflowId` 区分新建/编辑
- 删除使用 AlertDialog 确认对话框（shadcn/ui 组件）
- 删除操作包含 `isSubPath()` 路径安全校验
- 编辑时从 Markdown 内容解析步骤（正则表达式）— **已记录为技术债务，计划在 Story 4-5 后移后端**

### 已知技术债务

1. 删除操作缺少 5 秒撤销功能（UX-DR14）— 计划在 Story 4-7 实现
2. WorkflowList 中 Markdown 解析逻辑应后移后端 — 计划在 Story 4-5 实现

### File List

- `server/services/workflowService.ts` — 修改（添加 getWorkflows、updateWorkflow、deleteWorkflow）
- `server/routes/workflowRoutes.ts` — 修改（添加 GET、PUT、DELETE 路由）
- `src/components/workflow/WorkflowList.tsx` — 新建
- `src/components/workflow/WorkflowPreview.tsx` — 修改（支持编辑模式）
- `src/components/workflow/WorkflowEditor.tsx` — 修改（嵌入 WorkflowList）
- `src/stores/workflow-store.ts` — 修改（添加 editingWorkflowId、loadWorkflow）
- `src/lib/api.ts` — 修改（添加 fetchWorkflows、updateWorkflow、deleteWorkflow）
- `tests/unit/components/workflow/WorkflowList.test.tsx` — 新建
- `tests/unit/server/services/workflowService.test.ts` — 修改

## Dev Agent Record

### Agent Model Used

补建文件（Epic 3 回顾改进 Story 4-8）

### Completion Notes List

- Story 3-4 在 Epic 3 实现期间未创建独立 story 文件，此文件为事后补建
- 所有 Tasks 已在 Epic 3 期间完成实现
- 两项技术债务已记录，将在 Epic 4 的 Story 4-5 和 4-7 中解决
