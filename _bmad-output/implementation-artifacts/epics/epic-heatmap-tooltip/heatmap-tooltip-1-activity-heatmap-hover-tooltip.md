# Story HT.1: 活跃度热力图 Hover 浮窗 — 展示当日修改文件列表

Status: review

## Story

As a Skill 管理者,
I want 在热力图豆点上 hover 时看到一个浮窗，展示当日具体修改了哪些 Skill 文件,
So that 我能快速了解每天的修改详情，而不仅仅是一个数字。

## Acceptance Criteria

1. **Given** 热力图已加载，**When** 鼠标 hover 到有修改的豆点上，**Then** 显示 Tooltip 浮窗，包含日期（粗体）、修改次数和具体文件名列表
2. **Given** 热力图已加载，**When** 鼠标 hover 到无修改的豆点上，**Then** 显示 Tooltip 浮窗，仅包含日期和「无修改」文字
3. **Given** 某日修改文件超过 10 个，**When** hover 该豆点，**Then** 文件列表只显示前 10 个，末尾显示 `+N more`
4. **Given** API 返回的 files 字段，**Then** 文件名不包含服务器路径信息，仅为文件名（不含 `.md` 后缀）
5. **Given** API 加载失败，**Then** 降级为空数据，无 Tooltip

## Tasks / Subtasks

- [x] Task 1: 后端 API 扩展 — `server/routes/statsRoutes.ts` (AC: #4)
  - [x] 1.1 扩展 `ActivityDay` 接口增加 `files: string[]` 字段
  - [x] 1.2 在聚合逻辑中维护 `filesMap: Map<string, string[]>` 记录每日修改的文件名（`path.basename` 去 `.md` 后缀）
  - [x] 1.3 生成结果时填充 `files` 字段
  - [x] 1.4 编写/扩展单元测试 `tests/unit/server/routes/statsRoutes.test.ts`
- [x] Task 2: 前端 API 类型同步 — `src/lib/api.ts` (AC: #4)
  - [x] 2.1 更新 `ActivityDay` 接口增加 `files: string[]` 字段
- [x] Task 3: 前端 Tooltip 替换 — `src/components/stats/ActivityHeatmap.tsx` (AC: #1, #2, #3, #5)
  - [x] 3.1 引入 `TooltipProvider`/`Tooltip`/`TooltipTrigger`/`TooltipContent` 组件
  - [x] 3.2 将每个豆点的 `<div title=...>` 替换为 `<Tooltip>` 包裹
  - [x] 3.3 实现 Tooltip 内容：日期（粗体）、修改次数、文件列表（最多 10 个，超出显示 `+N more`）
  - [x] 3.4 count=0 时 Tooltip 仅显示日期和「无修改」
  - [x] 3.5 编写/扩展组件测试 `tests/unit/components/stats/ActivityHeatmap.test.tsx`

## Dev Notes

### 关键架构约束

- **类型定义位置**：`ActivityDay` 当前分别定义在 `server/routes/statsRoutes.ts`（后端）和 `src/lib/api.ts`（前端）两处。项目规则要求共享类型定义在 `shared/types.ts`，但当前实现未遵循此规则。**本 story 保持现有模式**（两处各自定义），避免引入不必要的重构风险。后续可单独创建重构 story 统一类型。
- **Tooltip 组件复用**：项目已有 `src/components/ui/tooltip.tsx`（基于 `@radix-ui/react-tooltip`），直接复用，**不引入新 UI 库**。
- **TooltipProvider 放置位置**：包裹整个热力图 grid 容器（而非每个豆点单独包裹），减少 Provider 嵌套。设置 `delayDuration={200}` 实现快速响应。

### 后端实现细节

**文件：`server/routes/statsRoutes.ts`**

当前实现只维护 `countMap: Map<string, number>`。需要额外维护 `filesMap: Map<string, string[]>`：

```typescript
// 现有
const countMap = new Map<string, number>();

// 新增
const filesMap = new Map<string, string[]>();

// 在 for 循环中
const dateStr = mtime.toISOString().slice(0, 10);
countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + 1);
// 新增：记录文件名（去 .md 后缀，只取 basename）
const fileName = path.basename(file, ".md");
const existing = filesMap.get(dateStr) ?? [];
existing.push(fileName);
filesMap.set(dateStr, existing);

// 生成结果时
result.push({
  date: dateStr,
  count: countMap.get(dateStr) ?? 0,
  files: (filesMap.get(dateStr) ?? []).sort(),
});
```

**安全要求**：`files` 字段只返回文件名（`path.basename` 去后缀），**不含路径**，防止泄露服务器目录结构。

### 前端实现细节

**文件：`src/components/stats/ActivityHeatmap.tsx`**

将每个豆点从：

```tsx
<div key={day.date} title={`${day.date} · ${day.count} 次修改`} ... />
```

替换为：

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <div key={day.date} data-testid={`heatmap-dot-${day.date}`} ... />
  </TooltipTrigger>
  <TooltipContent side="top" className="max-w-[200px]">
    <p className="font-bold text-xs">{day.date}</p>
    <p className="text-xs text-[hsl(var(--muted-foreground))]">
      {day.count > 0 ? `${day.count} 次修改` : "无修改"}
    </p>
    {day.files.length > 0 && (
      <>
        <div className="my-1 border-t border-[hsl(var(--border))]" />
        <ul className="space-y-0.5">
          {day.files.slice(0, 10).map((f) => (
            <li key={f} className="text-xs truncate text-[hsl(var(--muted-foreground))]">
              • {f}
            </li>
          ))}
          {day.files.length > 10 && (
            <li className="text-xs text-[hsl(var(--muted-foreground))]">
              +{day.files.length - 10} more
            </li>
          )}
        </ul>
      </>
    )}
  </TooltipContent>
</Tooltip>
```

**TooltipProvider** 包裹整个 grid：

```tsx
<TooltipProvider delayDuration={200}>
  <div style={{ display: "grid", ... }}>
    {gridItems.map(...)}
  </div>
</TooltipProvider>
```

### Tooltip 浮窗视觉设计

```
┌─────────────────────────┐
│  2026-04-13              │  ← 日期，粗体，text-xs
│  3 次修改                │  ← 修改次数，text-xs，muted-foreground
│  ─────────────────────── │  ← 分隔线（仅有文件时显示）
│  • skill-name-1          │  ← 文件名列表，text-xs
│  • skill-name-2          │
│  • skill-name-3          │
└─────────────────────────┘
```

- 浮窗背景：`hsl(var(--popover))`，边框：`hsl(var(--border))`（已由 `TooltipContent` 组件内置）
- 文件名前缀用 `•` 圆点，颜色 `hsl(var(--muted-foreground))`
- 最大宽度 `200px`（`className="max-w-[200px]"`），文件名过长时 `truncate`

### 现有测试模式参考

**后端测试** (`tests/unit/server/routes/statsRoutes.test.ts`)：

- 使用 `supertest` + `express` 创建测试 app
- Mock `fs-extra`（`mockPathExists`、`mockReaddir`、`mockStat`）和 `skillService.getSkillsRoot`
- 需要扩展现有测试验证 `files` 字段

**前端测试** (`tests/unit/components/stats/ActivityHeatmap.test.tsx`)：

- Mock `fetchActivityStats` 返回测试数据
- 使用 `@testing-library/react` 的 `render`/`screen`
- 需要扩展测试数据 `generateDays` 函数增加 `files` 字段
- 需要新增 Tooltip 渲染测试（hover 后验证 Tooltip 内容）

### 项目样式规则

- **暗色主题 only**：Code Dark (#0F172A) + Run Green (#22C55E)
- **CSS 变量**：使用 HSL 格式（`hsl(var(--xxx))`）
- **Tailwind CSS v4**：通过 `@import "tailwindcss"` 导入

### 文件变更清单

| 文件                                                   | 操作 | 说明                             |
| ------------------------------------------------------ | ---- | -------------------------------- |
| `server/routes/statsRoutes.ts`                         | 修改 | 扩展 ActivityDay + filesMap 聚合 |
| `src/lib/api.ts`                                       | 修改 | 更新 ActivityDay 接口            |
| `src/components/stats/ActivityHeatmap.tsx`             | 修改 | 替换 title 为 Radix Tooltip      |
| `tests/unit/server/routes/statsRoutes.test.ts`         | 修改 | 扩展测试验证 files 字段          |
| `tests/unit/components/stats/ActivityHeatmap.test.tsx` | 修改 | 扩展 Tooltip 渲染测试            |

### References

- [Source: _bmad-output/implementation-artifacts/specs/spec-activity-heatmap-tooltip.md] — 原始 spec 提案
- [Source: _bmad-output/planning-artifacts/prd/prd-sidebar-redesign.md#FR-S2-7] — 热力图 Tooltip 原始需求
- [Source: _bmad-output/planning-artifacts/epics/epics.md#Story-7.2] — Epic 7 Story 7.2 热力图实现
- [Source: _bmad-output/implementation-artifacts/epics/epic-7/7-2-sidebar-stats-panel-and-activity-heatmap.md] — Story 7.2 实现记录
- [Source: _bmad-output/project-context.md] — 项目上下文规则

## Dev Agent Record

### Agent Model Used

claude-4.6-opus

### Debug Log References

无

### Completion Notes List

- ✅ Task 1: 后端 `statsRoutes.ts` 扩展 `ActivityDay` 接口增加 `files: string[]`，新增 `filesMap` 聚合逻辑，使用 `path.basename(file, ".md")` 安全提取文件名，`files` 按字母排序。新增 3 个测试用例（files 字段不含路径、排序、空数组），原有测试同步更新。后端共 8 个测试全通过。
- ✅ Task 2: 前端 `api.ts` 同步更新 `ActivityDay` 接口增加 `files: string[]` 字段。
- ✅ Task 3: `ActivityHeatmap.tsx` 将原生 `title` 属性替换为 Radix Tooltip 组件（复用项目已有 `src/components/ui/tooltip.tsx`）。`TooltipProvider` 包裹整个 grid，`delayDuration={200}`。Tooltip 内容包含日期（粗体）、修改次数、文件列表（最多 10 个 + `+N more`）。count=0 时显示「无修改」。新增 3 个 Tooltip 渲染测试，前端共 15 个测试全通过。
- ⚠️ 注意：Radix Tooltip 在 jsdom 环境中会通过 Portal 渲染两份内容，测试中使用 `findAllByText`/`getAllByText` 代替 `findByText`/`getByText`。
- ⚠️ 预先存在的测试失败（10 个文件）和 TypeScript 错误（i18n 相关）与本次修改无关。

### File List

- `server/routes/statsRoutes.ts` — 修改：扩展 ActivityDay 接口 + filesMap 聚合逻辑
- `src/lib/api.ts` — 修改：更新 ActivityDay 接口增加 files 字段
- `src/components/stats/ActivityHeatmap.tsx` — 修改：替换 title 为 Radix Tooltip
- `tests/unit/server/routes/statsRoutes.test.ts` — 修改：扩展测试验证 files 字段
- `tests/unit/components/stats/ActivityHeatmap.test.tsx` — 修改：扩展 Tooltip 渲染测试

### Review Findings

- [x] [Review][Patch] Tooltip 文件列表 `key={f}` 在同名文件时会重复 — 已改用 index 作 key ✅
- [x] [Review][Patch] 后端 `filesMap` 未去重，不同子目录下同名文件会重复出现 — 已改用 Set 去重 ✅
- [x] [Review][Patch] 测试 "files 字段只包含文件名" 中 `mockPathExists` 和 `mockReaddir` 被冗余设置 — 已清理 ✅
- [x] [Review][Defer] `toISOString()` 使用 UTC 时间导致日期与用户本地时区不一致 — deferred, pre-existing
- [x] [Review][Defer] 触屏设备无法触发 Tooltip — deferred, 项目定位桌面端
- [x] [Review][Defer] `ActivityDay` 接口在前后端重复定义 — deferred, story 明确保持现有模式
- [x] [Review][Defer] 测试依赖 `new Date()` 当前日期，UTC 午夜边界可能导致测试不稳定 — deferred, pre-existing
