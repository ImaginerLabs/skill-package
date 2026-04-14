---
name: react-component-extraction
description: This skill analyzes context dependencies, evaluates extraction boundaries, designs component/Hook interfaces, and ensures safe, backward-compatible extraction with zero breaking changes to existing callers. This skill should be used when the user says「抽取组件」「提取为 Hook」「拆分组件」「组件抽离」or「extract component」, or requests to extract reusable logic into a standalone component or custom Hook.
category: refactor
---

# React 组件逻辑抽取规范

## 核心能力

在用户要求抽取逻辑为组件或 Hook 时，系统性地分析上下文依赖、评估抽取边界、设计合理的接口结构，确保抽取后代码安全健壮，且对原有调用方零破坏。

## 适用场景

- 将重复逻辑抽取为可复用组件
- 将复杂 UI 逻辑拆分为子组件
- 将有状态逻辑抽取为自定义 Hook
- 重构过大的组件，提升可维护性

---

## 执行流程

```
1. 分析上下文依赖
       ↓
2. 评估抽取边界（最小化原则）
       ↓
3. 设计组件/Hook 接口结构
       ↓
4. 搜索项目，确认存放位置（询问用户）
       ↓
5. 执行抽取，保证安全健壮
       ↓
6. 验证原调用方兼容性
```

---

## 一、上下文依赖分析

抽取前，必须完整梳理目标逻辑的所有外部依赖，**不遗漏任何隐式依赖**。

### 1.1 需要识别的依赖类型

| 依赖类型         | 检查项                                                  |
| ---------------- | ------------------------------------------------------- |
| **Props 依赖**   | 目标逻辑使用了哪些来自父组件的 props                    |
| **State 依赖**   | 使用了哪些 state，是否需要提升或传入                    |
| **Context 依赖** | 是否消费了 `useContext`，抽取后是否仍在 Provider 范围内 |
| **Ref 依赖**     | 是否依赖 DOM ref 或组件 ref                             |
| **外部函数依赖** | 是否调用了父组件的回调、工具函数、全局方法              |
| **副作用依赖**   | 是否包含 `useEffect`，其依赖项是否完整                  |
| **样式依赖**     | 是否依赖父组件的 CSS 类名或样式变量                     |

### 1.2 依赖分析示例

> 📖 详细示例见 [examples.md](references/examples.md#1-依赖分析示例)

---

## 二、最小化抽离原则

**只抽取必要的部分，不过度设计，不引入不必要的抽象层。**

### 2.1 判断抽取粒度

| 场景                         | 推荐方案                                 |
| ---------------------------- | ---------------------------------------- |
| 逻辑复杂但 UI 简单           | 抽取为**自定义 Hook**，UI 保留在原组件   |
| UI 结构独立且可复用          | 抽取为**子组件**                         |
| 逻辑 + UI 高度耦合且多处复用 | 抽取为**完整组件**（含内部 state）       |
| 仅当前组件使用，只是过长     | 抽取为**同文件内的子组件**，不单独建文件 |

### 2.2 最小化原则示例

> 📖 详细示例见 [examples.md](references/examples.md#2-最小化原则示例)

---

## 三、接口结构设计规范

### 3.1 组件 Props 设计 & 3.2 自定义 Hook 设计

> 📖 详细示例见 [interface-design.md](references/interface-design.md)

### 3.3 规范要求

- [ ] Props 接口必须用 TypeScript 明确定义，必填/可选区分清晰。
- [ ] 可选 Props 必须提供默认值或做空值保护。
- [ ] Hook 返回值使用**对象**而非数组（超过 2 个返回值时），便于扩展。
- [ ] 不暴露内部实现细节，只暴露调用方真正需要的接口。

---

## 四、存放位置确认

### 4.1 搜索项目现有结构

抽取前，**必须先搜索项目**，了解现有组件目录结构，找到最合适的存放位置。

**搜索顺序：**

1. 查找 `src/components/` 目录，了解现有组件分类
2. 查找 `src/hooks/` 目录，了解现有 Hook 组织方式
3. 查找同类型组件，确认命名规范和文件结构

### 4.2 常见目录结构参考

```
src/
├── components/
│   ├── common/          # 通用基础组件（Button、Modal 等）
│   ├── business/        # 业务组件（与具体业务强相关）
│   └── [feature]/       # 按功能模块分组
├── hooks/
│   ├── useXxx.ts        # 通用 Hook
│   └── [feature]/       # 按功能模块分组的 Hook
└── pages/
    └── [page]/
        └── components/  # 页面私有组件（仅当前页面使用）
```

### 4.3 位置选择规则

| 复用范围                   | 推荐位置                                          |
| -------------------------- | ------------------------------------------------- |
| 仅当前页面/模块使用        | `pages/[page]/components/` 或同文件内             |
| 多个页面复用，与业务强相关 | `components/business/` 或 `components/[feature]/` |
| 通用 UI 组件，无业务逻辑   | `components/common/`                              |
| 自定义 Hook                | `hooks/` 或 `hooks/[feature]/`                    |

### 4.4 询问用户确认

搜索完成后，**必须向用户展示候选位置并询问确认**，不得擅自决定：

```
📁 已扫描项目结构，建议将 `UserCard` 组件存放在以下位置：

  候选 A：src/components/business/user/UserCard.tsx
           （理由：与现有 UserList、UserAvatar 同级，业务相关）

  候选 B：src/pages/profile/components/UserCard.tsx
           （理由：目前仅 Profile 页面使用，可先放页面私有目录）

请问您希望放在哪里？或者您有其他指定路径？
```

---

## 五、安全与健壮性保证

### 5.1 抽取后必须验证

- [ ] **原调用方不破坏**：抽取后，原来使用该逻辑的地方必须正常工作，接口向后兼容。
- [ ] **Props 空值保护**：所有可选 Props 必须有默认值或 `?.` 保护，防止调用方传 `undefined`。
- [ ] **副作用清理完整**：抽取的 Hook/组件中，所有 `useEffect` 必须有清理函数。
- [ ] **错误边界**：抽取的组件若涉及异步操作，必须处理 loading/error 状态。
- [ ] **Context 范围**：若依赖 Context，确认抽取后的组件仍在对应 Provider 的子树内。

### 5.2 兼容性检查示例

> 📖 详细示例见 [interface-design.md](references/interface-design.md#3-兼容性检查示例)

### 5.3 抽取检查清单

- [ ] 依赖分析完整，无遗漏的隐式依赖
- [ ] Props 接口设计合理，TypeScript 类型完整
- [ ] 可选 Props 有默认值或空值保护
- [ ] 副作用（useEffect）有清理函数
- [ ] 异步操作处理了 loading / error 状态
- [ ] 原调用方代码无需修改（或修改量最小）
- [ ] 存放位置已与用户确认
- [ ] 文件命名符合项目现有规范

---

## 输出格式

抽取完成后，按以下 Markdown 格式输出结果：

```markdown
## 组件抽取完成报告

### 抽取概览

- **抽取类型**：[子组件 / 自定义 Hook / 完整组件]
- **存放位置**：`[确认后的文件路径]`
- **原调用方**：`[原文件路径]`（[是否需要修改调用代码]）

---

### 依赖分析结果

| 依赖类型   | 依赖项       | 处理方式               |
| ---------- | ------------ | ---------------------- |
| Props 依赖 | [依赖名]     | 通过 props 传入        |
| State 依赖 | [state 名]   | 随逻辑一起抽取         |
| Context    | [Context 名] | 确认在 Provider 范围内 |
| 外部函数   | [函数名]     | import 或通过 props 传 |

---

### 生成的文件

#### `[新文件路径]`

[完整的组件/Hook 代码]

---

### 原调用方修改（如需）

[原文件中需要替换的代码片段，或"无需修改"]

---

### 兼容性验证

- [ ] 原调用方接口未破坏
- [ ] 可选 Props 有默认值或空值保护
- [ ] 副作用（useEffect）有清理函数
- [ ] 异步操作处理了 loading / error 状态
- [ ] 存放位置已与用户确认

### 注意事项

- [发现的原代码问题或潜在风险，不擅自修复，仅标注]
```
