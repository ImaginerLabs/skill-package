# 反模式指南：Skill 创建中的常见错误

本文档列出创建 Claude Skill 时的常见反模式，每类提供 ❌ 错误示例与 ✅ 正确示例对比。

---

## 反模式 1：Windows 风格路径

在 SKILL.md 中使用反斜杠路径会导致跨平台兼容性问题。

❌ **错误**：

```markdown
运行脚本：`scripts\analyze_data.py`
输出目录：`assets\templates\report.html`
```

✅ **正确**（始终使用正斜杠，即使在 Windows 环境）：

```markdown
运行脚本：`scripts/analyze_data.py`
输出目录：`assets/templates/report.html`
```

---

## 反模式 2：提供过多等价选项

罗列多种等价方案会让 Claude 陷入选择困难，降低执行效率。

❌ **错误**：

```markdown
## 数据加载方式

可以使用以下任意一种方式：
- 方式 A：使用 pandas.read_csv()
- 方式 B：使用 csv 模块手动解析
- 方式 C：使用 polars 库
- 方式 D：使用 dask 处理大文件
```

✅ **正确**（提供一个默认方案，附带逃生舱口）：

```markdown
## 数据加载

默认使用 `pandas.read_csv()` 加载数据。

如果文件超过 1GB，改用 `dask`：
```python
import dask.dataframe as dd
df = dd.read_csv('large_file.csv')
```
```

---

## 反模式 3：时间敏感信息

在 SKILL.md 中写入具体日期、版本号或"最新"等表述，会导致文档快速过时。

❌ **错误**：

```markdown
## 技术要求

- Python 版本：3.11.12（截至 2024 年 3 月最新版）
- pandas 最新版本为 2.2.1，建议升级
- 注意：2024 年 Q2 API 将有重大变更
```

✅ **正确**（描述能力而非具体版本）：

```markdown
## 技术要求

- Python 3.11+
- pandas（预装，支持 CSV/Excel 读写）
- 如需确认当前版本：`python -c "import pandas; print(pandas.__version__)"`
```

---

## 反模式 4：术语不一致

在同一文档中混用不同术语描述同一概念，会让 Claude 产生歧义。

❌ **错误**：

```markdown
## 概述
此 Skill 用于处理**用户文件**。

## 工作流程
1. 加载**输入文档**
2. 分析**上传的资料**
3. 处理**客户提供的文件**
```

✅ **正确**（全文统一使用同一术语）：

```markdown
## 概述
此 Skill 用于处理**用户文件**。

## 工作流程
1. 加载**用户文件**
2. 分析**用户文件**内容
3. 处理**用户文件**中的数据
```

---

## 反模式 5：description 使用第二人称

description 是 Claude 从 100+ 个 Skill 中进行匹配的依据，第二人称会降低匹配准确性。

❌ **错误**：

```yaml
description: "Use this skill when you need to analyze data files."
description: "帮你处理 PDF 文件的工具。"
```

✅ **正确**（第三人称 + 功能描述 + 触发条件）：

```yaml
description: >
  Analyzes CSV and Excel data files, calculates statistics and generates
  visualizations. This skill should be used when the user mentions data
  analysis, uploads data files, or requests statistical calculations.
```

---

## 反模式 6：深层嵌套引用

在 references/ 文件中再引用其他 references/ 文件，会导致 Claude 无法完整读取。

❌ **错误**（SKILL.md → references/guide.md → references/details/advanced.md）：

```markdown
<!-- references/guide.md -->
详细说明见 [高级用法](details/advanced.md)
```

✅ **正确**（所有引用均从 SKILL.md 一级链接）：

```markdown
<!-- SKILL.md -->
- 基础指南：[`references/guide.md`](references/guide.md)
- 高级用法：[`references/advanced.md`](references/advanced.md)
```
