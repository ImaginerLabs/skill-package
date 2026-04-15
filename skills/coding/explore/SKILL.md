---
name: explore
description: >
  Analyzes codebases, explores project structure, identifies issues, and provides contextual insights.
  This skill should be used when the user mentions code exploration, project analysis, bug investigation,
  context research, or needs help understanding unfamiliar codebases.
category: coding
---

# Code Exploration & Analysis Skill

## 概述

本Skill专注于代码库探索、问题分析和上下文研究。根据用户需求提供针对性的代码分析服务，包括项目结构分析、问题诊断、bug修复建议和上下文理解。

## 核心能力

- 🔍 **代码库探索**：分析项目结构、技术栈、依赖关系
- 🐛 **问题诊断**：识别代码问题、性能瓶颈、潜在bug
- 📚 **上下文研究**：梳理代码逻辑、调用链、模块职责
- 💡 **解决方案**：提供修复建议、优化方案、最佳实践
- 📊 **分析报告**：生成结构化分析结果和结论

## 工作流程

### 1. 需求分析阶段

- [ ] 理解用户的具体问题和需求场景
- [ ] 确定分析范围和目标
- [ ] 收集项目上下文信息

### 2. 代码探索阶段

- [ ] 分析项目目录结构和文件组织
- [ ] 识别技术栈和框架使用情况
- [ ] 梳理核心模块和关键文件

### 3. 问题分析阶段

- [ ] 深入阅读相关代码文件
- [ ] 分析代码逻辑和业务逻辑
- [ ] 识别潜在问题和改进点

### 4. 结论生成阶段

- [ ] 根据分析结果形成结论
- [ ] 提供具体建议和解决方案
- [ ] 输出结构化分析报告

## 使用场景

### 场景1：不确定问题咨询

当用户对代码行为或项目结构有疑问时：

- 分析相关代码逻辑
- 提供明确的结论和解释
- 给出使用建议或最佳实践

### 场景2：Bug调查与修复

当用户遇到代码问题或bug时：

- 定位问题根源
- 分析错误原因
- 提供修复方案和建议

### 场景3：上下文理解

当用户需要理解陌生代码库时：

- 梳理项目架构
- 分析模块职责
- 解释关键业务逻辑

## 工具使用指南

### 代码探索工具

- `codebase_search`: 语义搜索代码功能
- `grep_search`: 精确文本搜索
- `list_dir`: 目录结构分析
- `read_file`: 文件内容读取

### 分析工具

- `view_code_item`: 查看特定代码定义
- `terminal`: 执行系统命令验证
- `web_search`: 搜索技术文档参考

## 输出格式规范

分析报告应包含：

1. **问题概述**：简要描述分析目标
2. **分析过程**：使用的工具和方法
3. **发现结果**：具体的代码分析发现
4. **结论建议**：明确的结论和 actionable 建议
5. **相关文件**：涉及的关键文件链接

## 质量保证

- ✅ 所有结论必须有代码证据支持
- ✅ 建议必须具体可行
- ✅ 分析过程透明可复现
- ✅ 尊重原有代码风格和架构

## 参考资源

如需深入了解代码分析技术，参考 `references/code-analysis-guide.md`
如需查看常见问题模式，参考 `references/common-issues.md`
