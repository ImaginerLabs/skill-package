---
type: prd-amendment
epic: NAV-FIX
version: 1.0
date: 2026-04-13
status: ready-for-architecture
author: John (PM) — via Party Mode 圆桌讨论
participants:
  - John (PM)
  - Sally (UX Designer)
  - Winston (Architect)
source: Chrome MCP 走查 + Party Mode 多智能体讨论
priority: P1
---

# PRD 增补 — Skill 库导航与分类筛选交互修复

## Executive Summary

通过 Chrome MCP 实地走查发现，Skill Manager 存在一个**重大交互缺陷**：用户在选中某个分类后，点击左侧导航的"Skill 库"完全无响应，导致用户被"困"在分类筛选视图中，无法通过直觉操作回到全部视图。

本文档基于 Party Mode 圆桌讨论（John × Sally × Winston）的共识，给出正式的 PRD 需求、UX 设计规范和架构决策，供 Architect（Winston）组织实现。

---

## 问题描述

### 复现路径

1. 打开 Skill Manager，进入 Skill 库页面（`/`）
2. 点击左侧分类列表中的任意分类（如"编程开发"）
3. 分类高亮，内容区按分类筛选
4. 点击左侧导航的"Skill 库"
5. **❌ 无任何响应** — 页面无变化，分类筛选状态未清除

### 根因分析

```
问题根因：状态归属错误 + 路由机制限制

1. selectedCategory 存储在全局 Zustand store 中（应为页面级状态）
2. "Skill 库" NavLink to="/" 在已处于 / 路由时不触发任何事件
3. 没有机制在点击"Skill 库"时清除 selectedCategory
4. 结果：用户无法通过"Skill 库"导航重置筛选状态
```

### 用户影响

| 维度         | 描述                                       |
| ------------ | ------------------------------------------ |
| **严重程度** | P1 — 高优先级                              |
| **影响范围** | 所有使用过分类筛选的用户（主流程）         |
| **用户感知** | "系统卡了？" → "这是 Bug？" → 信任损耗     |
| **逃生路径** | 仅有"全部"分类按钮（不直觉，用户难以发现） |

---

## 用户故事

### Story NAV-01：Skill 库导航重置分类筛选

```
作为 Skill Manager 用户，
当我正在浏览某个分类（如"编程开发"）时，
我希望点击左侧导航的"Skill 库"能清除当前分类筛选、回到全部 Skill 列表，
以便我可以在不刷新页面的情况下重置浏览状态，符合我对"首页导航 = 回到起点"的直觉预期。
```

### 验收标准（Acceptance Criteria）

| #    | Given                      | When                         | Then                                                       |
| ---- | -------------------------- | ---------------------------- | ---------------------------------------------------------- |
| AC-1 | 用户已选中任意分类         | 点击"Skill 库"导航项         | `selectedCategory` 被清空，列表显示全部 Skill              |
| AC-2 | 用户未选分类（全部视图）   | 点击"Skill 库"导航项         | 保持全部视图，无副作用（幂等性）                           |
| AC-3 | 用户在其他路由（如设置页） | 点击"Skill 库"导航项         | 跳转 `/` 并显示全部 Skill（原有行为保留）                  |
| AC-4 | 用户已选中某分类           | 点击"Skill 库"后             | 分类列表中无任何分类项处于高亮/激活状态                    |
| AC-5 | 用户已选中某分类           | 查看"Skill 库"导航项视觉状态 | "Skill 库"显示为"父级弱激活态"（区别于无筛选时的强激活态） |

---

## UX 设计规范

> 来源：Sally（UX Designer）圆桌发言

### 推荐方案：方案 A — "Skill 库"作为清除筛选的重置按钮

**核心交互逻辑：**

```
点击"Skill 库"（无筛选时）→ 已激活，无操作（幂等）
点击"Skill 库"（有筛选时）→ 清除 selectedCategory，回到全部视图
```

**视觉状态规范：**

| 场景                         | "Skill 库"导航项                                                         | 分类项                                       |
| ---------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| 默认状态（无筛选）           | ✅ **强激活**（filled/accent色，左侧 2px 绿线）                          | 无高亮                                       |
| 选中某分类后                 | ⚠️ **弱激活**（父级态：无左侧绿线，保留 accent 背景色，cursor: pointer） | ✅ **强激活**（左侧 2px 绿线 + accent 背景） |
| hover "Skill 库"（有筛选时） | 🖱️ 显示 tooltip："点击返回全部 Skill"                                    | —                                            |

**设计原则：**

- **禁止同时出现两个相同权重的激活状态** — 父级用"包裹态"，子级用"填充态"
- "Skill 库"在有分类筛选时，视觉上应传达"可点击、会有效果"的信号

### 备选方案（供未来迭代参考）

| 方案   | 描述                                 | 适用场景                   |
| ------ | ------------------------------------ | -------------------------- |
| 方案 B | 分类树改为主内容区 Filter Chips      | 分类数量多、需要多选筛选时 |
| 方案 C | 分类树作为"Skill 库"的子级 Accordion | 需要强化层级语义时         |

---

## 架构决策

> 来源：Winston（Architect）圆桌发言

### 当前 Sprint 实现方案（方案 C — 自定义导航处理）

**变更范围：仅 `src/components/layout/Sidebar.tsx`**

**核心改动：**

- 将"Skill 库"的 `NavLink` 替换为自定义 `button`（或带 `onClick` 的包装组件）
- `onClick` 时：执行 `setCategory(null)` + 条件性 `navigate("/")`
- 激活样式通过 `location.pathname === '/'` 手动计算，并区分"有筛选"和"无筛选"两种激活态

**伪代码：**

```tsx
const handleSkillLibraryClick = () => {
  setCategory(null); // 始终清除分类筛选
  if (location.pathname !== "/") {
    navigate("/");
  }
};

// 激活样式：区分父级态和强激活态
const isActive = location.pathname === "/";
const hasFilter = selectedCategory !== null;
const className = isActive
  ? hasFilter
    ? "nav-parent-active" // 弱激活（有筛选时）
    : "nav-active" // 强激活（无筛选时）
  : "nav-default";
```

### 技术债记录（下一 Epic 评估）

| 技术债     | 描述                                                                 | 优先级 |
| ---------- | -------------------------------------------------------------------- | ------ |
| URL 参数化 | 将 `selectedCategory` 迁移到 URL query params（`/?category=coding`） | P2     |
| Store 瘦身 | 将页面级瞬态 UI 状态从全局 store 移除，下沉到页面级 `useState`       | P2     |

**URL 参数化的价值：** 支持分享筛选链接、浏览器前进后退、收藏特定分类视图。

---

## 实现范围

### 文件变更清单

| 文件                                | 变更类型 | 变更描述                                                           |
| ----------------------------------- | -------- | ------------------------------------------------------------------ |
| `src/components/layout/Sidebar.tsx` | 修改     | 将"Skill 库" NavLink 改为自定义导航处理，添加 onClick 清除分类逻辑 |
| `src/components/layout/Sidebar.tsx` | 修改     | 添加"父级弱激活态"CSS 类，区分有筛选/无筛选时的视觉状态            |

### 不在本次范围内

- 分类数量统计修复（已在 Epic 6 Story 6-1 中处理）
- URL 参数化重构（技术债，下一 Epic 评估）
- 分类树布局重构（备选方案 B/C，未来迭代）

---

## 成功标准

| 指标                   | 当前状态                  | 目标状态                    |
| ---------------------- | ------------------------- | --------------------------- |
| 点击"Skill 库"清除筛选 | ❌ 无响应                 | ✅ 100% 有效                |
| 视觉状态一致性         | ❌ 双重强激活             | ✅ 父级弱激活 + 子级强激活  |
| 用户逃生路径           | ⚠️ 仅"全部"按钮（不直觉） | ✅ "Skill 库"导航项（直觉） |

---

## 依赖关系

- **无外部依赖** — 本 Story 可独立实现，不依赖其他 Epic 或 Story
- **建议优先级：** 在当前 Sprint 中优先处理，阻塞核心浏览流程

---

## 交付给 Architect

Winston，以下是需要你组织的下一步：

1. **确认实现方案** — 方案 C（自定义导航处理）是否符合现有架构约束？
2. **创建实现 Story** — 调用 `bmad-create-story` 生成可供 Dev Agent 执行的 Story 文件
3. **评估技术债** — URL 参数化方案是否纳入下一 Epic 的技术债清单？

---

_文档生成时间：2026-04-13_
_来源：Party Mode 圆桌讨论（John × Sally × Winston）_
_走查方式：Chrome DevTools MCP 实测_
_状态：ready-for-architecture_
