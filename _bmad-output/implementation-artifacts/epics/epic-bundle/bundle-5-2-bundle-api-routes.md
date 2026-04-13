# Story bundle-5.2: 套件 API 路由层

Status: review

## Story

As a 开发者,
I want 套件功能的 REST API 端点就绪,
so that 前端可以通过标准 API 进行套件的 CRUD 和激活操作。

## Acceptance Criteria

1. 新建 `server/routes/bundleRoutes.ts`，注册 7 个端点（5 实现 + 2 个 501 占位）
2. `GET /api/skill-bundles/export` 必须在 `GET /api/skill-bundles/:id` 之前注册
3. `bundleRoutes` 在 `server/app.ts` 中正确注册
4. POST/PUT 请求体不符合 Schema 时返回 400 + `VALIDATION_ERROR`
5. 套件不存在时 PUT/DELETE/apply 返回 404
6. 已有 50 个套件时创建返回 400 + 错误提示
7. `src/lib/api.ts` 新增 5 个 API 客户端函数
8. 所有 7 个端点有对应集成测试（含正常流程 + 错误场景），所有测试通过

## Tasks / Subtasks

- [x] Task 1: 新建 server/routes/bundleRoutes.ts（AC: 1, 2, 4, 5, 6）
  - [x] 1.1 实现 `GET /api/skill-bundles`
  - [x] 1.2 实现 `POST /api/skill-bundles`（Zod 校验）
  - [x] 1.3 实现 `GET /api/skill-bundles/export`（501 占位，必须在 `:id` 之前）
  - [x] 1.4 实现 `POST /api/skill-bundles/import`（501 占位）
  - [x] 1.5 实现 `PUT /api/skill-bundles/:id`（Zod 校验）
  - [x] 1.6 实现 `DELETE /api/skill-bundles/:id`
  - [x] 1.7 实现 `PUT /api/skill-bundles/:id/apply`

- [x] Task 2: 注册路由到 server/app.ts（AC: 3）
  - [x] 2.1 import bundleRoutes
  - [x] 2.2 `app.use("/api", bundleRoutes)` 注册

- [x] Task 3: 更新 src/lib/api.ts（AC: 7）
  - [x] 3.1 新增 `fetchSkillBundles()`
  - [x] 3.2 新增 `createSkillBundle(data)`
  - [x] 3.3 新增 `updateSkillBundle(id, data)`
  - [x] 3.4 新增 `deleteSkillBundle(id)`
  - [x] 3.5 新增 `applySkillBundle(id)`

- [x] Task 4: 编写集成测试（AC: 8）
  - [x] 4.1 `tests/integration/api/bundles.test.ts` — 所有端点测试

## Dev Notes

### 路由注册顺序（关键！）

```
// ⚠️ export 必须在 :id 之前注册，防止 "export" 被当作 :id 处理
GET  /api/skill-bundles/export   ← 先注册
GET  /api/skill-bundles/:id      ← 后注册（本 Story 不实现单个获取，但 apply 用到 :id）
```

### 参考实现（pathPresetRoutes.ts）

- 路由层薄封装：只做请求解析、Zod 校验和响应格式化
- 业务逻辑全部委托给 `bundleService`
- 所有路由处理器用 try/catch 包裹，catch 中调用 `next(err)`
- 响应格式：成功 `{ success: true, data: T }`，失败 `{ success: false, error: {...} }`

### 501 占位端点实现

```typescript
bundleRoutes.get("/skill-bundles/export", (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "套件导出功能暂未实现" },
  });
});
```

### src/lib/api.ts 新增函数

参考现有 `fetchPathPresets`、`addPathPreset` 等函数的模式：

```typescript
export async function fetchSkillBundles(): Promise<SkillBundleWithStatus[]> {
  return apiCall<SkillBundleWithStatus[]>("/api/skill-bundles");
}

export async function createSkillBundle(
  data: SkillBundleCreate,
): Promise<SkillBundleWithStatus> {
  return apiCall<SkillBundleWithStatus>("/api/skill-bundles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSkillBundle(
  id: string,
  data: SkillBundleUpdate,
): Promise<SkillBundleWithStatus> {
  return apiCall<SkillBundleWithStatus>(`/api/skill-bundles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSkillBundle(id: string): Promise<void> {
  return apiCall<void>(`/api/skill-bundles/${id}`, { method: "DELETE" });
}

export async function applySkillBundle(id: string): Promise<ApplyBundleResult> {
  return apiCall<ApplyBundleResult>(`/api/skill-bundles/${id}/apply`, {
    method: "PUT",
  });
}
```

### 集成测试模式

参考 `tests/integration/api/skills.test.ts` 的 supertest 模式：

- 使用 `supertest(app)` 发起请求
- 需要 mock `bundleService` 和 `categoryService`
- 测试覆盖：正常流程 + 400 校验错误 + 404 未找到 + 501 占位

### 文件位置规范

- `server/routes/bundleRoutes.ts` — **新建**
- `server/app.ts` — 修改（注册路由）
- `src/lib/api.ts` — 修改（新增 5 个函数）
- `tests/integration/api/bundles.test.ts` — **新建**

### References

- [Source: architecture.md#AD-18] 套件 API 设计
- [Source: server/routes/pathPresetRoutes.ts] 参考路由实现
- [Source: server/app.ts] 路由注册位置
- [Source: src/lib/api.ts] API 客户端层模式
- [Source: epics.md#Story 5.2] 完整 AC 定义

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: `server/routes/bundleRoutes.ts` 新建，7 个端点全部实现（5 实现 + 2 个 501 占位），`export` 路由在 `:id` 之前注册
- ✅ Task 2: `server/app.ts` 注册 `bundleRoutes`
- ✅ Task 3: `src/lib/api.ts` 新增 5 个 API 函数，复用 `pathPreset` 模式
- ✅ Task 4: 16 个集成测试全部通过；TypeScript 零错误；全量测试 682/682 通过

### File List

- server/routes/bundleRoutes.ts
- server/app.ts
- src/lib/api.ts
- tests/integration/api/bundles.test.ts
