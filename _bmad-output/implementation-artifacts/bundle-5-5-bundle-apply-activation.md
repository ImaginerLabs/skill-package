# Story bundle-5.5: 套件一键激活功能

Status: review

## Story

As a 用户,
I want 点击套件卡片上的"激活"按钮，将套件中的分类设为当前激活分类,
so that 我可以在不同工作场景下快速切换整套分类配置，无需逐条手动调整。

## Acceptance Criteria

1. 每个套件卡片提供"激活"按钮
2. 点击"激活"后调用 `PUT /api/skill-bundles/:id/apply`
3. `config/settings.yaml` 中 `activeCategories` 字段更新为套件中的有效分类列表（覆盖模式）
4. Toast 提示激活结果："已激活 N 个分类"（有跳过时："已激活 N 个分类，跳过 M 个已删除分类"）
5. 当前激活的套件卡片有视觉标识（绿色边框或"已激活" Badge）
6. 同一时间只有一个套件显示"已激活"状态
7. 激活另一个套件后，旧套件的"已激活"标识消失
8. `bundle-store.ts` 新增 `activeBundleId` 状态
9. 激活相关功能有单元测试和组件测试，所有测试通过

## Tasks / Subtasks

- [x] Task 1: 更新 bundle-store.ts（AC: 8）
  - [x] 1.1 新增 `activeBundleId: string | null` 状态
  - [x] 1.2 `applyBundle` action 成功后更新 `activeBundleId`

- [x] Task 2: 更新 BundleManager.tsx（AC: 1, 4, 5, 6, 7）
  - [x] 2.1 每个套件卡片添加"激活"按鈕
  - [x] 2.2 激活成功后显示 Toast 提示
  - [x] 2.3 当前激活套件显示视觉标识（绿色边框 + "已激活" Badge）

- [x] Task 3: 编写测试（AC: 9）
  - [x] 3.1 更新 `bundle-store.test.ts` — 测试 activeBundleId 更新
  - [x] 3.2 更新 `BundleManager.test.tsx` — 测试激活按鈕和视觉标识

## Dev Notes

### bundle-store.ts 更新

```typescript
// 新增状态
activeBundleId: string | null;

// applyBundle 更新
applyBundle: async (id) => {
  const result = await apiApplyBundle(id);
  set({ activeBundleId: id });  // 激活成功后记录当前激活套件
  return result;
},
```

### BundleManager.tsx 激活按钮

```tsx
// 激活按钮
<Button
  size="sm"
  variant={activeBundleId === bundle.id ? "default" : "outline"}
  onClick={() => handleApply(bundle.id)}
  disabled={applying === bundle.id}
  className={activeBundleId === bundle.id ? "border-[hsl(var(--primary))]" : ""}
>
  {activeBundleId === bundle.id ? "已激活" : "激活"}
</Button>

// 激活套件卡片的绿色边框
className={`rounded-lg border overflow-hidden ${
  activeBundleId === bundle.id
    ? "border-[hsl(var(--primary))]"
    : "border-[hsl(var(--border))]"
} bg-[hsl(var(--card))]`}
```

### Toast 提示逻辑

```typescript
const handleApply = async (id: string) => {
  setApplying(id);
  try {
    const result = await applyBundle(id);
    const msg =
      result.skipped.length > 0
        ? `已激活 ${result.applied.length} 个分类，跳过 ${result.skipped.length} 个已删除分类`
        : `已激活 ${result.applied.length} 个分类`;
    toast.success(msg);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "激活失败");
  } finally {
    setApplying(null);
  }
};
```

### References

- [Source: architecture.md#AD-20] 套件前端状态管理
- [Source: src/stores/bundle-store.ts] 当前 store 实现
- [Source: src/components/settings/BundleManager.tsx] 当前组件实现
- [Source: epics.md#Story 5.5] 完整 AC 定义

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: `bundle-store.ts` 新增 `activeBundleId`，`applyBundle` 成功后更新它
- ✅ Task 2: `BundleManager.tsx` 添加激活按鈕、Toast 提示、绿色边框和"已激活" Badge
- ✅ Task 3: 25 个测试全部通过；TypeScript 零错误；全量测试 714/714 通过

### File List

- src/stores/bundle-store.ts
- src/components/settings/BundleManager.tsx
- tests/unit/stores/bundle-store.test.ts
- tests/unit/components/settings/BundleManager.test.tsx
