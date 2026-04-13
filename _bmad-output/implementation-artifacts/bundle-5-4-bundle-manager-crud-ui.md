# Story bundle-5.4: 套件管理 UI — CRUD 交互

Status: review

## Story

As a 用户,
I want 在"套件管理" Tab 中创建、查看、编辑和删除套件,
so that 我可以将常用的分类组合保存为套件，方便后续复用。

## Acceptance Criteria

1. 新建 `src/stores/bundle-store.ts`，包含 bundles、bundlesLoading、bundlesError 状态和 CRUD actions
2. 新建 `src/components/settings/BundleManager.tsx` 组件
3. 套件列表为空时显示空状态引导
4. 套件列表有数据时每个套件以卡片形式展示（名称、描述、分类 Tag Chip 列表）
5. 套件卡片支持展开/折叠
6. 用户可以创建套件（名称、显示名称、选择分类）
7. 名称重复或格式不符时显示错误提示
8. 未选择分类时"确认创建"按钮禁用
9. 用户可以编辑套件（显示名称、描述、分类列表）
10. 用户可以删除套件（AlertDialog 确认）
11. `SettingsPage.tsx` 的"套件管理" Tab 渲染 `BundleManager`（替换占位内容）
12. `bundle-store.ts` 有完整单元测试，`BundleManager.tsx` 有组件测试，所有测试通过

## Tasks / Subtasks

- [x] Task 1: 新建 src/stores/bundle-store.ts（AC: 1）
  - [x] 1.1 定义 BundleStore 接口
  - [x] 1.2 实现 fetchBundles、createBundle、updateBundle、deleteBundle actions

- [x] Task 2: 新建 src/components/settings/BundleManager.tsx（AC: 2, 3, 4, 5, 6, 7, 8, 9, 10）
  - [x] 2.1 空状态引导 UI
  - [x] 2.2 套件卡片列表（展开/折叠）
  - [x] 2.3 新建套件表单（名称、显示名称、分类多选）
  - [x] 2.4 编辑套件功能
  - [x] 2.5 删除套件功能（AlertDialog 确认）

- [x] Task 3: 更新 SettingsPage.tsx（AC: 11）
  - [x] 3.1 将"套件管理" Tab 的占位内容替换为 BundleManager

- [x] Task 4: 编写单元测试（AC: 12）
  - [x] 4.1 `tests/unit/stores/bundle-store.test.ts` — store CRUD 测试
  - [x] 4.2 `tests/unit/components/settings/BundleManager.test.tsx` — 组件测试

## Dev Notes

### bundle-store.ts 实现模式

参考 `sync-store.ts` 的 Zustand 模式：

```typescript
// src/stores/bundle-store.ts
import { create } from "zustand";
import type {
  ApplyBundleResult,
  SkillBundleCreate,
  SkillBundleUpdate,
  SkillBundleWithStatus,
} from "../../shared/types";
import {
  createSkillBundle,
  deleteSkillBundle,
  fetchSkillBundles,
  updateSkillBundle,
} from "../lib/api";

export interface BundleStore {
  bundles: SkillBundleWithStatus[];
  bundlesLoading: boolean;
  bundlesError: string | null;
  fetchBundles: () => Promise<void>;
  createBundle: (data: SkillBundleCreate) => Promise<void>;
  updateBundle: (id: string, data: SkillBundleUpdate) => Promise<void>;
  deleteBundle: (id: string) => Promise<void>;
}
```

### BundleManager.tsx 关键实现细节

**分类选择器：** 从 `fetchCategories()` 获取分类列表，使用 Checkbox 多选，支持搜索过滤（简单 filter）

**套件卡片结构：**

```
[展开/折叠按钮] [套件显示名称] [name 标识] [分类数量 Badge] [编辑按钮] [删除按钮]
  展开后：分类 Tag Chip 列表
```

**名称校验：** `/^[a-z0-9-]+$/`，实时校验，不符合时显示错误文字

**创建按钮禁用条件：** `!name.trim() || !displayName.trim() || selectedCategories.length === 0 || !!nameError`

**错误处理：** API 错误通过 `toast.error()` 显示

### 文件位置规范

- `src/stores/bundle-store.ts` — **新建**
- `src/components/settings/BundleManager.tsx` — **新建**
- `src/pages/SettingsPage.tsx` — 修改（替换占位内容）
- `tests/unit/stores/bundle-store.test.ts` — **新建**
- `tests/unit/components/settings/BundleManager.test.tsx` — **新建**

### References

- [Source: architecture.md#AD-20] 套件前端状态管理
- [Source: src/stores/sync-store.ts] Zustand store 参考模式
- [Source: src/components/settings/CategoryManager.tsx] 设置页组件参考
- [Source: epics.md#Story 5.4] 完整 AC 定义

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: `bundle-store.ts` 新建，10 个 store 单元测试全部通过
- ✅ Task 2: `BundleManager.tsx` 新建，实现空状态、卡片列表、展开/折叠、新建表单、编辑、删除功能
- ✅ Task 3: `SettingsPage.tsx` 套件管理 Tab 替换为 BundleManager
- ✅ Task 4: 19 个测试全部通过；TypeScript 零错误；全量测试 708/708 通过
- ⚠️ 修复了 SettingsPage.test.tsx 中的套件管理内容断言（占位内容已被 BundleManager 替换）

### File List

- src/stores/bundle-store.ts
- src/components/settings/BundleManager.tsx
- src/pages/SettingsPage.tsx
- tests/unit/stores/bundle-store.test.ts
- tests/unit/components/settings/BundleManager.test.tsx
