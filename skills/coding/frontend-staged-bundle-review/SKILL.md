---
name: frontend-staged-bundle-review
description: 当用户说「检查暂存区体积」「分析包体积」「bundle 优化」「体积审查」「检查体积」「包大小分析」「体积回归」「打包优化」「减少体积」「瘦身」时触发。读取 git diff --staged，结合上下文分析需求改造意图，从代码体积（Bundle Size）角度给出高/中/低三级优化建议，适用于 React/Vue/Taro/Next.js 等前端项目。
category: review
---

# 前端暂存区代码体积优化审查

## 核心能力

在提交前读取暂存区变更，结合项目上下文分析需求改造意图，从**代码体积（Bundle Size）**角度进行专项审查，输出高/中/低三个优先级的优化建议。

## 适用场景

- 功能迭代后担心包体积增大
- 引入新依赖前的预评估
- 重构/需求改造后的体积回归检查
- 性能优化专项检查
- 小程序主包体积超限预警
- 首屏加载性能优化
- Taro 小程序、H5、React/Vue Web 项目、Next.js SSR 项目

## 技能协作

本技能可与其他技能配合使用，形成完整的代码质量保障流程：

| 协作技能                 | 协作方式                                 | 使用场景       |
| ------------------------ | ---------------------------------------- | -------------- |
| **staged-code-review**   | 先进行代码质量审查，再进行体积审查       | 提交前全面检查 |
| **frontend-code-review** | 配合使用，同时关注代码质量和体积         | 综合代码审查   |
| **tech-stack-detection** | 先识别技术栈，再针对性地进行体积分析     | 新项目体积审查 |
| **context-learning**     | 当体积问题涉及复杂依赖链时，先理解上下文 | 复杂重构场景   |

**推荐工作流：**

```
git add . → staged-code-review → frontend-staged-bundle-review → staged-fast-commit
```

---

## 执行流程

### Step 1：读取暂存区 Diff

```bash
git diff --staged
```

获取所有已暂存文件的变更内容。

### Step 2：分析需求改造意图

通过以下方式理解本次变更的业务背景：

- 读取 diff 中的注释、变量命名、函数名，推断功能意图。
- 检查是否有新增的 `import` 语句，识别引入的依赖。
- 结合项目已有代码（如 `package.json`、公共工具库）判断是否存在重复引入。
- 识别本次变更的性质：新功能开发 / Bug 修复 / 重构优化 / 依赖升级。

### Step 3：体积影响分析

从以下维度逐一评估变更对最终产物体积的影响：

#### 3.1 依赖引入

- 新增 `import` 是否引入了体积较大的第三方库？
- 是否使用了**按需引入**（Tree-shaking 友好）？
- 是否可以用项目已有的工具函数/组件替代？
- 是否引入了功能重复的库（如同时引入 moment 和 dayjs）？

#### 3.2 代码冗余

- 是否存在重复逻辑，可以抽取为公共函数？
- 是否有大段复制粘贴的代码块？
- 是否有已废弃但未删除的代码（dead code）？
- 是否有调试代码（console.log、debugger）未清理？

#### 3.3 资源与静态文件

- 是否内联了 Base64 图片或大段 SVG？
- 是否硬编码了大型 JSON 数据，可改为接口动态获取？
- 字体、图标是否按需加载？
- 图片是否使用了合适的格式（WebP/AVIF）和压缩？

#### 3.4 动态加载机会

- 新增的页面/模块是否适合做**路由懒加载**（`React.lazy` / 动态 `import()`）？
- 低频使用的重型组件是否可以延迟加载？
- 大型第三方库是否可以动态导入（如 ECharts、Monaco Editor）？
- Next.js 项目是否使用了 `dynamic import` 优化首屏？

#### 3.5 Taro/小程序专项

- 是否引入了仅 H5 可用的 Web API polyfill？
- 分包策略是否合理，新增页面是否放入了正确的分包？
- 是否使用了 `@tarojs/components` 以外的重型 UI 库全量引入？
- 主包体积是否接近限制（2MB）？

#### 3.6 Next.js/SSR 专项

- 是否使用了 `next/dynamic` 进行组件懒加载？
- 是否合理设置了 `ssr: false` 跳过不需要 SSR 的组件？
- 是否使用了 `next/image` 优化图片加载？
- 是否存在仅在客户端使用的库被打入服务端 bundle？

### Step 4：生成分级建议

按以下标准对每条建议分级：

| 等级      | 标准                                                           | 典型场景                                       |
| --------- | -------------------------------------------------------------- | ---------------------------------------------- |
| 🔴 **高** | 体积影响显著（预估 > 10KB gzip），或引入了可完全避免的大型依赖 | 全量引入 lodash、moment.js；内联大图           |
| 🟡 **中** | 体积影响中等（预估 2~10KB gzip），或存在明确的优化路径         | 未按需引入 UI 组件库；可懒加载的新页面未做分包 |
| 🟢 **低** | 体积影响较小（预估 < 2KB gzip），属于最佳实践层面的改进        | 小函数可用原生替代；可提取的重复工具函数       |

### Step 5：输出优化报告

按照标准格式输出审查报告，包含变更概览、分级建议和总结。

---

## 输出格式

```markdown
## 📦 暂存区代码体积优化审查报告

### 变更概览

| 维度     | 信息                               |
| -------- | ---------------------------------- |
| 文件数   | X 个                               |
| 技术栈   | [识别结果]                         |
| 变更类型 | 新功能 / Bug修复 / 重构 / 依赖升级 |
| 需求意图 | [根据 diff 推断的功能描述]         |

---

### 🔴 高优先级建议（体积影响显著，建议提交前处理）

| #   | 文件          | 问题描述 | 优化建议 | 预估收益 | 影响范围  |
| --- | ------------- | -------- | -------- | -------- | --------- |
| 1   | `src/xxx.tsx` | [问题]   | [建议]   | ~XX KB   | 首屏/分包 |

**详细说明：**

- [问题详细分析和优化方案]

---

### 🟡 中优先级建议（有明确优化路径，可在本次或下次迭代处理）

| #   | 文件          | 问题描述 | 优化建议 | 预估收益 | 影响范围 |
| --- | ------------- | -------- | -------- | -------- | -------- |
| 1   | `src/xxx.tsx` | [问题]   | [建议]   | ~XX KB   | 非首屏   |

**详细说明：**

- [问题详细分析和优化方案]

---

### 🟢 低优先级建议（最佳实践，可按需处理）

| #   | 文件          | 问题描述 | 优化建议 | 预估收益 |
| --- | ------------- | -------- | -------- | -------- |
| 1   | `src/xxx.tsx` | [问题]   | [建议]   | ~XX KB   |

---

### 📊 体积影响预估

| 类别     | 当前影响  | 优化后    | 节省      |
| -------- | --------- | --------- | --------- |
| 高优先级 | XX KB     | XX KB     | XX KB     |
| 中优先级 | XX KB     | XX KB     | XX KB     |
| 低优先级 | XX KB     | XX KB     | XX KB     |
| **合计** | **XX KB** | **XX KB** | **XX KB** |

---

### 📝 总结

- 高优先级：X 条（建议提交前处理）
- 中优先级：X 条（可在后续迭代处理）
- 低优先级：X 条（最佳实践改进）
- **整体评估**：🟢 体积友好 / 🟡 存在优化空间 / 🔴 建议处理后再提交

---

### 🔄 后续建议

- [ ] 立即修复高优先级问题
- [ ] 在下次迭代处理中优先级问题
- [ ] 持续关注包体积变化
- [ ] 建议配置打包体积监控（如 bundlesize、webpack-bundle-analyzer）
```

---

## 常见优化参考

### ❌ 全量引入 → ✅ 按需引入

```typescript
// ❌ 全量引入，打包体积大
import _ from "lodash";
import moment from "moment";

// ✅ 按需引入
import debounce from "lodash/debounce";
import dayjs from "dayjs"; // 替代 moment，体积更小
```

### ❌ 同步加载重型页面 → ✅ 路由懒加载

```typescript
// ❌ 同步引入，增大首屏包体积
import HeavyPage from "@/pages/heavy";

// ✅ 动态引入，按需加载
const HeavyPage = React.lazy(() => import("@/pages/heavy"));
```

### ❌ 内联大型静态数据 → ✅ 接口动态获取

```typescript
// ❌ 硬编码大型 JSON，打入 bundle
const CITY_LIST = [
  /* 500+ 条数据 */
];

// ✅ 改为接口获取，减少 bundle 体积
const [cityList, setCityList] = useState([]);
useEffect(() => {
  fetchCityList().then(setCityList);
}, []);
```

### ❌ 重复工具函数 → ✅ 复用公共模块

```typescript
// ❌ 各文件各自实现格式化函数
const formatPrice = (price: number) => `¥${(price / 100).toFixed(2)}`;

// ✅ 统一使用项目公共工具
import { formatPrice } from "@/utils/format";
```

### ❌ Next.js 未优化组件 → ✅ 使用 dynamic import

```typescript
// ❌ 同步引入重型组件
import HeavyChart from "@/components/HeavyChart";

// ✅ 使用 next/dynamic 懒加载
import dynamic from "next/dynamic";

const HeavyChart = dynamic(
  () => import("@/components/HeavyChart"),
  { ssr: false, loading: () => <Loading /> }
);
```

### ❌ Taro 小程序主包过载 → ✅ 分包加载

```typescript
// ❌ 所有页面都在主包
// app.config.ts
export default defineAppConfig({
  pages: [
    "pages/index/index",
    "pages/heavy/index", // 重型页面
    "pages/feature/index", // 独立功能
  ],
});

// ✅ 使用分包
export default defineAppConfig({
  pages: ["pages/index/index"],
  subPackages: [
    {
      root: "packageHeavy",
      pages: ["pages/index/index"],
    },
    {
      root: "packageFeature",
      pages: ["pages/index/index"],
    },
  ],
});
```

---

## 快速检测清单

在审查时，可按此清单快速排查：

### 依赖引入检测

- [ ] 新增的 npm 包是否必要？
- [ ] 是否可以按需引入？
- [ ] 是否有更轻量的替代方案？
- [ ] 是否与现有依赖功能重复？

### 资源文件检测

- [ ] 图片是否已压缩优化？
- [ ] 是否使用了合适的图片格式？
- [ ] 大型静态数据是否可改为接口获取？
- [ ] 字体文件是否按需加载？

### 代码优化检测

- [ ] 是否存在重复代码可提取？
- [ ] 是否有未清理的调试代码？
- [ ] 是否有废弃代码未删除？
- [ ] 新增页面是否需要懒加载？

### 平台专项检测

- [ ] Taro：分包策略是否合理？
- [ ] Next.js：dynamic import 是否使用？
- [ ] 小程序：主包是否接近限制？

---

## 注意事项

1. **优先级判断**：体积影响只是参考，还需考虑实际使用场景和优化成本
2. **渐进优化**：不建议一次性引入过多优化，可根据优先级逐步处理
3. **权衡取舍**：某些优化可能影响开发体验或代码可读性，需权衡
4. **持续监控**：建议配置 CI 自动检测包体积变化，避免体积回归
5. **实测验证**：优化后建议实测打包体积，验证优化效果
