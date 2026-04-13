# Story bundle-5.1: 套件后端基础层（数据模型 + Schema + 服务层）

Status: review

## Story

As a 开发者,
I want 套件功能的后端基础层（类型定义、Schema 校验、服务函数）就绪,
so that 后续的 API 路由和前端功能可以基于稳定的数据层构建。

## Acceptance Criteria

1. `shared/types.ts` 新增 `SkillBundle` 接口（id、name、displayName、description?、categoryNames、createdAt、updatedAt）
2. `AppConfig` 接口追加 `skillBundles: SkillBundle[]` 和 `activeCategories: string[]` 字段
3. `shared/schemas.ts` 新增 `SkillBundleSchema`（含 `categoryNames.max(20)` 约束）
4. 新增 `SkillBundleCreateSchema`、`SkillBundleUpdateSchema`
5. `AppConfigSchema` 追加 `skillBundles: z.array(SkillBundleSchema).max(50).default([])`
6. `AppConfigSchema` 追加 `activeCategories: z.array(z.string()).default([])`
7. 旧版 `settings.yaml`（无 `skillBundles` 字段）读取时默认为空数组（向后兼容）
8. `shared/constants.ts` 新增 `BUNDLE_NOT_FOUND`、`BUNDLE_LIMIT_EXCEEDED`、`BUNDLE_NAME_DUPLICATE` 错误码
9. `server/types/errors.ts` 新增 `AppError.bundleNotFound(id)`、`AppError.bundleLimitExceeded()`、`AppError.bundleNameDuplicate(name)` 工厂方法
10. `server/services/bundleService.ts` 新建，导出 `getBundles()`、`addBundle(data)`、`updateBundle(id, data)`、`removeBundle(id)`、`applyBundle(id)`
11. `addBundle` 校验 `name` 唯一性（大小写不敏感）
12. `addBundle` 校验 `categoryNames` 引用的分类必须存在
13. `applyBundle` 以覆盖模式写入 `activeCategories`，跳过已删除分类引用，返回 `{ applied: string[], skipped: string[] }`
14. 所有写操作通过 `safeWrite()` 保证原子性
15. `bundleService` 的所有函数有对应单元测试，所有测试通过，TypeScript 零错误

## Tasks / Subtasks

- [x] Task 1: 更新 shared/types.ts（AC: 1, 2）
  - [x] 1.1 新增 `SkillBundle` 接口
  - [x] 1.2 `AppConfig` 追加 `skillBundles` 和 `activeCategories` 字段

- [x] Task 2: 更新 shared/schemas.ts（AC: 3, 4, 5, 6, 7）
  - [x] 2.1 新增 `SkillBundleSchema`
  - [x] 2.2 新增 `SkillBundleCreateSchema`、`SkillBundleUpdateSchema`
  - [x] 2.3 `AppConfigSchema` 追加 `skillBundles` 和 `activeCategories` 字段
  - [x] 2.4 新增类型推断导出

- [x] Task 3: 更新 shared/constants.ts 和 server/types/errors.ts（AC: 8, 9）
  - [x] 3.1 `shared/constants.ts` 新增套件相关错误码
  - [x] 3.2 `server/types/errors.ts` 新增套件相关 AppError 工厂方法

- [x] Task 4: 新建 server/services/bundleService.ts（AC: 10, 11, 12, 13, 14）
  - [x] 4.1 实现 `getBundles()`（含 `brokenCategoryNames` 注入）
  - [x] 4.2 实现 `addBundle(data)`（唯一性校验 + 分类存在性校验）
  - [x] 4.3 实现 `updateBundle(id, data)`
  - [x] 4.4 实现 `removeBundle(id)`
  - [x] 4.5 实现 `applyBundle(id)`（覆盖写入 + 跳过已删除分类）

- [x] Task 5: 编写单元测试（AC: 15）
  - [x] 5.1 `tests/unit/server/services/bundleService.test.ts` — CRUD 测试
  - [x] 5.2 `applyBundle` 测试（正常激活 + 覆盖模式 + 跳过损坏引用）
  - [x] 5.3 唯一性校验测试
  - [x] 5.4 向后兼容测试（旧版 settings.yaml 无 skillBundles 字段）
  - [x] 5.5 运行 `npm run typecheck` 确认 TypeScript 零错误

## Dev Notes

### 关键架构决策（来自 architecture.md AD-17, AD-19）

**数据存储：** `config/settings.yaml` 新增 `skillBundles[]` + `activeCategories[]` 字段，与 `pathPresets` 完全对称

**服务层模式：** 完全复用 `pathPresetService.ts` 的函数式导出模式（不使用 class）

**ID 生成格式：** `bundle-{ts36}-{rand4}`（复用 `generateId()` 函数，只改前缀）

**名称校验正则：** `/^[a-z0-9-]+$/`（与 `importService` 的 `VALID_CATEGORY_RE` 一致）

**`getBundles()` 需注入 `brokenCategoryNames`：** 与 `categoryService.getCategories()` 做 diff，找出 `categoryNames` 中不存在的分类名

### 参考实现（pathPresetService.ts）

```typescript
// server/services/pathPresetService.ts 的模式：
// 1. 内部 readSettings() / writeSettings() 工具函数
// 2. 内部 generateId() 函数
// 3. 所有公开函数使用 export async function 形式
// 4. 写操作通过 writeYaml() → safeWrite() 保证原子性
```

### SettingsData 接口扩展

当前 `pathPresetService.ts` 中的 `SettingsData` 接口需要在 `bundleService.ts` 中扩展：

```typescript
interface SettingsData {
  version?: string;
  sync?: { targets?: unknown[] };
  pathPresets?: PathPreset[];
  skillBundles?: SkillBundle[]; // 新增
  activeCategories?: string[]; // 新增
  ui?: { defaultView?: string; sidebarWidth?: number };
}
```

### applyBundle 核心逻辑

```typescript
async function applyBundle(id: string): Promise<ApplyResult> {
  const settings = await readSettings();
  const bundle = settings.skillBundles?.find((b) => b.id === id);
  if (!bundle) throw AppError.bundleNotFound(id);

  const categories = await categoryService.getCategories();
  const validNames = bundle.categoryNames.filter((name) =>
    categories.some((c) => c.name.toLowerCase() === name.toLowerCase()),
  );

  settings.activeCategories = validNames; // 覆盖写入（不叠加）
  await writeSettings(settings);

  return {
    applied: validNames,
    skipped: bundle.categoryNames.filter((n) => !validNames.includes(n)),
  };
}
```

### 套件数量上限

- 最多 50 个套件（`AppConfigSchema` 中 `.max(50)`）
- 单套件最多 20 个分类（`categoryNames.max(20)`）
- 超限时 `addBundle` 抛出 `AppError.bundleLimitExceeded()`

### 文件位置规范

- `shared/types.ts` — 新增 `SkillBundle` 接口，`AppConfig` 追加字段
- `shared/schemas.ts` — 新增 Schema，`AppConfigSchema` 扩展
- `shared/constants.ts` — 新增错误码
- `server/types/errors.ts` — 新增工厂方法
- `server/services/bundleService.ts` — **新建**
- `tests/unit/server/services/bundleService.test.ts` — **新建**

### 服务端 import 规范

- 服务端 import **必须**带 `.js` 扩展名（ESM + NodeNext 要求）
- 例如：`import { getCategories } from "./categoryService.js"`

### 测试规范

- 使用 `vi.mock()` mock `yamlUtils`（`readYaml`/`writeYaml`）
- 使用 `vi.mock()` mock `categoryService`（`getCategories`）
- 每个函数至少覆盖：正常流程 + 错误场景（not found、validation error）
- 向后兼容测试：mock `readYaml` 返回无 `skillBundles` 字段的对象，验证 `getBundles()` 返回 `[]`

### Project Structure Notes

- `bundleService.ts` 放在 `server/services/` 目录，kebab-case 命名
- 文件头使用标准注释格式：`// ============================================================`
- 函数注释使用 JSDoc 中文注释

### References

- [Source: architecture.md#AD-17] 套件数据存储策略
- [Source: architecture.md#AD-19] 套件服务层设计
- [Source: server/services/pathPresetService.ts] 参考实现模式
- [Source: shared/types.ts] 当前类型定义
- [Source: shared/schemas.ts] 当前 Schema 定义
- [Source: shared/constants.ts] 当前错误码
- [Source: server/types/errors.ts] AppError 工厂方法
- [Source: epics.md#Story 5.1] 完整 AC 定义

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

- 测试修复：`addBundle` 名称重复测试用例使用了大写字母名称（`My-Bundle`），被正则校验先拦截，改为全小写名称后通过

### Completion Notes List

- ✅ Task 1: `shared/types.ts` 新增 `SkillBundle`、`SkillBundleWithStatus`、`ApplyBundleResult`、`SkillBundleCreate`、`SkillBundleUpdate` 接口；`AppConfig` 追加 `skillBundles` 和 `activeCategories` 字段
- ✅ Task 2: `shared/schemas.ts` 新增 `SkillBundleSchema`、`SkillBundleCreateSchema`、`SkillBundleUpdateSchema`；`AppConfigSchema` 追加两个字段（含 `.default([])`）；新增类型推断导出
- ✅ Task 3: `shared/constants.ts` 新增 3 个错误码；`server/types/errors.ts` 新增 3 个工厂方法
- ✅ Task 4: `server/services/bundleService.ts` 新建，完整实现 5 个函数，复用 `pathPresetService` 模式
- ✅ Task 5: 25 个单元测试全部通过；TypeScript 零错误；全量测试 666/666 通过（预存在失败 PathPresetManager.test.tsx 与本 Story 无关）

### File List

- shared/types.ts（修改）
- shared/schemas.ts（修改）
- shared/constants.ts（修改）
- server/types/errors.ts（修改）
- server/services/bundleService.ts（新建）
- tests/unit/server/services/bundleService.test.ts（新建）
