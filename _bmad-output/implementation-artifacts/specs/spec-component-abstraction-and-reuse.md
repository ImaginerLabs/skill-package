---
title: "组件抽象与复用统一 — 消除重复模式，提升 UI 一致性"
type: "refactor"
created: "2026-04-16"
updated: "2026-04-16"
status: "reviewed"
context:
  - "{project-root}/_bmad-output/planning-artifacts/architecture.md"
  - "{project-root}/_bmad-output/planning-artifacts/architecture-interaction-optimization.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 项目中存在 7 处明显的组件/逻辑重复模式（AlertDialog 确认、SkillGrid/SkillListView 逻辑、SkillTypeIcon、侧边栏列表项样式、EmptyState、搜索输入、拖拽排序），导致维护成本高、UI 一致性差、改动需同步多处。

**Approach:** 提取共享组件（`ConfirmDialog`、`SkillTypeIcon`、`SearchInput`、`SidebarItem`、`EmptyState` 增强版）和自定义 Hook（`useConfirmDialog`、组合式 Skill 列表 Hooks），统一样式到 CVA variants，分两阶段渐进替换现有文件中的重复实现。

## Boundaries & Constraints

**Always:**
- 遵守 AD-1 技术栈决策（React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui CVA 模式），不引入新依赖
- 新共享组件放在 `src/components/shared/`，新 Hook 放在 `src/hooks/`
- 新创建的共享组件内所有用户可见文本使用 i18n（`useTranslation` + `t()`）
- 保持现有测试通过，不破坏外部 API 接口
- 渐进式替换：先创建抽象，再逐文件迁移，每步可独立验证
- 每个 task 完成后立即编写单元测试，全部通过再继续下一个

**Decided (from Party Mode review 2026-04-16):**
- SkillGrid 和 SkillListView 保留两个组件，通过组合式 Hook 共享逻辑（布局差异大，合并会引入过多条件分支）
- Settings 大组件（BundleManager/CategoryManager/PathPresetManager）的 CRUD 抽象**不纳入本范围**，单独 spec 处理
- i18n 全局迁移**不纳入本范围**，单独 spec 处理；本 spec 仅在新共享组件内强制使用 t()，旧文件暂不迁移
- useSkillListLogic 拆为组合式 Hooks，避免"上帝 Hook"

**Never:**
- 不重构 `src/components/ui/` 下的 shadcn 基础组件
- 不改变现有路由结构和页面级组件
- 不修改后端 API 或数据类型定义
- 不引入 Framer Motion 或其他动画库
- 不在本 spec 范围内实施 Settings CRUD 抽象
- 不在本 spec 范围内做全局 i18n 迁移（仅新组件内强制 t()）

</frozen-after-approval>

## Code Map

- `src/components/skills/SkillGrid.tsx` — 网格视图，含删除确认、筛选搜索、键盘导航（与 SkillListView 大量重复）
- `src/components/skills/SkillListView.tsx` — 列表视图，与 SkillGrid 共享几乎相同的逻辑
- `src/components/skills/SkillCard.tsx` — 卡片组件，含 `skill.type === "workflow"` 图标判断
- `src/components/skills/SkillList.tsx` — 列表项组件，含相同的 type 图标判断
- `src/components/skills/SkillPreview.tsx` — 预览面板，含 type 图标判断 + 空状态
- `src/components/skills/CategoryTree.tsx` — 分类侧边栏，含选中/未选中样式
- `src/components/skills/SourceTree.tsx` — 来源侧边栏，含几乎相同的选中/未选中样式
- `src/components/skills/EmptyState.tsx` — 空状态组件（仅 skills 模块使用，其他模块各自实现）
- `src/components/skills/MetadataEditor.tsx` — 元数据编辑器，含 AlertDialog 删除确认
- `src/components/sync/SyncTargetManager.tsx` — 同步目标管理，含 AlertDialog 删除确认 + 空状态引导
- `src/components/sync/ReplaceSyncConfirmDialog.tsx` — 替换同步确认，AlertDialog 变体
- `src/pages/import/CleanupConfirmDialog.tsx` — 清理确认，AlertDialog 变体
- `src/components/shared/CommandPalette.tsx` — 全局搜索，含 type 图标判断
- `src/components/workflow/SkillSelector.tsx` — Skill 选择器，含搜索输入 + 空状态
- `src/components/workflow/StepItem.tsx` — 可拖拽步骤，含 useSortable + 键盘排序
- `src/components/workflow/CustomStepCard.tsx` — 自定义步骤卡片，含几乎相同的 useSortable + 键盘排序

## Execution Phases

### Phase 1 — 低风险高收益（基础设施层）

- [ ] `src/components/shared/ConfirmDialog.tsx` -- 创建通用确认对话框组件，封装 AlertDialog 的 `open/onOpenChange/title/description/confirmLabel/cancelLabel/variant(danger|default)/onConfirm/confirmDisabled/defaultFocus("cancel"|"confirm")` props，替换 SkillGrid、SkillListView、MetadataEditor、SyncTargetManager、CleanupConfirmDialog、ReplaceSyncConfirmDialog 中的重复 AlertDialog 样板代码 -- 消除 6 处重复的 AlertDialog 结构，统一确认交互模式；`defaultFocus` 默认 "cancel"，危险操作防误触
- [ ] `src/hooks/useConfirmDialog.ts` -- 创建确认对话框状态管理 Hook，泛型设计 `useConfirmDialog<T>()`，返回 `{ confirmState: { open, target }, requestConfirm, handleConfirm, handleCancel }`，替换 SkillGrid/SkillListView 中的 `deleteTarget` + `setDeleteTarget` + `handleConfirmDelete` 样板 -- 消除删除确认状态管理的重复逻辑
- [ ] `src/components/shared/SkillTypeIcon.tsx` -- 创建 Skill 类型图标组件，接收 `type: SkillMeta["type"]` + `size?: number`，返回 `GitBranch`（workflow，muted-foreground 色）或 `FileText`（默认，muted-foreground 色），替换 SkillCard/SkillList/SkillPreview/CommandPalette 中的 `skill.type === "workflow" ? <GitBranch/> : <FileText/>` 判断 -- 统一类型图标渲染逻辑；使用 muted 色弱化图标，让技能名称成为视觉焦点
- [ ] `src/components/shared/SearchInput.tsx` -- 创建搜索输入组件，封装 Search 图标 + Input + placeholder + 清空按钮（仅在有内容时显示 ×）的标准模式，props: `value?: string / onChange?: (value: string) => void / placeholder?: string / autoFocus?: boolean`，替换 SkillSelector 和未来搜索场景中的重复搜索框代码 -- 统一搜索输入 UI；清空按钮点击后触发 onChange("")
- [ ] `src/components/shared/SidebarItem.tsx` -- 创建侧边栏列表项组件，用 CVA variants 定义样式，替换 CategoryTree 和 SourceTree 中重复的选中/未选中 className 字符串 -- 统一侧边栏项交互样式；CVA 支持 `active` + `state` 两个 variant（见 Design Notes）

### Phase 2 — 中风险（逻辑层 + 增强）

- [ ] `src/hooks/useSkillFiltering.ts` -- 创建 Skill 筛选 Hook，封装 `useFilteredSkills` + `useSkillSearch` + `isCategoryEmpty` 逻辑，返回 `{ filteredSkills, searchQuery, setSearchQuery, isCategoryEmpty }` -- 从 useSkillListLogic 拆出的纯筛选逻辑
- [ ] `src/hooks/useSkillActions.ts` -- 创建 Skill 操作 Hook，封装 `deleteConfirm`（基于 useConfirmDialog）+ 其他列表级操作，返回 `{ confirmState, requestDelete, handleConfirmDelete }` -- 从 useSkillListLogic 拆出的操作逻辑，与 useConfirmDialog 职责清晰
- [ ] `src/hooks/useKeyboardNav.ts` -- 创建键盘导航 Hook，封装 roving focus + 键盘事件处理，返回 `{ getItemProps, handleKeyDown }` -- 从 useSkillListLogic 拆出的键盘逻辑，可复用于其他列表场景
- [ ] `src/components/skills/EmptyState.tsx` -- 增强现有 EmptyState 组件，增加 `variant: "noSkill" | "noResult" | "emptyCategory" | "custom"` + `icon?` + `title?` + `description?` + `action?: { label: string; onClick: () => void }` props，使其可被 SyncTargetManager/SkillSelector/SkillPreview 复用 -- 统一全局空状态 UI（见 Design Notes 的 variant 映射表）
- [ ] `src/hooks/useSortableStep.ts` -- 提取共享的 useSortable + 键盘排序逻辑（基于 @dnd-kit/sortable），返回 `{ attributes, listeners, setNodeRef, style, isDragging, handleKeyDown }`，StepItem 和 CustomStepCard 改为调用此 Hook -- 消除拖拽排序的重复逻辑
- [ ] 上述所有被替换文件 -- 逐一迁移至新的共享组件/Hook，删除被替换的重复代码，确保功能不变 -- 完成抽象替换；每迁移一个文件后运行完整测试套件验证

## Tests (MANDATORY — do NOT delete this section)

**单元测试：**

- [ ] `tests/unit/components/ConfirmDialog.test.tsx` -- Vitest 单元测试：渲染不同 variant（default/danger）、props 传递、按钮点击回调、confirmDisabled 状态、defaultFocus 聚焦行为、键盘 Enter/Esc
- [ ] `tests/unit/components/SkillTypeIcon.test.tsx` -- Vitest 单元测试：workflow 类型渲染 GitBranch、默认类型渲染 FileText、自定义 size
- [ ] `tests/unit/components/SidebarItem.test.tsx` -- Vitest 单元测试：CVA variants 渲染（active=true/false、state=default/disabled）、点击回调、icon+label 渲染
- [ ] `tests/unit/components/SearchInput.test.tsx` -- Vitest 单元测试：输入 onChange 回调、清空按钮显示/隐藏及点击、placeholder 渲染、value 受控行为
- [ ] `tests/unit/components/EmptyState.test.tsx` -- Vitest 单元测试：每个 variant 渲染正确的默认 icon/文案、action 按钮回调、custom variant 自定义内容
- [ ] `tests/unit/hooks/useConfirmDialog.test.ts` -- Vitest 单元测试：泛型 target 传递、requestConfirm 调用后 open 状态变化、handleConfirm/handleCancel 回调、连续多次调用 requestConfirm
- [ ] `tests/unit/hooks/useSkillFiltering.test.ts` -- Vitest 单元测试：空数组、搜索无结果、分类切换后筛选
- [ ] `tests/unit/hooks/useSkillActions.test.ts` -- Vitest 单元测试：requestDelete 触发 confirmState、handleConfirmDelete 调用删除回调
- [ ] `tests/unit/hooks/useKeyboardNav.test.ts` -- Vitest 单元测试：ArrowUp/Down 移动焦点、Home/End 跳转、Enter 触发选择
- [ ] `tests/unit/hooks/useSortableStep.test.ts` -- Vitest 单元测试：初始化后 sensors 设置、isDragging 状态、空数组/单元素边界、handleKeyDown 回调

**集成测试：**

- [ ] `tests/integration/skill-grid-refactor.test.tsx` -- Vitest + @testing-library/react 集成测试：不 mock 新提取的组件，验证 SkillGrid 组件渲染后搜索→列表过滤→SkillTypeIcon 正确显示、点击删除→ConfirmDialog 弹出→点击确认→项目移除、切换视图→状态保留

**E2E 测试：**

- [ ] `tests/e2e/skill-browse.spec.ts` -- Playwright E2E：验证网格/列表视图切换后搜索、删除确认、空状态仍正常工作；**扩展：CategoryTree 切换分类后过滤结果正确**

**覆盖率目标：**

- `src/components/shared/**` 行覆盖率 ≥ 85%
- `src/hooks/use*.ts` 函数覆盖率 ≥ 90%

## Acceptance Criteria

- Given SkillGrid 和 SkillListView 页面，当执行搜索/筛选/删除操作时，行为与重构前完全一致
- Given 任意 Skill 类型，当渲染 SkillTypeIcon 时，workflow 类型显示 GitBranch（muted-foreground 色），其他显示 FileText（muted-foreground 色）
- Given ConfirmDialog 组件，当传入 variant="danger" 时，确认按钮显示 destructive 样式，默认聚焦"取消"按钮
- Given ConfirmDialog 组件，当传入 defaultFocus="confirm" 时，确认按钮获得焦点
- Given CategoryTree 和 SourceTree，当点击切换选中项时，视觉样式一致（border-l + bg + font-semibold 高亮，hover 与 active 可区分）
- Given SidebarItem 组件，当 hover 时显示 accent 背景无字重变化，当 active 时显示 accent 背景 + font-semibold + 图标高亮
- Given EmptyState 组件 variant="noSkill"，显示引导性空状态（大字号标题 + 引导文案 + 操作按钮）
- Given EmptyState 组件 variant="noResult"，显示搜索无结果提示（建议文案 + 清除筛选链接）
- Given SearchInput 组件，当有输入内容时显示清空按钮，点击清空触发 onChange("")
- Given 所有新创建的共享组件，当检查源码时，无硬编码中文字符串（全部使用 t()）

## Spec Change Log

- 2026-04-16: Party Mode 审查后更新 — 决策：Settings CRUD 不纳入、i18n 全局迁移不纳入、useSkillListLogic 拆为组合式 Hooks、ConfirmDialog 增加 defaultFocus、SidebarItem 增加 state variant + 字重区分、EmptyState 补充 variant 映射表、SearchInput 补充完整交互规格、测试覆盖从 4 项扩展至 12 项、增加集成测试层、增加覆盖率目标、执行分两阶段

## Design Notes

**ConfirmDialog 统一模式：** 当前 6 处 AlertDialog 用法分为两类：
1. **受控模式**（SkillGrid/SkillListView/MetadataEditor/SyncTargetManager）：父组件管理 open 状态 + target，`<AlertDialog open={!!deleteTarget}>`
2. **独立组件模式**（CleanupConfirmDialog/ReplaceSyncConfirmDialog）：已封装为独立组件

ConfirmDialog 采用独立组件模式（props: `open, onOpenChange, title, description, onConfirm, variant?, defaultFocus?`），配合 `useConfirmDialog` Hook 处理受控场景的状态管理。Golden example:
```tsx
const { confirmState, requestConfirm, handleConfirm } = useConfirmDialog<{id: string}>();
// 触发: requestConfirm({ id: skill.id }, async () => { await deleteSkill(confirmState.target!.id); });
<ConfirmDialog {...confirmState} onConfirm={handleConfirm} variant="danger" defaultFocus="cancel" />
```

**SkillGrid/SkillListView 策略：** 保留两个视图组件（布局差异大），通过组合式 Hooks 共享逻辑。SkillGrid/SkillListView 各自组合调用 `useSkillFiltering` + `useSkillActions` + `useKeyboardNav`，只关心渲染层。

**组合式 Skill 列表 Hooks 拆分：**
```
useSkillListLogic (旧，上帝 Hook)
  ├── useSkillFiltering  — 筛选 + 搜索 + 空状态判断
  ├── useSkillActions    — 删除确认 + 列表操作（基于 useConfirmDialog）
  └── useKeyboardNav     — roving focus + 键盘事件
```

**SidebarItem CVA variants（审查后增强版）：**
```tsx
const sidebarItemVariants = cva(
  "flex items-center gap-2 w-full px-4 py-1.5 text-sm transition-colors cursor-pointer border-l-[3px] pl-[13px]",
  {
    variants: {
      active: {
        true: "border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-semibold",
        false: "border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
      },
      state: {
        default: "",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none",
      },
    },
    defaultVariants: {
      active: false,
      state: "default",
    },
  }
);
```
关键改进：active 状态加 `font-semibold`（与 hover 区分）；预留 `state` variant 支持未来 disabled/error 状态。

**EmptyState variant 映射表：**

| Variant | 默认 Icon | 默认 Title | 默认 Description | 设计意图 |
|---------|----------|-----------|-----------------|---------|
| `noSkill` | Package | "还没有技能" | "创建或导入你的第一个技能" | 首次使用引导，大字号标题 + 操作按钮 |
| `noResult` | SearchX | "没有找到匹配的技能" | "试试调整关键词或清除筛选条件" | 搜索无结果，提供建议 |
| `emptyCategory` | FolderOpen | "这个分类还是空的" | "将技能移入此分类" | 分类为空，降低视觉优先级 |
| `custom` | — | — | — | 灵活兜底，需提供 icon/title/description |

action prop 类型：`{ label: string; onClick: () => void }`（非 ReactNode，确保交互可控）。

**SearchInput 完整交互规格：**
- Props: `value?: string` / `onChange?: (value: string) => void` / `placeholder?: string`（默认 "搜索..."） / `autoFocus?: boolean`
- 左侧 Search 图标（muted-foreground 色），输入时图标变为 primary 色
- 有输入内容时右侧显示 × 清空按钮，点击清空并触发 `onChange("")`
- Focus 时边框高亮（primary 色 outline）
- 内部不管理状态，纯受控组件（由父组件管理 value + onChange）

**useSortableStep 接口：**
```tsx
interface UseSortableStepOptions {
  id: string;
  index: number;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

function useSortableStep(options: UseSortableStepOptions): {
  attributes: Record<string, any>;
  listeners: Record<string, any>;
  setNodeRef: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
  isDragging: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
};
```

## Verification

**Commands:**

- `npm run build` -- expected: 零错误零警告
- `npm run test:unit` -- expected: 所有单元测试通过
- `npm run lint` -- expected: 零错误
- `npm run test:coverage -- --include='src/components/shared/**,src/hooks/use*.ts'` -- expected: 行覆盖 ≥ 85%，函数覆盖 ≥ 90%

**Manual checks:**

- 在浏览器中验证 SkillGrid/SkillListView 的搜索、删除确认、键盘导航功能正常
- 验证 CategoryTree/SourceTree 的选中样式一致且与 hover 可区分
- 验证 ConfirmDialog 危险操作默认聚焦"取消"按钮
- 验证 SearchInput 清空按钮行为
- 验证 EmptyState 各 variant 的视觉表现
