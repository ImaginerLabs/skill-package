# Skill 增强与优化示例

本文档提供 Skill 增强与优化的完整示例，供参考。

---

## 示例 1：优化触发不准确的 Skill

### 问题诊断

**原始 Skill**：

```yaml
---
name: code-helper
description: "Helps with coding tasks"
---
```

**识别的问题**：

- ❌ description 过于简短（< 10 词）
- ❌ 未说明触发条件
- ❌ 关键词过于笼统
- ❌ 未区分于其他可能的 Skill

### 优化方案

**步骤 1：分析核心功能**

明确 Skill 实际能做什么：
- 编写代码（多种语言）
- 调试错误
- 重构代码
- 解释代码逻辑

**步骤 2：列举触发场景**

```
"帮我写一个 Python 函数"
"这个代码报错了帮我看看"
"怎么优化这段代码的性能"
"这段代码是什么意思"
"给我写个单元测试"
```

**步骤 3：优化 description**

```yaml
---
name: code-helper
description: >
  Assists with code writing, debugging, refactoring, and explanation across
  multiple programming languages. This skill should be used when the user
  mentions writing code, fixing bugs, improving code structure, explaining
  code logic, or asking for programming help.
---
```

**评估结果**：

| 指标     | 优化前 | 优化后 |
| -------- | ------ | ------ |
| 召回率   | 60%    | 92%    |
| 精确率   | 70%    | 88%    |
| 误触发率 | 25%    | 8%     |

---

## 示例 2：重构内容过长的 Skill

### 问题诊断

**原始 Skill 结构**：

```
old-skill/
├── SKILL.md  # 850 行 ❌ 超限
├── references/
│   ├── api.md
│   ├── schema.md
│   ├── examples.md
│   └── troubleshooting.md
└── scripts/
    └── process.py
```

**问题**：

- SKILL.md 超过 500 行限制
- 所有内容堆在主文件
- 引用分散，缺乏组织

### 优化方案

**步骤 1：内容分类**

| 内容类型           | 行数 | 移动位置            |
| ------------------ | ---- | ------------------- |
| 核心工作流程       | 120  | 保留在 SKILL.md     |
| 完整 API 文档      | 350  | references/api.md   |
| 数据库架构         | 200  | references/schema.md|
| 使用示例           | 150  | references/examples.md|
| 故障排除           | 180  | references/troubleshooting.md|

**步骤 2：重构 SKILL.md**

```markdown
---
name: old-skill
description: >
  Processes data files, validates input, and generates reports.
  This skill should be used when...
---

# 数据处理 Skill

## 何时使用

- 用户上传数据文件
- 用户要求数据验证
- 用户请求生成报告

## 工作流程

- [ ] 第 1 步：验证输入文件
- [ ] 第 2 步：处理数据
- [ ] 第 3 步：生成报告

## 详细文档

- API 参考：`references/api.md`
- 数据架构：`references/schema.md`
- 使用示例：`references/examples.md`
- 故障排除：`references/troubleshooting.md`

## 注意事项

- 文件大小限制：100MB
- 支持格式：CSV、JSON、XML
- 输出编码：UTF-8
```

**优化后的结构**：

```
optimized-skill/
├── SKILL.md  # 200 行 ✅
└── references/
    ├── api.md              # 350 行
    ├── schema.md           # 200 行
    ├── examples.md         # 150 行
    └── troubleshooting.md  # 180 行
```

---

## 示例 3：补充缺失的资源

### 问题诊断

**现状**：

```
incomplete-skill/
├── SKILL.md  # 300 行
└── (无 scripts/ 目录)
```

**问题**：

- 核心逻辑都在 SKILL.md 中
- 每次执行都重复相同的代码生成
- 没有可复用的脚本

### 优化方案

**步骤 1：识别可复用逻辑**

在工作流程中找到重复出现的代码模式：
- 数据验证逻辑（出现 3 次）
- 格式转换逻辑（出现 2 次）
- 错误处理逻辑（出现 4 次）

**步骤 2：提取为脚本**

```python
#!/usr/bin/env python3
"""
数据验证脚本

使用方法：
    python scripts/validate_data.py <input_file>

返回：验证结果（成功/失败 + 错误列表）
"""
import sys
import json

def validate_data(file_path):
    # 实现验证逻辑
    pass

if __name__ == "__main__":
    print(json.dumps(validate_data(sys.argv[1])))
```

**步骤 3：更新 SKILL.md**

```markdown
## 工作流程

- [ ] 第 1 步：使用验证脚本检查输入
  ```bash
  python scripts/validate_data.py <input_file>
  ```
- [ ] 第 2 步：执行核心处理
- [ ] 第 3 步：生成输出报告

## 可用脚本

- `scripts/validate_data.py`：数据验证
- `scripts/transform.py`：格式转换
- `scripts/error_handler.py`：错误处理
```

**优化后结构**：

```
improved-skill/
├── SKILL.md
├── scripts/
│   ├── validate_data.py
│   ├── transform.py
│   └── error_handler.py
└── references/
    └── usage.md
```

---

## 示例 4：改进工作流程设计

### 问题诊断

**原始工作流程**：

```markdown
## 工作流程

首先读取文件，然后处理数据，接着生成报告，最后发送给用户。如果遇到错误，请尝试重新处理。如果还是不行，请告诉用户。
```

**问题**：

- 缺少明确的步骤编号
- 错误处理不清晰
- 缺乏验证机制
- 退出条件不明确

### 优化方案

**清单式工作流**：

```markdown
## 工作流程

- [ ] 第 1 步：读取并验证输入文件
  - 检查文件是否存在
  - 验证文件格式
  - 检查文件大小限制（≤100MB）

- [ ] 第 2 步：处理数据
  - 执行核心转换逻辑
  - 记录处理日志

- [ ] 第 3 步：生成输出报告
  - 验证输出完整性
  - 保存到指定目录

- [ ] 第 4 步：反馈结果给用户
  - 成功：展示输出路径和摘要
  - 失败：说明原因并提供解决方案
```

**反馈循环**：

```
第 3 步验证失败 → 返回第 2 步重试（最多 3 次）→ 仍失败则报告错误
```

---

## 常见问题

### Q1: 何时应该拆分 SKILL.md？

当 SKILL.md 接近或超过 500 行时，考虑拆分：
- 核心工作流程保留在 SKILL.md
- 详细文档移到 references/
- 示例代码移到 references/
- API 规格移到 references/

### Q2: 如何判断优化是否有效？

**定量指标**：
- SKILL.md 行数（目标：≤500）
- 触发准确率（目标：≥85%）
- 执行时间（目标：减少 ≥20%）

**定性反馈**：
- 用户是否更容易触发 Skill
- 执行结果是否更符合预期
- 是否减少了调试次数

### Q3: description 应该用中文还是英文？

**推荐使用英文**：
- Claude 的 available_skills 列表是英文环境
- 英文更容易被准确匹配
- 便于跨语言项目使用

**例外情况**：
- 面向纯中文用户的 Skill
- 项目本身是中文环境

### Q4: 如何处理多个相似 Skill 的区分？

在 description 中明确区分：
- 列出本 Skill 独有的功能
- 说明与相似 Skill 的区别
- 添加区分性关键词
