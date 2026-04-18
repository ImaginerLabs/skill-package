# 组件样式规范

本文档定义项目中 UI 组件的使用规范，确保样式一致性和可维护性。

## Badge 使用规范

| Variant | 使用场景 | 示例 |
|---------|---------|------|
| `default` | 分类标签 | `<Badge>{skill.category}</Badge>` |
| `secondary` | 工作流/类型标识 | `<Badge variant="secondary">工作流</Badge>` |
| `outline` | 标签（tags）、计数 | `<Badge variant="outline">#tag</Badge>` |
| `destructive` | 删除/危险操作 | `<Badge variant="destructive">已删除</Badge>` |

### 尺寸规范

```tsx
// 小尺寸（h-5, px-1.5, text-[10px]）
<Badge variant="default" className="h-5 px-1.5 text-[10px]">
  分类
</Badge>

// 默认尺寸
<Badge variant="outline">
  #tag
</Badge>
```

## Button icon 尺寸规范

| Size | 高度 | 宽度 | 使用场景 |
|------|------|------|---------|
| `sm` | h-7 | w-7 | 辅助操作、工具栏次要按钮 |
| `md`（默认） | h-8 | w-8 | 标准 icon 按钮 |
| `lg` | h-9 | w-9 | 主要操作 |

```tsx
// 次要操作
<Button variant="ghost" size="sm" className="h-7 w-7">
  <Icon size={13} />
</Button>

// 标准操作
<Button variant="ghost" size="icon" className="h-8 w-8">
  <Icon size={14} />
</Button>

// 主要操作
<Button variant="ghost" className="h-9 w-9">
  <Icon size={16} />
</Button>
```

## 颜色语义规范

### CSS 变量颜色

| 变量 | HSL 值 | 使用场景 |
|------|--------|---------|
| `primary` | `hsl(var(--primary))` | 主操作、选中状态、链接 |
| `destructive` | `hsl(var(--destructive))` | 危险操作、删除、错误 |
| `warning` | `hsl(var(--warning))` | 警告状态（注意：需在 globals.css 中定义） |
| `info` | `hsl(var(--info))` | 信息提示、工作流类型 |
| `muted-foreground` | `hsl(var(--muted-foreground))` | 次要文本、图标、placeholder |
| `border` | `hsl(var(--border))` | 边框 |
| `accent` | `hsl(var(--accent))` | hover 背景 |

### 禁止事项

- ❌ 禁止硬编码颜色值（如 `yellow-500`、`#fff`）
- ❌ 禁止使用与语义不符的颜色
- ✅ 必须使用 CSS 变量

### 正确示例

```tsx
// ✅ 正确：使用 CSS 变量
<span className="text-[hsl(var(--primary))]">主操作</span>
<span className="text-[hsl(var(--destructive))]">删除</span>
<span className="text-[hsl(var(--warning))]">警告</span>

// ❌ 错误：硬编码颜色
<span className="text-yellow-500">警告</span>
<span className="text-red-500">错误</span>
```

## 错误提示组件

使用 `ErrorAlert` 组件替代内联错误样式：

```tsx
import ErrorAlert from "../shared/ErrorAlert";

// 错误提示
<ErrorAlert message="保存失败" details="网络连接超时" variant="error" />

// 警告提示
<ErrorAlert message="操作有风险" variant="warning" />

// 信息提示
<ErrorAlert message="配置文件已更新" variant="info" />
```

## EmptyState 组件

使用 `EmptyState` 组件统一空状态 UI：

```tsx
import EmptyState from "../skills/EmptyState"; // 或 shared/EmptyState（待抽取）

// 无 Skill
<EmptyState variant="noSkill" />

// 搜索无结果
<EmptyState variant="noResult" />

// 分类为空
<EmptyState variant="emptyCategory" />

// 自定义空状态
<EmptyState
  variant="custom"
  title="自定义标题"
  description="自定义描述"
  action={{ label: "操作", onClick: () => {} }}
/>
```

## ConfirmDialog 组件

使用 `ConfirmDialog` 组件统一确认对话框：

```tsx
import ConfirmDialog from "../shared/ConfirmDialog";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";

// 受控模式
const { confirmState, requestConfirm, handleConfirm } = useConfirmDialog<string>();
<ConfirmDialog
  {...confirmState}
  onConfirm={handleConfirm}
  variant="danger"
  title="确认删除"
  description="此操作不可撤销"
/>

// 触发删除
requestConfirm("item-id");
```

## 状态颜色映射表

| 状态 | 颜色变量 | 说明 |
|------|---------|------|
| 默认/未选中 | `muted-foreground` | 辅助信息 |
| 选中/激活 | `primary` | 主操作、当前选中 |
| 危险/删除 | `destructive` | 删除操作 |
| 警告 | `warning` | 需要注意 |
| 成功/完成 | `primary` | 操作成功 |
| 信息 | `info` | 工作流类型等 |
