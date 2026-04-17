---
name: context-learning
description: >-
  Quickly understands unfamiliar code by tracing imports, call chains, and data flows. Produces concise
  context analysis covering module purpose, dependencies, logic flow, and side effects.
  Should be used when the user needs to understand code they didn't write — onboarding, investigating
  bugs, preparing for code review, or figuring out how a feature works.
  Distinguished from explore which focuses on project-wide investigation, this skill focuses on
  tracing code references and understanding specific code contexts.
category: coding
boundary:
  vs_explore: "explore focuses on project-wide investigation, this skill focuses on tracing code references and call chains within specific files"
---

# Code Context Learning

## Core Capability

Given a file or folder path, start from the main file, trace all references (imports, dependencies, call chains), and map the complete logic flow — then present it concisely so the reader knows where to modify and what a change would affect.

## When to Use

- Onboarding to an unfamiliar project
- Pre-bug-investigation: understand the call chain first
- Pre-code-review: build a mental model
- Learning how an open-source feature works
- Pre-refactoring: assess impact scope
- Pre-technical-design-review: understand the current state

## When NOT to Use

- The code is a single, self-contained file with no external imports
- You already understand the module well and just need a quick look at one function

---

## Workflow

### Step 1: Determine the Entry Point

- **File path given**: Use that file directly
- **Folder path given**: Auto-detect the main entry, priority order:
  1. `index.ts` / `index.tsx` / `index.js`
  2. `main.ts` / `main.tsx` / `App.tsx`
  3. The file pointed to by `package.json` → `main` field
  4. The only top-level file in the folder

### Step 2: Read the Main File, Extract Key Info

Extract from the main file:

- **Public interface**: exported functions, classes, components, constants
- **Core logic**: main business processing flow
- **Dependencies**: all import/require modules (distinguish internal vs. external)

Use semantic search for indexed projects, file reading for large files, and precise symbol lookups for specific identifiers.

### Step 3: Trace Internal Reference Chain

For each **internal module** (relative path imports) identified in Step 2, recursively read and extract:

- Module purpose (what it does)
- Key public interfaces
- Whether it has further references

Depth limit: 2–3 levels by default. If a level has too many references, list only the critical paths.

### Step 4: Map the Logic Flow

Consolidate Steps 2–3 into a text-based flow diagram:

```
Entry file
  └─ calls moduleA (purpose: xxx)
       ├─ calls util/helper (purpose: xxx)
       └─ calls service/api (purpose: xxx)
            └─ depends on config/constants (purpose: xxx)
```

### Step 5: Output the Analysis Report

Follow the output format below. Each module described in 1–2 sentences max. Focus on the main path — ignore utility functions, type definitions, and other secondary files. After reading, the user should know "where to modify, what a change would affect".

---

## Analysis Dimensions

| Dimension                 | What to cover                                            |
| ------------------------- | -------------------------------------------------------- |
| **Entry purpose**         | What this file/module does, what problem it solves       |
| **Data flow**             | Where data comes from, how it's processed, where it goes |
| **Core call chain**       | The most critical function/method call sequence          |
| **External dependencies** | Third-party libraries and their roles                    |
| **Side effects**          | I/O, network requests, state mutations, event listeners  |
| **Key configuration**     | Config items or env vars that affect behavior            |

---

## Output Format

```markdown
## Code Context Analysis Report

### Basic Info

| Item          | Content                    |
| ------------- | -------------------------- |
| Target path   | `[file/folder path]`       |
| Entry file    | `[entry file path]`        |
| Entry purpose | [One-sentence description] |
| Analysis time | [YYYY-MM-DD HH:mm:ss]      |

---

### Core Logic Chain

[Text flow diagram showing call chain]

---

### Module Summary

| Module | Path              | Purpose                    | Type                             |
| ------ | ----------------- | -------------------------- | -------------------------------- |
| [Name] | `[relative path]` | [One-sentence description] | Core business / Utility / Config |

---

### Data Flow

[Describe input → processing → output in 1–3 sentences]

---

### External Dependencies

| Package | Version | Purpose   | Type             |
| ------- | ------- | --------- | ---------------- |
| [name]  | x.x.x   | [purpose] | Production / Dev |

---

### Key Points & Caveats

- [Noteworthy design decisions or potential risks, one per line]

---

### Suggested Reading Order

1. `[file path]` — [reason]
2. `[file path]` — [reason]
3. ...

---

### Related Skills

Based on the analysis, consider:

- `tech-stack-detection` — for full project tech stack understanding
- `code-comment-writer` — to add comments improving readability
- `frontend-code-review` — for code quality checks
```

---

## Output Principles

- **Don't restate code** — No large source code pastes; distill key information only
- **Don't over-expand** — External npm packages: state purpose only, don't dive into their source
- **Highlight the main path** — Utility functions, type files, styles: skip or mention briefly
- **Flow diagrams first** — Relationships expressed as tree diagrams are more intuitive than prose
- **Keep it brief** — Each module description limited to 1–2 sentences

---

## Skill Collaboration

| Skill                        | Scenario                                                      |
| ---------------------------- | ------------------------------------------------------------- |
| `tech-stack-detection`       | Understand project tech stack first, then do context analysis |
| `code-comment-writer`        | After analysis, add comments to improve readability           |
| `frontend-code-review`       | After understanding logic, do a code quality check            |
| `react-component-extraction` | After analysis, identify extractable components or Hooks      |
