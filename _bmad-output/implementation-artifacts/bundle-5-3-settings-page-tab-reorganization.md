# Story bundle-5.3: 设置页 Tab 化重组织 + 导航重命名

Status: review

## Story

As a 用户,
I want 侧边栏导航显示"分类"而非"设置"，且分类页内有"分类设置"和"套件管理"两个 Tab,
so that 我能直观理解导航入口的功能，并在分类管理和套件管理之间快速切换。

## Acceptance Criteria

1. 侧边栏导航文字从"设置"改为"分类"，路由 `/settings` 保持不变
2. `SettingsPage.tsx` 页面顶部显示两个 Tab："分类设置"（默认激活）和"套件管理"
3. 使用 shadcn/ui 风格的 `Tabs` 组件实现（需新建 `src/components/ui/tabs.tsx`）
4. "分类设置" Tab 渲染现有 `CategoryManager` 组件（零改动）
5. "套件管理" Tab 渲染占位内容（Story 5.4 实现完整功能）
6. 页面 H1 标题显示"分类管理"
7. Tab 切换时各自的状态不重置
8. 现有 CategoryManager 功能 100% 正常工作（零回归）
9. 新增 SettingsPage Tab 切换的单元测试，所有测试通过

## Tasks / Subtasks

- [x] Task 1: 新建 src/components/ui/tabs.tsx（AC: 3）
  - [x] 1.1 实现 Tabs、TabsList、TabsTrigger、TabsContent 组件（shadcn/ui 风格）

- [x] Task 2: 修改 src/components/layout/Sidebar.tsx（AC: 1）
  - [x] 2.1 将导航项 label 从"设置"改为"分类"

- [x] Task 3: 修改 src/pages/SettingsPage.tsx（AC: 2, 4, 5, 6, 7）
  - [x] 3.1 引入 Tabs 组件
  - [x] 3.2 添加 H1 标题"分类管理"
  - [x] 3.3 实现两个 Tab："分类设置"和"套件管理"
  - [x] 3.4 "分类设置" Tab 渲染 CategoryManager
  - [x] 3.5 "套件管理" Tab 渲染占位内容

- [x] Task 4: 编写单元测试（AC: 8, 9）
  - [x] 4.1 `tests/unit/components/settings/SettingsPage.test.tsx` — Tab 切换测试
  - [x] 4.2 运行全量测试确认无回归

## Dev Notes

### Tabs 组件实现（shadcn/ui 风格）

使用 React 原生 state 实现，不依赖 Radix UI（项目中未安装）：

```tsx
// src/components/ui/tabs.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  activeTab: "",
  setActiveTab: () => {},
});

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

const Tabs = ({ defaultValue, children, className }: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

// TabsList、TabsTrigger、TabsContent 类似实现
```

### SettingsPage.tsx 改造

```tsx
export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-[var(--font-code)] mb-6">
        分类管理
      </h1>
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">分类设置</TabsTrigger>
          <TabsTrigger value="bundles">套件管理</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
        <TabsContent value="bundles">
          <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
            <p>套件管理功能即将上线</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 测试注意事项

- `CategoryManager` 有复杂的 API 依赖，测试中需要 mock `fetchCategories` 等
- 重点测试：Tab 切换后内容区域正确渲染
- 使用 `@testing-library/react` 的 `fireEvent.click` 触发 Tab 切换

### 文件位置规范

- `src/components/ui/tabs.tsx` — **新建**
- `src/components/layout/Sidebar.tsx` — 修改（label 改为"分类"）
- `src/pages/SettingsPage.tsx` — 修改（Tab 化）
- `tests/unit/components/settings/SettingsPage.test.tsx` — **新建**

### References

- [Source: architecture.md#AD-21] 设置页 Tab 化重组织
- [Source: src/components/ui/card.tsx] shadcn/ui 组件实现模式
- [Source: src/components/layout/Sidebar.tsx] 导航配置
- [Source: src/pages/SettingsPage.tsx] 当前实现
- [Source: epics.md#Story 5.3] 完整 AC 定义

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: `src/components/ui/tabs.tsx` 新建，使用 React 原生 state 实现，支持受控/非受控模式
- ✅ Task 2: `Sidebar.tsx` 导航文字"设置"→"分类"
- ✅ Task 3: `SettingsPage.tsx` 改造完成，标题"分类管理"，两个 Tab 正常工作
- ✅ Task 4: 7 个单元测试全部通过；TypeScript 零错误；全量测试 689/689 通过

### File List

- src/components/ui/tabs.tsx
- src/components/layout/Sidebar.tsx
- src/pages/SettingsPage.tsx
- tests/unit/components/settings/SettingsPage.test.tsx
