# Story 0.2: 共享类型、Schema 与错误处理框架

Status: done

## Story

As a 开发者,
I want 拥有统一的类型定义、运行时校验和错误处理机制,
So that 后续所有功能开发都有一致的基础设施。

## Acceptance Criteria (AC)

1. **AC-1: 共享类型定义**
   - Given `shared/` 目录已创建
   - When 前端或后端导入共享类型
   - Then `shared/types.ts` 导出 `SkillMeta`、`SkillFull`、`Category`、`AppConfig`、`WorkflowStep`、`Workflow`、`SyncTarget`、`SyncResult`、`ApiSuccess<T>`、`ApiError`、`ApiResponse<T>` 等核心类型
   - And 所有类型定义与架构文档中的数据模型一致
   - And `tsc --noEmit` 编译通过

2. **AC-2: 共享常量定义**
   - Given `shared/constants.ts` 已创建
   - When 导入错误码常量
   - Then 导出 `ErrorCode` 对象，包含 `SKILL_NOT_FOUND`、`PARSE_ERROR`、`VALIDATION_ERROR`、`NOT_FOUND`、`INTERNAL_ERROR`、`CONFIG_ERROR`、`FILE_WRITE_ERROR`、`PATH_TRAVERSAL` 等错误码常量
   - And 导出 `HttpStatus` 对象，包含常用 HTTP 状态码映射
   - And 所有常量使用 `UPPER_SNAKE_CASE` 命名

3. **AC-3: Zod Schema 运行时校验**
   - Given `shared/schemas.ts` 已创建
   - When 使用 Zod schema 校验数据
   - Then `SkillMetaSchema` 校验正确的 SkillMeta 数据通过
   - And `SkillMetaSchema` 校验缺少必填字段的数据返回清晰错误消息
   - And `ApiResponseSchema` 校验 API 响应格式
   - And `CategorySchema`、`AppConfigSchema` 等 schema 与对应类型定义一致
   - And Zod schema 导出对应的 TypeScript 类型推断（`z.infer<typeof Schema>`）

4. **AC-4: AppError 类定义**
   - Given `server/types/errors.ts` 已创建
   - When 后端抛出 AppError
   - Then `AppError` 类继承 `Error`，包含 `code: string` 和 `statusCode: number` 属性
   - And 提供工厂方法 `AppError.notFound(message)`、`AppError.badRequest(message)`、`AppError.internal(message)` 等快捷创建方式
   - And `AppError` 实例可被 `instanceof` 正确检测

5. **AC-5: Express 全局错误中间件**
   - Given `server/middleware/errorHandler.ts` 已创建
   - When Express 路由抛出 AppError
   - Then 全局错误中间件捕获错误并返回统一 `ApiResponse` 格式：`{ success: false, error: { code, message } }`
   - And 非 AppError 的未知错误返回 500 + `INTERNAL_ERROR`
   - And 错误信息在开发模式下包含 stack trace（`details` 字段），生产模式下不包含
   - And 中间件已注册到 Express app 中

6. **AC-6: React ErrorBoundary**
   - Given `src/components/shared/ErrorBoundary.tsx` 已创建
   - When React 组件树中发生渲染错误
   - Then ErrorBoundary 捕获错误并显示 ErrorFallback UI
   - And ErrorFallback 显示错误信息和"重试"按钮
   - And ErrorBoundary 已包裹在 App 根组件中

7. **AC-7: 前端 API 调用工具函数**
   - Given `src/lib/apiClient.ts` 已创建
   - When 前端调用后端 API
   - Then `apiClient` 提供类型安全的 `get<T>`、`post<T>`、`put<T>`、`del<T>` 方法
   - And 自动解析 `ApiResponse<T>` 格式，成功时返回 `data`，失败时抛出 `ApiError`
   - And 所有 HTTP 错误（网络错误、非 JSON 响应等）统一包装为 `ApiError`

8. **AC-8: TypeScript 编译通过**
   - Given 所有文件已创建
   - When 运行 `tsc --noEmit`
   - Then 编译通过，无错误

## Tasks / Subtasks

- [x] Task 1: 安装 Zod 依赖 (AC: #3)
  - [x] 1.1 安装 `zod` 到 dependencies（前后端共用）
  - [x] 1.2 验证 `tsc --noEmit` 通过

- [x] Task 2: 共享类型定义 (AC: #1)
  - [x] 2.1 创建 `shared/types.ts`，定义所有核心接口和类型
    - `SkillMeta` — Skill 元数据
    - `SkillFull` — 完整 Skill（含 content）
    - `WorkflowStep` — 工作流步骤
    - `Workflow` — 工作流
    - `SyncTarget` — 同步目标
    - `SyncResult` / `SyncDetail` — 同步结果
    - `Category` — 分类
    - `AppConfig` — 应用配置
    - `ApiSuccess<T>` — 成功响应
    - `ApiError` — 错误响应
    - `ApiResponse<T>` — 统一响应类型
  - [x] 2.2 删除 `shared/.gitkeep`（目录不再为空）

- [x] Task 3: 共享常量定义 (AC: #2)
  - [x] 3.1 创建 `shared/constants.ts`，定义错误码和 HTTP 状态码常量
    - `ErrorCode` 对象：`SKILL_NOT_FOUND`、`PARSE_ERROR`、`VALIDATION_ERROR`、`NOT_FOUND`、`INTERNAL_ERROR`、`CONFIG_ERROR`、`FILE_WRITE_ERROR`、`PATH_TRAVERSAL`
    - `HttpStatus` 对象：`OK(200)`、`CREATED(201)`、`BAD_REQUEST(400)`、`NOT_FOUND(404)`、`INTERNAL_SERVER_ERROR(500)`

- [x] Task 4: Zod Schema 定义 (AC: #3)
  - [x] 4.1 创建 `shared/schemas.ts`，定义 Zod schema
    - `SkillMetaSchema` — 对应 SkillMeta 类型
    - `CategorySchema` — 对应 Category 类型
    - `AppConfigSchema` — 对应 AppConfig 类型
    - `ApiSuccessSchema<T>` — 成功响应 schema 工厂
    - `ApiErrorSchema` — 错误响应 schema
  - [x] 4.2 导出 `z.infer<>` 类型推断，确保 schema 与 types.ts 中的类型一致

- [x] Task 5: AppError 类 (AC: #4)
  - [x] 5.1 创建 `server/types/errors.ts`，定义 AppError 类
    - 继承 `Error`
    - 属性：`code: string`、`statusCode: number`
    - 静态工厂方法：`notFound()`、`badRequest()`、`internal()`、`validationError()`、`parseError()`
  - [x] 5.2 创建 `server/types/index.ts`，统一导出

- [x] Task 6: Express 全局错误中间件 (AC: #5)
  - [x] 6.1 创建 `server/middleware/errorHandler.ts`
    - 捕获 AppError → 返回对应 statusCode + code
    - 捕获未知 Error → 返回 500 + INTERNAL_ERROR
    - 开发模式下 details 包含 stack trace
  - [x] 6.2 在 `server/app.ts` 中注册错误中间件（在所有路由之后）
  - [x] 6.3 更新 `healthRoutes.ts` 使用 `next()` 传递错误（可选，当前无需改动）

- [x] Task 7: React ErrorBoundary (AC: #6)
  - [x] 7.1 创建 `src/components/shared/ErrorBoundary.tsx`
    - Class component 实现 `componentDidCatch`
    - 渲染 `ErrorFallback` 组件（显示错误信息 + 重试按钮）
  - [x] 7.2 在 `src/App.tsx` 或 `src/main.tsx` 中用 ErrorBoundary 包裹根组件
  - [x] 7.3 删除 `src/components/shared/.gitkeep`（目录不再为空）

- [x] Task 8: 前端 API 调用工具 (AC: #7)
  - [x] 8.1 创建 `src/lib/apiClient.ts`
    - `apiGet<T>(url): Promise<T>` — GET 请求
    - `apiPost<T>(url, body): Promise<T>` — POST 请求
    - `apiPut<T>(url, body): Promise<T>` — PUT 请求
    - `apiDel<T>(url): Promise<T>` — DELETE 请求
    - 统一错误处理：解析 ApiResponse，失败时抛出 ApiClientError
  - [x] 8.2 创建 `src/lib/errors.ts`，定义前端 `ApiClientError` 类
  - [x] 8.3 删除 `src/lib/.gitkeep`（如果存在）

- [x] Task 9: 集成验证 (AC: #8)
  - [x] 9.1 运行 `tsc --noEmit` 确认编译通过
  - [x] 9.2 运行 `npm run build` 确认构建成功
  - [x] 9.3 验证 Express 错误中间件正常工作

## Dev Notes

### 架构约束（必须遵守）

1. **shared/ 目录只包含类型、常量和 Zod schema** — 不包含任何运行时逻辑（架构文档明确要求）
2. **Zod schema 前后端共用** — 放在 shared/ 目录，前端用于响应校验，后端用于请求校验
3. **ApiResponse<T> 统一响应格式** — 所有 API 必须使用此格式
4. **AppError 类** — 所有后端错误必须使用此类，包含 code 和 statusCode
5. **ErrorBoundary** — 必须包裹 React 根组件
6. **TypeScript strict mode** — 所有文件必须通过 strict 模式编译

### 类型定义参考（来自架构文档）

```typescript
// shared/types.ts — 核心数据类型

interface SkillMeta {
  id: string; // slug 化文件名（不含扩展名）
  name: string; // Frontmatter: name
  description: string; // Frontmatter: description
  category: string; // Frontmatter: category
  tags: string[]; // Frontmatter: tags
  type?: "workflow"; // Frontmatter: type
  author?: string; // Frontmatter: author
  version?: string; // Frontmatter: version
  filePath: string; // 相对于 skills/ 的路径
  fileSize: number; // 文件大小（bytes）
  lastModified: string; // ISO 8601 时间戳
}

interface SkillFull extends SkillMeta {
  content: string; // Markdown 正文（不含 Frontmatter）
  rawContent: string; // 原始文件内容（含 Frontmatter）
}

interface Category {
  name: string;
  displayName: string;
  description?: string;
  skillCount: number;
}

interface AppConfig {
  version: string;
  sync: { targets: SyncTarget[] };
  categories: Category[];
  ui: { defaultView: "grid" | "list"; sidebarWidth: number };
}

// API 响应格式
interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

### 错误处理模式参考（来自架构文档）

```typescript
// 后端：全局错误中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : "INTERNAL_ERROR";
  res.status(statusCode).json({
    success: false,
    error: { code, message: err.message },
  });
});

// 前端：API 调用统一错误处理
async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!json.success) throw new ApiError(json.error);
  return json.data;
}
```

### 不要做的事情（防止过度实现）

- ❌ 不要在 shared/ 中放任何运行时逻辑（只有类型、常量、schema）
- ❌ 不要实现文件解析工具（Story 0.3 负责）
- ❌ 不要实现配置读取（Story 0.5 负责）
- ❌ 不要添加任何样式（Story 0.4 负责设计系统）
- ❌ 不要创建 Zustand Store（Story 0.4 负责）
- ❌ 不要实现具体的 API 路由（后续 Epic 负责）
- ❌ ErrorFallback 只需简单的 HTML 结构，不需要样式

### 模块系统注意事项

- 项目使用 ESM（`"type": "module"`）
- 后端 import 需要 `.js` 扩展名（`import { AppError } from './types/errors.js'`）
- 前端 import 不需要扩展名（Vite bundler 模式）
- shared/ 目录同时被 `tsconfig.client.json` 和 `tsconfig.server.json` 的 `include` 覆盖

### 依赖关系

- **前置**: Story 0-1（项目初始化与前后端骨架）✅ done
- **后续**: Story 0-3（文件解析与路径工具）将使用本 Story 定义的类型和错误处理
- **后续**: Story 0-4（设计系统）将使用 ErrorBoundary
- **后续**: Story 0-5（配置读取）将使用 AppConfig 类型和 Zod schema

### References

- [Source: architecture.md#Data-Model] — 核心数据类型定义
- [Source: architecture.md#API-Response-Format] — ApiResponse<T> 统一响应格式
- [Source: architecture.md#Process-Patterns] — 错误处理模式
- [Source: architecture.md#Enforcement-Guidelines] — 编码规范
- [Source: architecture.md#Project-Structure] — shared/ 目录结构
- [Source: epics.md#Story-0.2] — 原始 Story 定义和验收标准

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Amelia — Senior Software Engineer, orchestrated by Multi-Agent Orchestrator)

### Completion Notes List

- ✅ Task 1: 安装 zod 到 dependencies
- ✅ Task 2: 创建 shared/types.ts — 定义 SkillMeta, SkillFull, Workflow, SyncTarget, Category, AppConfig, ApiResponse 等 12+ 接口
- ✅ Task 3: 创建 shared/constants.ts — 定义 ErrorCode（10 个错误码）和 HttpStatus（7 个状态码）常量
- ✅ Task 4: 创建 shared/schemas.ts — 定义 10+ Zod schema + 类型推断导出 + ApiResponse schema 工厂函数
- ✅ Task 5: 创建 server/types/errors.ts — AppError 类 + 8 个静态工厂方法 + server/types/index.ts 统一导出
- ✅ Task 6: 创建 server/middleware/errorHandler.ts — 全局错误中间件 + 注册到 server/app.ts
- ✅ Task 7: 创建 src/components/shared/ErrorBoundary.tsx — Class component + ErrorFallback + 包裹在 main.tsx 中
- ✅ Task 8: 创建 src/lib/apiClient.ts — apiGet/apiPost/apiPut/apiDel + src/lib/errors.ts ApiClientError 类
- ✅ Task 9: tsc --noEmit ✅ + vite build ✅ + 服务运行验证 ✅
- 🔧 注意：ApiError 接口在 types.ts 中重命名为 ApiErrorResponse 以避免与前端 ApiClientError 混淆

### Verification Results

- `tsc --noEmit` ✅ 编译通过
- `vite build` ✅ 构建成功（30 modules, 284.95 KB）
- `GET /api/health` ✅ 返回 {success:true, data:{status:"ok",...}}
- `GET /api/nonexistent` ✅ 返回 {success:false, error:{code:"NOT_FOUND",...}}
- Express errorHandler 中间件 ✅ 已注册
- ErrorBoundary ✅ 已包裹 App 根组件

### File List

- shared/types.ts (新建)
- shared/constants.ts (新建)
- shared/schemas.ts (新建)
- server/types/errors.ts (新建)
- server/types/index.ts (新建)
- server/middleware/errorHandler.ts (新建)
- src/components/shared/ErrorBoundary.tsx (新建)
- src/lib/apiClient.ts (新建)
- src/lib/errors.ts (新建)
- server/app.ts (修改 — 导入并注册 errorHandler)
- src/main.tsx (修改 — 导入并包裹 ErrorBoundary)
- package.json (修改 — 添加 zod 依赖)
- shared/.gitkeep (删除)
- src/components/shared/.gitkeep (删除)
- src/lib/.gitkeep (删除)
- server/types/.gitkeep (删除)
- server/middleware/.gitkeep (删除)
