---
name: git-branch-strategy
description: >-
  Master Git branching decisions: when to create branches, naming conventions, branch lifecycle management, and cleanup strategies. Use when user mentions branching, branch names, git workflow, branch management, or when they're unsure about which branch to create or how to organize branches. Triggers especially when user says "should I create a branch?", "what should I name this branch?", "branch naming convention", "how to organize branches", or "when to create a branch".
category: coding
priority: P1
trigger_patterns:
  - "should I create a branch"
  - "branch naming"
  - "branch convention"
  - "git branch strategy"
  - "how to name branch"
  - "branch lifecycle"
  - "cleanup branches"
  - "delete branch"
---

# Git Branch Strategy — When and How to Branch

## Overview

Git-branch-strategy is a **behavioral specification skill** that encapsulates the judgment of **when to create branches, how to name them, and when to clean them up**.

This skill embodies the decision-making framework of developers who've worked with various branching models and know which approach fits which context.

## Core Philosophy

### The Branching Paradox

> "Every branch is a promise. The promise: 'I will integrate this work back into the main line.' The cost: managing that promise across time and changes."

Branches are cheap, but they have a cognitive cost. Each branch you maintain is context you switch between. The question isn't "can I create a branch?" — it's "should I?"

### The Branching Spectrum

```
┌─────────────────────────────────────────────────────────────────┐
│                    BRANCHING COMPLEXITY                          │
│                                                                   │
│  ┌───────────┐     ┌──────────────┐     ┌──────────────────┐    │
│  │   TRUNK   │ ──► │   FEATURE   │ ──► │    LONG-LIVED   │    │
│  │  (main)   │     │   BRANCH    │     │   FEATURE BRANCH │    │
│  │           │     │  (1-2 days) │     │   (1+ weeks)     │    │
│  └───────────┘     └──────────────┘     └──────────────────────┘  │
│       │                  │                      │                │
│       │                  │                      │                │
│       ▼                  ▼                      ▼                │
│   Ship fast,         Feature isolated       Needs coordination  │
│   merge carefully    Easy to review         Higher integration   │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Decision Framework

### When to Create a Branch

#### Create a Branch WHEN:

| Condition | Action | Rationale |
|-----------|--------|-----------|
| Work will take >1 day | Branch | Avoid blocking others |
| Multiple people involved | Branch | Coordinate parallel work |
| Risky experiment | Branch | Can discard safely |
| Affects shared code | Branch | Test before affecting team |
| Release-specific fix | Branch | Isolate release concerns |

#### DON'T Branch When:

| Condition | Alternative | Rationale |
|-----------|-------------|-----------|
| Quick fix (<1 hour) | Commit directly | Less overhead |
| Solo work, no risk | Commit directly | Fewer context switches |
| Exploratory spike | Branch from feature | Keep feature clean |
| Trivial change | Commit directly | Branch overhead > benefit |

### The Quick Decision Matrix

```
                    ┌──────────────────┬──────────────────┐
                    │     < 1 DAY      │     > 1 DAY      │
┌───────────────────┼──────────────────┼──────────────────┤
│ SOLO, LOW RISK   │  Direct commit   │  Feature branch  │
├───────────────────┼──────────────────┼──────────────────┤
│ SOLO, HIGH RISK  │  Feature branch  │  Feature branch  │
├───────────────────┼──────────────────┼──────────────────┤
│ TEAM, ANY RISK   │  Feature branch  │  Feature branch  │
└───────────────────┴──────────────────┴──────────────────┘
```

## Branch Naming Conventions

### The Universal Format

```
<type>/<ticket-id>-<short-description>

Example: feature/PROJ-123-user-authentication
```

### Type Prefixes

| Type | When to Use | Examples |
|------|-------------|----------|
| `feature/` | New feature work | feature/PROJ-123-user-auth |
| `fix/` | Bug fixes | fix/PROJ-456-login-crash |
| `hotfix/` | Urgent production fixes | hotfix/PROJ-789-security-patch |
| `release/` | Release preparation | release/v2.3.0 |
| `bugfix/` | Non-urgent bug fixes | bugfix/PROJ-101-typo |
| `refactor/` | Code restructuring | refactor/PROJ-202-payment-module |
| `docs/` | Documentation only | docs/PROJ-303-api-docs |
| `test/` | Test additions | test/PROJ-404-coverage |
| `chore/` | Maintenance tasks | chore/PROJ-505-deps-upgrade |

### Naming Rules

**DO:**
- Use kebab-case: `feature/user-auth`
- Be descriptive but concise: `fix/login-redirect`
- Include ticket/issue ID when applicable
- Use verbs for short descriptions: `add-user-auth`, `remove-deprecated-api`

**DON'T:**
- Use spaces or underscores
- Use your name: `feature/alex-user-auth`
- Be too generic: `feature/work`
- Use dates: `feature/2024-04-17-auth` (hard to understand later)

### Good vs Bad Examples

```bash
# GOOD Examples
feature/PROJ-123-user-registration
fix/PROJ-456-null-pointer-exception
hotfix/PROJ-789-security-vulnerability
refactor/PROJ-101-payment-processing
docs/PROJ-202-api-documentation

# BAD Examples
alex-feature (personal branches)
feature-new (what does this do?)
branch1 (meaningless)
fix-bug (which one?)
2024-04-17 (just a date)
```

## Branch Lifecycle Management

### The Ideal Lifecycle

```
1. CREATE     feature/PROJ-123-auth
                │
2. DEVELOP    commits on branch
                │
3. CODE REVIEW    │ PR created
                  │
4. INTEGRATE      │ Merged to main
                  │
5. CLEANUP     feature/PROJ-123-auth  ──► DELETE
```

### When to Delete Branches

**Delete WHEN:**
- Merged to main (or target branch)
- Work abandoned
- Branch is stale (>2 weeks inactive)

**Keep WHEN:**
- Branch name is still meaningful
- Work is paused but not abandoned
- It's a release branch

### Cleanup Protocol

```bash
# After merge, clean up local and remote
git checkout main
git pull origin main
git branch -d feature/PROJ-123-auth              # Local
git push origin --delete feature/PROJ-123-auth  # Remote

# Find stale branches (>2 weeks inactive)
git fetch --prune
git branch -vv | grep ": gone]"
```

## Branching Strategies

### Strategy 1: GitHub Flow (Simple)

**Best for:** Small teams, continuous deployment

```
main ───────────────────────────────►
    │
    └── feature/PROJ-123 ───────────► (PR & merge)
         │
         └── feature/PROJ-456 ─────► (PR & merge)
```

**Rules:**
- main is always deployable
- Feature branches from main
- PR + review before merge
- Delete branch after merge

### Strategy 2: GitFlow (Comprehensive)

**Best for:** Release cycles, multiple versions

```
main ────► ────► ────► ────► ────►
    │       │       │       │
    ▼       ▼       ▼       ▼
 release   release  │   hotfix
    │       │       │       │
develop ──┴──► ────► │ ────► │
    │               │       │
    ▼               ▼       ▼
  feature         feature  hotfix
```

**Rules:**
- main is production code
- develop is integration branch
- Release branches for each version
- Hotfixes directly to main + develop

### Strategy 3: Trunk-Based Development (Minimal)

**Best for:** CI/CD heavy teams, continuous integration

```
main ────────►───────►───────►
    │    │    │    │
    ▼    ▼    ▼    ▼
    (short-lived feature branches, <1 day)
```

**Rules:**
- All commits to main
- Feature flags for incomplete work
- Branches <1 day typically
- Requires strong CI/CD

## Common Scenarios

### Scenario 1: "Should I branch for this quick fix?"

```markdown
Analysis:
- Fix estimate: 30 minutes
- Solo work
- Low risk (single file)

Recommendation: Direct commit to main with clear message:
  fix/PROJ-123-remove-debug-log
```

### Scenario 2: "What branch should I branch from?"

```markdown
Analysis:
- Working on feature/PROJ-123
- Need to start feature/PROJ-456 (related)

Options:
A) Branch from feature/PROJ-123
   Pros: Can share work if needed
   Cons: Dependency, harder to merge

B) Branch from main
   Pros: Independent, cleaner
   Cons: Can't share partial work

Recommendation: Branch from main (cleaner)
If truly related, coordinate in single branch
```

### Scenario 3: "I have old stale branches, how do I clean up?"

```bash
# Step 1: List all branches
git branch -a

# Step 2: Find merged branches (gone remote)
git fetch --prune
git branch -vv | grep ": gone]"

# Step 3: Clean up
git branch -d <merged-branch>
git push origin --delete <merged-branch>
```

## The Branch Decision Checklist

```
BRANCH DECISION CHECKLIST
=========================

□ How long will this work take?
  └─ < 1 day: Consider direct commit
  └─ > 1 day: Branch recommended

□ Is this work risky?
  └─ Yes: Branch (can discard safely)
  └─ No: Consider direct commit

□ Will others be affected?
  └─ Yes: Branch (test before affecting team)
  └─ No: Consider direct commit

□ Is there a naming convention?
  └─ Follow team convention
  └─ Use type prefix + ticket ID + description

□ What's the branch lifecycle?
  └─ Create → Develop → Review → Merge → Delete

RECOMMENDATION: [Create branch / Direct commit]
```

## Key Principles

### 1. Branch for Coordination, Not Convenience

If your work affects shared code, branch. If it doesn't, consider committing directly.

### 2. Name Branches for Others

Your branch name helps teammates understand what you're working on. Make it scannable.

### 3. Short-Lived Branches Are Safer

The longer a branch lives, the harder it is to merge. Aim for <1 week.

### 4. Delete What You Merge

Old branches create clutter and confusion. Clean up immediately.

### 5. Branch from the Right Point

Feature branches usually come from main (or develop in GitFlow). Don't unnecessarily nest.

## Relationship to Other Skills

- `git-commit` — Branch strategy affects commit organization
- `git-rebase-safety` — Rebase often needed to keep branches current
- `pre-commit-review` — Review process applies to all branches
- `safe-refactor` — Refactoring often involves branch management
