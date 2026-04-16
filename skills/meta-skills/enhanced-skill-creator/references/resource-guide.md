# 资源文件编写规范

本文档提供 `scripts/`、`references/`、`assets/` 三类资源文件的详细编写规范与示例。

---

## Scripts（scripts/）

### 何时使用

- 相同代码会被重复编写
- 需要确定性可靠性
- 复杂的数据处理逻辑

### 优势

- Token 高效（执行时不加载到上下文）
- 确定性执行
- 可维护性强

### 标准脚本结构

```python
#!/usr/bin/env python3
"""
脚本用途的简短描述

使用方法：
    python scripts/script_name.py <arg1> <arg2>

参数：
    arg1: 参数说明
    arg2: 参数说明

示例：
    python scripts/analyze.py data.csv output.json
"""

import sys
import argparse

def main():
    parser = argparse.ArgumentParser(description='脚本描述')
    parser.add_argument('input', help='输入文件')
    parser.add_argument('output', help='输出文件')
    args = parser.parse_args()
    process(args.input, args.output)

if __name__ == "__main__":
    main()
```

**要点**：
- 包含清晰的 docstring 和使用示例
- 参数验证和错误处理
- 每个脚本可以独立运行（不依赖其他脚本）
- 返回有意义的错误消息

### 示例：PDF 旋转脚本

```python
# scripts/rotate_pdf.py
#!/usr/bin/env python3
"""
旋转 PDF 文件

使用方法：
    python scripts/rotate_pdf.py <input.pdf> <output.pdf> <angle>

参数：
    angle: 旋转角度 (90, 180, 270)
"""
import sys
from PyPDF2 import PdfReader, PdfWriter

def rotate_pdf(input_path, output_path, angle):
    reader = PdfReader(input_path)
    writer = PdfWriter()
    for page in reader.pages:
        page.rotate(angle)
        writer.add_page(page)
    with open(output_path, 'wb') as f:
        writer.write(f)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)
    rotate_pdf(sys.argv[1], sys.argv[2], int(sys.argv[3]))
```

---

## References（references/）

### 何时使用

- 数据库架构文档
- API 规格说明
- 公司政策或领域知识
- 详细的工作流程指南（>50 行）

### 优势

- 保持 SKILL.md 精简
- 按需加载（只在 Claude 判断需要时加载）
- 适合大量文档（>10k 字）

### 大文件最佳实践

对于超过 10k 字的文件，在 SKILL.md 中提供 grep 搜索模式：

```markdown
## 参考文档

完整的数据库架构定义在 `references/database_schema.md` 中。

**快速查找**：
- 查找特定表：`grep "^## Table:" references/database_schema.md`
- 查找关系：`grep "Foreign Key" references/database_schema.md`
```

### 避免重复

❌ 不要在 SKILL.md 和 references/ 中重复相同信息  
✅ 核心流程在 SKILL.md，详细参考在 references/

---

## Assets（assets/）

### 何时使用

- 模板文件（HTML、Word、Excel）
- 品牌资源（logo、图标）
- 样板代码
- 字体文件

### 优势

- 不加载到上下文
- 直接用于输出
- 支持二进制文件

### 命名规范

```
assets/
├── templates/
│   ├── email-welcome-v1.html       # 描述性名称 + 版本号
│   └── report-monthly-v2.html
├── images/
│   ├── logo-primary.png
│   └── icon-16x16.png
└── boilerplate/
    └── react-app/
        ├── src/
        └── package.json
```

---

## 预装 Python 包清单

**数据科学**：pandas, numpy, scipy, scikit-learn, statsmodels

**可视化**：matplotlib, seaborn

**文件处理**：pyarrow, openpyxl, xlsxwriter, xlrd, pillow, python-pptx, python-docx, pypdf, pdfplumber, pypdfium2, pdf2image, pdfkit, tabula-py, reportlab, Img2pdf

**数学计算**：sympy, mpmath

**工具**：tqdm, python-dateutil, pytz, joblib

**系统工具**：unzip, unrar, 7zip, bc, rg (ripgrep), fd, sqlite

---

## 容器运行环境规格

| 项目       | 规格                    |
| ---------- | ----------------------- |
| Python     | 3.11+                   |
| 操作系统   | Linux (x86_64)          |
| 内存       | 5GiB RAM                |
| 磁盘       | 5GiB                    |
| CPU        | 1 CPU                   |
| 网络       | 无网络访问（API 环境）  |
| 过期时间   | 创建后 30 天            |
