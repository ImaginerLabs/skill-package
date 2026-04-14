---
name: react-performance
description: >
  Audits and optimizes React component code for performance and correctness.
  Covers stale closure traps, unnecessary re-renders, useEffect cleanup,
  state design, debounce/throttle for high-frequency events, and race conditions.
  This skill should be used when the user mentions React performance optimization,
  stale closures, useMemo, useCallback, avoiding re-renders, useEffect issues,
  or requests a React code quality review.
category: refactor
---

# React 性能优化与常见错误规范

## 核心能力

对 React 代码进行性能审查与错误预防，确保生成的代码符合 React 最佳实践，避免常见的运行时陷阱与性能瓶颈。适用于：AI 生成 React 组件代码时的输出规范、性能问题排查与优化、Hook 使用规范审查、复杂状态逻辑重构。

---

## 一、闭包陷阱（Stale Closure）

### 1.1 问题描述

React 函数组件中，事件处理函数、`useEffect`、`useCallback` 等闭包捕获的是**创建时**的变量快照，若依赖未正确声明，会读取到过期的旧值。

### 1.2 常见错误模式

> 📖 错误/正确代码对比见 [code-examples.md](references/code-examples.md#1-闭包陷阱stale-closure)

### 1.3 规范要求

- [ ] `useEffect` / `useCallback` / `useMemo` 的依赖数组必须完整声明所有外部变量。
- [ ] 状态更新若依赖当前值，**必须**使用函数式更新 `setState(prev => ...)`。
- [ ] 需要在闭包中访问最新值但不触发重渲染时，使用 `useRef` 保存。
- [ ] 启用 ESLint `react-hooks/exhaustive-deps` 规则，不得随意 `// eslint-disable`。

---

## 二、渲染性能优化

### 2.1 避免不必要的重渲染

> 📖 完整示例见 [code-examples.md](references/code-examples.md#21-避免不必要的重渲染)

### 2.2 规范要求

- [ ] 纯展示子组件必须用 `React.memo` 包裹，避免父组件无关状态变化导致重渲染。
- [ ] 传递给子组件的**对象**和**函数** props，必须用 `useMemo` / `useCallback` 包裹。
- [ ] `useMemo` 用于**计算开销大**的派生数据；`useCallback` 用于**传递给子组件**的回调函数。
- [ ] 不要滥用 `useMemo` / `useCallback`，简单值或不传递给子组件的函数无需包裹。

### 2.3 列表渲染

- [ ] 列表 `key` 必须使用**稳定且唯一**的业务标识（如 `id`），禁止使用数组 `index`（静态不变的列表除外）。

> 📖 示例见 [code-examples.md](references/code-examples.md#22-列表渲染)

---

## 三、useEffect 规范

### 3.1 副作用清理

> 📖 AbortController 完整示例见 [code-examples.md](references/code-examples.md#31-副作用清理--异步请求)

### 3.2 规范要求

- [ ] `useEffect` 中注册的**事件监听器、定时器、订阅**必须在返回的清理函数中注销。
- [ ] 发起异步请求必须处理组件卸载场景（AbortController 或 `isMounted` 标志位）。
- [ ] 避免在 `useEffect` 中直接 `async`，应在内部定义异步函数再调用。

> 📖 async useEffect 正确写法见 [code-examples.md](references/code-examples.md#32-async-useeffect-写法)

---

## 四、状态管理规范

### 4.1 状态设计原则

> 📖 派生数据 & 直接修改 state 示例见 [code-examples.md](references/code-examples.md#4-状态管理规范)

### 4.2 避免状态污染

### 4.3 规范要求

- [ ] **禁止**直接修改 state 对象或数组，必须返回新引用。
- [ ] 可由现有 state 派生的数据，不得单独存入 state。
- [ ] 多个相关联的 state 更新，考虑合并为一个对象或使用 `useReducer`。

---

## 五、高频事件处理

- [ ] 搜索输入、窗口 Resize、滚动监听等高频事件必须使用 `debounce`（防抖）或 `throttle`（节流）。
- [ ] `debounce` / `throttle` 函数实例必须用 `useMemo` 或 `useRef` 保持稳定，不得在渲染函数中直接创建。

> 📖 debounce 完整示例见 [code-examples.md](references/code-examples.md#5-高频事件处理)

---

## 六、竞态条件（Race Condition）

- [ ] 依赖外部参数的异步请求，必须处理竞态：组件卸载或参数变化时，忽略旧请求结果。

> 📖 cancelled 标志位完整示例见 [code-examples.md](references/code-examples.md#6-竞态条件race-condition)

---

## 执行流程

1. **闭包检查**：扫描所有 Hook 依赖数组，确认无遗漏依赖。
2. **渲染分析**：识别不必要的重渲染，补充 `memo` / `useMemo` / `useCallback`。
3. **副作用审查**：确认所有 `useEffect` 有对应清理逻辑。
4. **状态合理性**：检查是否存在冗余 state 或直接修改 state。
5. **高频事件**：确认防抖/节流已正确应用。

---

## 输出格式

请按以下 Markdown 格式输出检查报告：

```markdown
## React 性能与规范检查报告

### 1. 闭包陷阱检查

- 状态：✅ PASS / ⚠️ WARN / ❌ FAIL
- 问题：[文件名/行号]: [问题描述] -> [修复建议]

### 2. 渲染性能

- **不必要重渲染**：[组件名] -> [优化建议]
- **列表 key**：✅ PASS / ❌ FAIL

### 3. useEffect 副作用

- **清理函数**：✅ 已清理 / ❌ 缺少清理 -> [具体位置]
- **竞态处理**：✅ 已处理 / ❌ 存在风险

### 4. 状态管理

- **直接修改**：✅ PASS / ❌ FAIL -> [具体位置]
- **冗余 state**：[派生数据建议改为 useMemo]

### 5. 高频事件

- [事件名]: ✅ 已防抖 / ❌ 缺少防抖

### 总结

- 评分：🟢 优秀 / 🟡 良好 / 🔴 需改进
- [ ] 建议提交 / [ ] 需修改后提交
```
