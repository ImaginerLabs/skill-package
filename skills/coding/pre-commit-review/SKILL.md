---
name: pre-commit-review
description: >-
  Chain-combined skill that merges git-commit behavior with code-review judgment to create intelligent pre-commit workflow. Encapsulates the decision of WHEN to require review before commit, WHAT to check in pre-commit review, and HOW to structure commit workflow. Use when user mentions pre-commit review, commit with review, pre-commit checks, or when they want to establish commit quality gates. Triggers especially when user says "should I review before commit?", "what should I check before committing?", "commit workflow", or when they're unsure whether their commit is ready.
category: coding
priority: P0
trigger_patterns:
  - "pre-commit review"
  - "commit with review"
  - "pre-commit check"
  - "commit workflow"
  - "commit quality"
  - "before commit"
  - "is my commit ready"
  - "commit review"
combines:
  - git-commit
  - code-review
  - staged-code-review
---

# Pre-Commit Review — Intelligent Commit Quality Gates

## Overview

Pre-commit-review is a **chain-combined behavioral specification skill** that merges:

- `git-commit` — Intelligent commit behavior规范
- `code-review` — Review judgment and criteria
- `staged-code-review` — Focused pre-commit workflow

The core judgment it encapsulates: **"When should I require review before committing, and what should that review cover?"**

This skill doesn't just execute a workflow — it embodies the decision-making framework of an experienced developer who knows when commits need extra scrutiny.

## Core Philosophy

### The Commit Readiness Spectrum

Not every commit needs review. This skill helps you navigate the spectrum:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Quick Fix  │ ──► │  Normal Push  │ ──► │  Major UX   │
│  (instant)  │     │  (reviewed)  │     │  (reviewed) │
└─────────────┘     └──────────────┘     └─────────────┘
     │                    │                    │
     │                    │                    │
     ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Any pattern │     │   Complex    │     │  Breaking   │
│ Trivial fix │     │   logic      │     │  changes    │
│ Doc updates │     │   Business   │     │  New API    │
└─────────────┘     │   logic      │     └─────────────┘
                    └──────────────┘
```

### The Pre-Commit Decision Tree

```
                    ┌─ Is this a hotfix?
                    │   └─ NO → Continue
                    │       └─ YES → Commit freely (but document)
                    │
                    └─ Does this affect other teams?
                        └─ YES → Require review
                        └─ NO → Continue
                                │
                                └─ Is logic complex (>10 lines changed)?
                                    └─ YES → Recommend review
                                    └─ NO → Continue
                                            │
                                            └─ Does this touch security/auth?
                                                └─ YES → Require review
                                                └─ NO → Commit freely
```

## Behavioral Specification

### Phase 1: Pre-Commit Self-Review

Before EVERY commit, run through these checkpoints:

#### 1.1 Staged Changes Analysis

```bash
# Review what you're about to commit
git diff --staged --stat

# Check for unexpected changes
git diff --staged --name-only
```

**Ask yourself:**
- Are all these changes intentional?
- Are there any debug statements or console.logs?
- Are there any .env or credentials files staged?

#### 1.2 Code Quality Gates

Run these checks mentally (or with tools):

| Check | What to Look For |
|-------|------------------|
| Naming | Variables/functions clearly named? |
| Complexity | Any function >20 lines doing multiple things? |
| Comments | Comments explain WHY, not WHAT? |
| Tests | Logic changes have corresponding tests? |
| Types | New code properly typed (TypeScript)? |

#### 1.3 Commit Message Check

Does your commit message follow convention?

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Check:**
- Subject line ≤72 characters
- Uses imperative mood ("add" not "added")
- Describes WHAT changed, not HOW
- Body explains WHY if non-obvious

### Phase 2: Risk Assessment

Determine if this commit needs extra review:

#### High-Risk Commits (Require Review)

| Risk Type | Indicators | Action |
|-----------|------------|--------|
| Security | Auth, permissions, data handling | Mandatory review |
| Data | Database, migrations, queries | Mandatory review |
| API | Endpoint changes, contracts | Mandatory review |
| Breaking | Public API, major behavior | Mandatory review |

#### Medium-Risk Commits (Review Recommended)

| Risk Type | Indicators | Action |
|-----------|------------|--------|
| Business | Core logic, calculations | Consider review |
| Complex | Multi-file, non-trivial | Consider review |
| Shared | Utils, shared components | Consider review |

#### Low-Risk Commits (Self-Approve)

| Type | Examples |
|------|----------|
| Chores | Deps, configs, build |
| Docs | Readme, comments |
| Fixes | Simple bug fixes (1-3 lines) |
| Refactors | Rename, format (no logic) |

### Phase 3: Quick Review Protocol

When review IS needed, here's the focused protocol:

#### What to Review (5 minutes max)

1. **Correctness**: Does the code do what it claims?
2. **Safety**: Any security or data integrity risks?
3. **Clarity**: Can someone understand this in 6 months?
4. **Tests**: Are there tests for the new logic?

#### What NOT to Review (Save for later)

- Style debates (use linters)
- Minor nits (non-blocking)
- "I would have done it differently" (opinion)
- Future concerns (out of scope)

## Commit Type Recommendations

Based on risk assessment, here's when to use each type:

| Type | When to Use | Review Needed? |
|------|-------------|----------------|
| `feat` | New features | Recommended |
| `fix` | Bug fixes | Low risk: No / High risk: Yes |
| `docs` | Documentation | No |
| `refactor` | Restructure (no behavior change) | Low risk: No / Complex: Yes |
| `perf` | Performance improvements | Recommended |
| `test` | Adding tests | No |
| `build` | Build system changes | Yes |
| `ci` | CI/CD changes | Yes |
| `chore` | Maintenance | No |

## The Pre-Commit Review Checklist

```
PRE-COMMIT REVIEW CHECKLIST
==========================

□ 1. Changes are intentional
□ 2. No debug code (console.log, debugger)
□ 3. No credentials or secrets
□ 4. Code follows project conventions
□ 5. Types are properly defined
□ 6. Tests cover new logic
□ 7. Commit message follows convention
□ 8. Subject line ≤72 chars
□ 9. Imperative mood used
□ 10. Breaking changes documented

RISK ASSESSMENT
===============
□ Security-sensitive changes?
□ Data integrity affected?
□ API contract changed?
□ Breaking change?

REVIEW REQUIRED? [ ] YES  [ ] NO
If YES, reviewer: _______________
```

## Integration with git-commit

When using `git-commit`, extend it with pre-commit-review judgment:

### Commit Flow

```
1. git add <files>
2. Run pre-commit-review judgment
3. Based on risk assessment:
   - Low risk → Proceed with git commit
   - Medium risk → Do quick self-review
   - High risk → Find a reviewer first
4. Write commit message (use convention)
5. Execute commit
```

### Commit Message Template

```markdown
<type>(<scope>): <subject>

<body>

<footer>
---
Reviewed by: [reviewer]
Risk level: [low/medium/high]
Tests added: [yes/no]
Breaking change: [yes/no]
```

## Common Scenarios

### Scenario 1: "Is this commit ready?"

```markdown
Analysis:
- 3 files changed, 50 lines added
- Touches authentication logic
- Adds new API endpoint

Risk: HIGH (security + API)

Recommendation: Get review before committing.
```

### Scenario 2: "Quick documentation fix"

```markdown
Analysis:
- 1 file changed, 5 lines
- Documentation only
- No logic affected

Risk: LOW

Recommendation: Commit freely.
```

### Scenario 3: "Refactoring a shared utility"

```markdown
Analysis:
- 5 files changed
- Shared utility used by 10+ places
- No behavior change (rename/format)

Risk: MEDIUM (high blast radius)

Recommendation: Self-review carefully, or get quick review from one person.
```

## Key Principles

### 1. Review is a Gift

Code review isn't criticism — it's collaboration. Frame it positively.

### 2. Small Commits = Easy Reviews

Large commits are hard to review. If you need review, small commits are easier to approve.

### 3. Trust, but Verify

Your judgment about "is this ready" improves with experience. This skill helps you formalize that judgment.

### 4. Context Matters

The same change might need review in one codebase but not another. Consider:
- Team size
- Code ownership
- Release cadence
- Risk tolerance

### 5. When in Doubt, Review

If you're unsure whether to review, the answer is usually "yes."

## Relationship to Other Skills

- `git-commit` — The commit execution skill this builds upon
- `code-review` — Provides the review criteria
- `staged-code-review` — Provides the focused review protocol
- `safe-refactor` — Use before refactoring to ensure coverage
- `test-think` — Use to determine what tests are needed
