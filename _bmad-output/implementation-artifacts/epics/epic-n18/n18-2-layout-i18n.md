# Story N18-2: Layout 层 i18n 化 — Header 语言切换 + Sidebar/SecondarySidebar 导航标签

Status: done

## Story

As a Skill Manager 用户,
I want 顶部栏显示语言切换按钮，侧边栏导航标签根据当前语言显示中文或英文,
so that 我可以随时切换界面语言，并且全局导航始终以我选择的语言显示。

## Acceptance Criteria

1. **[Header 语言切换按钮]** `Header.tsx` 右侧区域（主题切换按钮旁）新增语言切换按钮：当前语言为 `zh` 时显示 `EN`，当前语言为 `en` 时显示 `中`；点击后切换语言并持久化到 `localStorage["skill-manager-lang"]`。

2. **[Header 文本 i18n 化]** Header 中所有硬编码中文字符串替换为 `t()` 调用：搜索框占位符 `t("header.searchPlaceholder")`、搜索按钮 `aria-label={t("header.searchAriaLabel")}`、主题切换 `aria-label={t("header.toggleTheme")}`、语言切换 `aria-label={t("header.switchLanguage")}`。

3. **[Sidebar 导航标签 i18n 化]** `Sidebar.tsx` 中所有导航标签替换为 `t()` 调用：`"Skill 库"` → `t("nav.skillLibrary")`，`"工作流"` → `t("nav.workflow")`，`"同步"` → `t("nav.sync")`，`"导入"` → `t("nav.import")`，`"路径配置"` → `t("nav.pathConfig")`。

4. **[SecondarySidebar 文本 i18n 化]** `SecondarySidebar.tsx` 中 `"分类"` 标题 → `t("nav.categories")`，`"管理分类"` 链接 → `t("nav.manageCategories")`。

5. **[语言切换响应式]** 切换语言后，无需刷新页面，Header 和 Sidebar 中的所有文本立即更新为目标语言。

6. **[语言切换按钮样式]** 语言切换按钮样式与主题切换按钮一致：`w-8 h-8 rounded-md`，使用 `text-[hsl(var(--muted-foreground))]` 颜色，hover 时变为 `text-[hsl(var(--foreground))]`，字体使用 `font-[var(--font-code)]` 以保持等宽对齐。

7. **[TypeScript 零错误]** `tsc --noEmit` 通过，无类型错误。

8. **[单元测试通过]** 所有新增和修改的单元测试 100% 通过。

## Tasks / Subtasks

- [ ] Task 1: 修改 `Header.tsx` — 添加语言切换按钮 + 文本 i18n 化 (AC: 1, 2, 5, 6)
  - [ ] 1.1 添加 `import { useTranslation } from "react-i18next";`
  - [ ] 1.2 在组件内获取 `const { t, i18n } = useTranslation();`
  - [ ] 1.3 计算当前语言：`const currentLang = i18n.language.startsWith("zh") ? "zh" : "en";`
  - [ ] 1.4 实现 `toggleLanguage` 函数：`i18n.changeLanguage(currentLang === "zh" ? "en" : "zh")`
  - [ ] 1.5 在主题切换按钮旁添加语言切换按钮（样式参考 Dev Notes）
  - [ ] 1.6 将搜索框占位符、aria-label 等硬编码中文替换为 `t()` 调用
  - [ ] 1.7 单元测试：验证语言切换按钮存在，点击后 `i18n.changeLanguage` 被调用
  - [ ] 1.8 单元测试：验证 zh 时按钮显示 "EN"，en 时显示 "中"

- [ ] Task 2: 修改 `Sidebar.tsx` — 导航标签 i18n 化 (AC: 3, 5)
  - [ ] 2.1 添加 `import { useTranslation } from "react-i18next";`
  - [ ] 2.2 在组件内获取 `const { t } = useTranslation();`
  - [ ] 2.3 将 `navItems` 数组中的 `label` 字段改为动态 `t()` 调用（注意：`navItems` 是模块级常量，需移入组件内或改为函数）
  - [ ] 2.4 将 `"Skill 库"` 按钮文本替换为 `{t("nav.skillLibrary")}`
  - [ ] 2.5 单元测试：验证导航标签在 zh 时显示中文，在 en 时显示英文

- [ ] Task 3: 修改 `SecondarySidebar.tsx` — 文本 i18n 化 (AC: 4, 5)
  - [ ] 3.1 添加 `import { useTranslation } from "react-i18next";`
  - [ ] 3.2 在组件内获取 `const { t } = useTranslation();`
  - [ ] 3.3 将 `"分类"` 标题替换为 `{t("nav.categories")}`
  - [ ] 3.4 将 `"管理分类"` 链接文本替换为 `{t("nav.manageCategories")}`
  - [ ] 3.5 单元测试：验证文本在 zh/en 时正确显示

- [ ] Task 4: 验证与类型检查 (AC: 7, 8)
  - [ ] 4.1 运行 `tsc --noEmit`，确认零错误
  - [ ] 4.2 运行 `npm run test:run`，确认所有测试通过

## Dev Notes

### 关键文件路径

| 文件                                         | 操作                                 |
| -------------------------------------------- | ------------------------------------ |
| `src/components/layout/Header.tsx`           | 修改：添加语言切换按钮，文本 i18n 化 |
| `src/components/layout/Sidebar.tsx`          | 修改：导航标签 i18n 化               |
| `src/components/layout/SecondarySidebar.tsx` | 修改：文本 i18n 化                   |

### Header.tsx 修改参考（语言切换按钮）

```tsx
// 在主题切换按钮之后添加语言切换按钮
import { useTranslation } from "react-i18next";

export default function Header() {
  const { setCommandPaletteOpen, theme, toggleTheme } = useUIStore();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith("zh") ? "zh" : "en";

  const toggleLanguage = () => {
    i18n.changeLanguage(currentLang === "zh" ? "en" : "zh");
  };

  return (
    <header ...>
      {/* 左侧：Logo — 不变 */}

      {/* 中间：全局搜索入口 */}
      <button
        type="button"
        aria-label={t("header.searchAriaLabel")}
        onClick={() => setCommandPaletteOpen(true)}
        ...
      >
        <Search size={14} />
        <span className="flex-1 text-left">{t("header.searchPlaceholder")}</span>
        <kbd ...>⌘K</kbd>
      </button>

      {/* 右侧：主题切换 + 语言切换 + 同步状态指示器 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t("header.toggleTheme")}
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors duration-200"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* 语言切换按钮 */}
        <button
          type="button"
          aria-label={t("header.switchLanguage")}
          onClick={toggleLanguage}
          className="flex items-center justify-center w-8 h-8 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors duration-200 text-xs font-[var(--font-code)] font-medium"
        >
          {currentLang === "zh" ? t("header.langEn") : t("header.langZh")}
        </button>

        <SyncStatusIndicator />
      </div>
    </header>
  );
}
```

### Sidebar.tsx 修改参考（navItems 动态化）

```tsx
// navItems 是模块级常量，包含静态 label，需改为组件内动态生成
// 原代码：
const navItems = [
  { to: "/workflow", icon: GitBranch, label: "工作流" },
  { to: "/sync", icon: RefreshCw, label: "同步" },
  { to: "/import", icon: Download, label: "导入" },
  { to: "/paths", icon: FolderOpen, label: "路径配置" },
];

// 修改后：在组件内使用 t() 动态生成
export default function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: "/workflow", icon: GitBranch, label: t("nav.workflow") },
    { to: "/sync", icon: RefreshCw, label: t("nav.sync") },
    { to: "/import", icon: Download, label: t("nav.import") },
    { to: "/paths", icon: FolderOpen, label: t("nav.pathConfig") },
  ];

  // "Skill 库" 按钮文本：
  // 原：Skill 库
  // 改：{t("nav.skillLibrary")}
  ...
}
```

### 测试文件位置

- `tests/unit/components/layout/Header.test.tsx` — 更新：添加语言切换按钮测试
- `tests/unit/components/layout/Sidebar.test.tsx` — 更新：验证 i18n 导航标签
- `tests/unit/components/layout/SecondarySidebar.test.tsx` — 更新：验证 i18n 文本

### 测试 Mock 模式（react-i18next）

```typescript
// tests/setup.ts 或测试文件中 mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // 返回 key 本身，便于断言
    i18n: {
      language: "zh",
      changeLanguage: vi.fn(),
    },
  }),
}));
```

### 架构约束（来自 AD-29）

- `navItems` 必须移入组件内（或改为函数），因为 `t()` 只能在 React 组件/Hook 中调用
- 语言切换无需页面刷新，`react-i18next` 响应式机制自动触发重渲染
- 语言切换按钮样式与主题切换按钮保持一致（`w-8 h-8 rounded-md`）

### 依赖前置条件

- **Story N18-1 必须已完成**：`src/i18n/index.ts`、`src/i18n/locales/zh.ts`、`src/i18n/locales/en.ts` 已存在

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#AD-29]
- [Source: src/components/layout/Header.tsx] — 当前 Header 实现
- [Source: src/components/layout/Sidebar.tsx] — 当前 Sidebar 实现
- [Source: src/components/layout/SecondarySidebar.tsx] — 当前 SecondarySidebar 实现

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
