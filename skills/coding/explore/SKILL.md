---
name: explore
description: >-
  Explores unfamiliar codebases, diagnoses problems, and provides contextual insights. Analyzes project
  structure, traces code logic, identifies issues, and generates actionable recommendations.
  Should be used when the user needs to explore or investigate a codebase — understanding project
  structure, diagnosing bugs, tracing feature implementation, or assessing code quality.
  Distinguished from context-learning which focuses on tracing specific code references, this skill
  focuses on project-wide exploration and diagnosis.
category: coding
boundary:
  vs_context-learning: "context-learning focuses on tracing specific code references within files, this skill focuses on project-wide exploration and diagnosis"
---

# Code Exploration & Analysis

## Core Capabilities

- **Codebase exploration** — Analyze project structure, tech stack, dependency relationships
- **Problem diagnosis** — Identify code issues, performance bottlenecks, potential bugs
- **Context research** — Map code logic, call chains, module responsibilities
- **Solution recommendations** — Provide fix suggestions, optimization approaches, best practices

## When to Use

- Exploring an unfamiliar codebase or project
- Investigating a bug or unexpected behavior
- Understanding how a feature is implemented
- Assessing code quality or architectural health

## When NOT to Use

- Simple, single-file reads — just read the file directly
- When you already know exactly which function to look at — use a targeted search instead
- When you need a structured context analysis report — use `context-learning` instead

---

## Workflow

### Phase 1: Scope the Exploration

Before diving in, clarify:

1. **What's the question?** — A specific bug? Architecture overview? Feature tracing?
2. **What's the scope?** — A single file, a module, or the whole project?
3. **What's the context?** — What does the user already know?

If the user's request is vague, ask one clarifying question rather than exploring blindly.

### Phase 2: Structural Scan

Get the lay of the land before reading code in depth:

- **Directory structure** — List directories to understand project organization
- **Tech stack** — Check `package.json`, config files for frameworks and tools
- **Key files** — Identify entry points, route definitions, state management setup

The goal is to form a mental map: _where are things, and what are the main modules?_

### Phase 3: Targeted Deep Dive

Based on Phase 2, narrow down and read the relevant files:

- Use **semantic search** for queries like "where is user authentication handled?"
- Use **text search** for precise lookups (function names, variable definitions)
- Use **file reading** for reading specific files in detail

For each file you read, extract:

- What it does (purpose)
- What it depends on (imports)
- What depends on it (who calls it)

### Phase 4: Synthesize & Report

Form conclusions from the evidence:

1. **Answer the original question** directly
2. **Provide evidence** — cite specific files and line numbers
3. **Give actionable recommendations** — not just "this is bad" but "here's how to fix it"

---

## Output Format

Reports should include:

1. **Problem statement** — Brief description of what was explored and why
2. **Findings** — What was discovered, with file references and line numbers
3. **Conclusions** — Clear, direct answers to the original question
4. **Recommendations** — Specific, actionable next steps

Keep reports concise. Don't paste large code blocks — summarize key points and reference file paths.

---

## Quality Standards

- All conclusions must be backed by code evidence
- Recommendations must be specific and actionable
- Analysis must be transparent and reproducible
- Respect existing code style and architecture

---

## Reference Files

- [code-analysis-guide.md](references/code-analysis-guide.md) — Deeper guidance on code analysis techniques
- [common-issues.md](references/common-issues.md) — Common problem patterns and their signatures
