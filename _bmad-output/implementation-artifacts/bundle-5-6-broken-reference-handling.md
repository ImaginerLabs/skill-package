# Story bundle-5.6: 损坏引用处理与向后兼容验证

Status: review

## Story

As a 用户,
I want 当套件中引用的分类被删除后，套件卡片显示明确的警告提示，而不是静默失效,
so that 我能清楚知道套件状态，并决定是否需要修复套件。

## Acceptance Criteria

1. 套件中引用的分类被删除后，套件卡片显示黄色警告 Badge："包含 N 个已删除分类"
2. 展开损坏套件时，已删除的分类 Tag 显示删除线样式和"已删除"标注
3. 激活损坏套件时，自动跳过已删除的分类引用，仅激活有效分类（已在 Story 5.1/5.5 实现）
4. 删除分类时不阻断操作（`categoryService` 不感知 `bundleService`，已满足）
5. 旧版 `settings.yaml`（无 `skillBundles` 和 `activeCategories` 字段）正常启动，默认为空数组
6. 现有分类管理功能无任何回归
7. `getBundles()` 的 `brokenCategoryNames` 注入逻辑有单元测试（已在 Story 5.1 实现）
8. 损坏引用的 UI 展示有组件测试（警告 Badge + 删除线样式）
9. 向后兼容性有集成测试（旧版 settings.yaml 读取）
10. 所有测试通过，TypeScript 零错误

## Tasks / Subtasks

- [x] Task 1: 更新 BundleManager.tsx — 损坏引用 UI（AC: 1, 2）
  - [x] 1.1 套件卡片显示黄色警告 Badge（`brokenCategoryNames.length > 0`）
  - [x] 1.2 展开时已删除分类 Tag 显示删除线样式

- [x] Task 2: 向后兼容集成测试（AC: 5, 9）
  - [x] 2.1 `tests/integration/api/bundles.test.ts` 新增向后兼容测试

- [x] Task 3: 损坏引用 UI 组件测试（AC: 8）
  - [x] 3.1 更新 `BundleManager.test.tsx` — 测试警告 Badge 和删除线样式

- [x] Task 4: 全量测试验证（AC: 6, 10）
  - [x] 4.1 运行全量测试确认无回归

## Dev Notes

### 损坏引用 UI 实现

`getBundles()` 后端已注入 `brokenCategoryNames`，前端只需根据此字段渲染 UI：

```tsx
// 警告 Badge（在套件卡片头部）
{
  bundle.brokenCategoryNames.length > 0 && (
    <Badge
      variant="outline"
      className="h-5 px-1.5 text-[10px] border-yellow-500 text-yellow-500"
    >
      包含 {bundle.brokenCategoryNames.length} 个已删除分类
    </Badge>
  );
}

// 展开时分类 Tag 列表（区分有效/已删除）
{
  bundle.categoryNames.map((catName) => {
    const isBroken = bundle.brokenCategoryNames.includes(catName);
    return (
      <Badge
        key={catName}
        variant={isBroken ? "outline" : "secondary"}
        className={`text-xs font-[var(--font-code)] ${
          isBroken
            ? "line-through text-[hsl(var(--muted-foreground))] border-[hsl(var(--destructive))/0.4]"
            : ""
        }`}
      >
        {catName}
        {isBroken ? " (已删除)" : ""}
      </Badge>
    );
  });
}
```

### 向后兼容测试

`bundleService` 的向后兼容已在 Story 5.1 的单元测试中覆盖（`getBundles` 返回空数组）。
集成测试层面，需要验证 `GET /api/skill-bundles` 在旧版 settings.yaml 场景下正常返回空数组。

### 文件位置规范

- `src/components/settings/BundleManager.tsx` — 修改（损坏引用 UI）
- `tests/unit/components/settings/BundleManager.test.tsx` — 修改（新增测试）
- `tests/integration/api/bundles.test.ts` — 修改（向后兼容测试）

### References

- [Source: architecture.md#AD-21] 损坏引用处理规则
- [Source: server/services/bundleService.ts] getBundles 已注入 brokenCategoryNames
- [Source: epics.md#Story 5.6] 完整 AC 定义

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: `BundleManager.tsx` 添加黄色警告 Badge 和删除线样式
- ✅ Task 2: `bundles.test.ts` 新增向后兼容测试
- ✅ Task 3: `BundleManager.test.tsx` 新增 2 个损坏引用测试
- ✅ Task 4: 717/717 通过；TypeScript 零错误

### File List

- src/components/settings/BundleManager.tsx
- tests/unit/components/settings/BundleManager.test.tsx
- tests/integration/api/bundles.test.ts
