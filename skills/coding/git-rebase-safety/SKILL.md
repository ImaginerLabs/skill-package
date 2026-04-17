---
name: git-rebase-safety
description: >-
  Master safe rebasing: when to use rebase vs merge, how to handle conflicts, and how to ensure history integrity. Use when user mentions rebasing, git rebase, rebase conflicts, rebase vs merge, or when they're unsure about rebasing strategy. Triggers especially when user says "should I rebase?", "rebase vs merge", "how to resolve rebase conflicts", or "is it safe to rebase?".
category: coding
priority: P1
trigger_patterns:
  - "should I rebase"
  - "rebase vs merge"
  - "rebase conflict"
  - "safe rebase"
  - "git rebase"
  - "rebase workflow"
  - "interactive rebase"
---

# Git Rebase Safety — When and How to Rebase

## Overview

Git-rebase-safety is a **behavioral specification skill** that encapsulates the judgment of **when to rebase, when to merge, and how to handle rebasing safely**.

This skill embodies the expertise of developers who've experienced both the power and the pitfalls of rebasing and know how to use it without causing problems.

## Core Philosophy

### The Rebase Golden Rule

> **"Never rebase public history."**

If a branch has been shared with others (pushed to remote, PR created), rebasing rewrites shared history and causes problems for everyone who has that history.

### When Rebase is Safe

```
┌─────────────────────────────────────────────────────────────┐
│                    REBASE SAFETY MATRIX                        │
│                                                               │
│  ┌─────────────────┬─────────────────┬───────────────────┐  │
│  │                 │   LOCAL ONLY    │   SHARED/REMOTE   │  │
│  ├─────────────────┼─────────────────┼───────────────────┤  │
│  │ YOUR OWN BRANCH │   ✅ SAFE       │   ⚠️ RISKY        │  │
│  │                 │   (personal)    │   (causes issues) │  │
│  ├─────────────────┼─────────────────┼───────────────────┤  │
│  │ OTHERS' BRANCH  │   ⚠️ CAUTION   │   ❌ DANGEROUS    │  │
│  │                 │   (coordinate)  │   (never do this)  │  │
│  └─────────────────┴─────────────────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### Rebase vs Merge Decision Tree

```
                    ┌─ Is this branch local only?
                    │   └─ NO → Use MERGE
                    │       └─ YES → Continue
                    │
                    └─ Is this branch shared with others?
                        └─ YES → Use MERGE
                        └─ NO → Continue
                                │
                                └─ Do you prefer clean linear history?
                                    └─ YES → Use REBASE
                                    └─ NO → Use MERGE
```

### When to REBASE

| Situation | Recommendation | Why |
|-----------|---------------|-----|
| Local feature branch | ✅ Rebase | Clean, personal history |
| Updating feature branch with main | ✅ Rebase | Keep feature isolated |
| Cleaning up commits before PR | ✅ Rebase (interactive) | Improve reviewability |
| Maintaining feature branch sync | ✅ Rebase | Avoid merge bubbles |
| Personal experimental branches | ✅ Rebase | Full control |

### When to MERGE

| Situation | Recommendation | Why |
|-----------|---------------|-----|
| Branch is shared (pushed/PR) | ⚠️ Merge | Don't rewrite shared history |
| Merging release branch | ⚠️ Merge | Need version markers |
| Team prefers merge commits | ⚠️ Merge | Team convention |
| Complex conflict resolution | ⚠️ Merge | Single merge commit easier |
| Public branches | ❌ Never Rebase | Rewrites shared history |

## Behavioral Specification

### Phase 1: Pre-Rebase Assessment

#### 1.1 Safety Checklist

```
PRE-REBASE SAFETY CHECKLIST
============================

□ Is this branch local only?
□ Has this branch been pushed to remote?
□ Has a PR been created from this branch?
□ Have others checked out this branch?
□ Is this branch shared with teammates?

If ALL NO → REBASE is safe
If ANY YES → Use MERGE instead
```

#### 1.2 Risk Assessment

```markdown
## Risk Analysis

| Factor | Risk Level | Action |
|--------|-----------|--------|
| Branch never pushed | LOW | Rebase freely |
| Branch pushed but no PR | MEDIUM | Coordinate with team |
| PR already reviewed | HIGH | Use merge |
| Team uses this branch | CRITICAL | Never rebase |

Risk Score: [LOW/MEDIUM/HIGH/CRITICAL]
Recommendation: [REBASE/MERGE]
```

### Phase 2: Rebase Execution

#### 2.1 Standard Rebase

```bash
# Update your feature branch with main
git checkout feature/PROJ-123
git fetch origin
git rebase origin/main

# If conflicts occur → resolve then continue
git rebase --continue

# If you want to abort
git rebase --abort
```

#### 2.2 Interactive Rebase (Cleanup)

```bash
# Clean up last N commits
git rebase -i HEAD~3

# Commands in interactive mode:
# pick = use commit as-is
# squash = combine with previous (keep changes)
# fixup = combine, discard commit message
# reword = change commit message
# drop = remove commit entirely
```

```bash
# Example: cleanup 3 commits
pick abc1234 Add user authentication
fixup def5678 Fix typo
fixup ghi9012 WIP

# Result: 1 clean commit
```

### Phase 3: Conflict Resolution

#### 3.1 Conflict Resolution Protocol

```
┌─────────────────────────────────────────────────────────────┐
│                    CONFLICT RESOLUTION                        │
│                                                               │
│  1. REBASE STOPS AT CONFLICTING COMMIT                      │
│     └─ "CONFLICT: src/auth.ts"                             │
│                                                               │
│  2. IDENTIFY CONFLICTING FILES                             │
│     └─ git status shows "both modified"                     │
│                                                               │
│  3. EDIT CONFLICTING FILES                                  │
│     └─ Keep desired changes                                  │
│     └─ Remove conflict markers <<< === >>>                  │
│                                                               │
│  4. STAGE RESOLVED FILES                                    │
│     └─ git add <resolved-file>                              │
│                                                               │
│  5. CONTINUE OR ABORT                                        │
│     └─ git rebase --continue (if resolved)                  │
│     └─ git rebase --abort (if messed up)                     │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2 Conflict Resolution Strategy

**DON'T:**
- Pick all "ours" or "theirs" blindly
- Delete conflict markers without choosing
- Ignore the conflict

**DO:**
- Understand what both changes do
- Choose the correct combination
- Test after resolution

```bash
# View both versions
git show :1:filename  # common ancestor
git show :2:filename  # ours (current branch)
git show :3:filename  # theirs (incoming branch)
```

### Phase 4: Post-Rebase Validation

#### 4.1 Verification Checklist

```markdown
POST-REBASE CHECKLIST
======================

□ Run tests to ensure functionality preserved
□ Verify no unexpected changes in git log
□ If pushed before, force push with care:
  └─ git push --force-with-lease (safer than --force)
□ Notify team if shared branch was affected
□ Verify all commits are intact
```

#### 4.2 Force Push Safety

```bash
# SAFE: force push with lease
git push --force-with-lease origin feature/PROJ-123

# What --force-with-lease does:
# - Refuses to push if remote has commits you don't have
# - Prevents accidentally overwriting others' work

# NEVER use plain --force
git push --force  # DON'T DO THIS
```

## Common Scenarios

### Scenario 1: "My feature branch is behind main, how do I update?"

```markdown
Analysis:
- Feature branch exists
- Main has new commits
- Branch not shared

Options:
A) git merge main
   └─ Creates merge commit
   └─ Preserves exact history

B) git rebase main
   └─ Clean linear history
   └─ No merge commit

Recommendation: REBASE (cleaner for feature branches)
```

### Scenario 2: "I need to clean up my commits before PR"

```bash
# Interactive rebase to squash/fixup
git rebase -i HEAD~5

# Change 'pick' to 'fixup' for commits to combine
# Change 'pick' to 'reword' to edit messages
# Change 'pick' to 'drop' to remove commits
```

### Scenario 3: "Rebase created conflicts, should I abort?"

```markdown
Analysis:
- Conflict occurred during rebase
- 5 files affected
- Complex changes

Options:
A) Continue and resolve
   └─ Takes time but resolves cleanly
   └─ Preserves rebased history

B) Abort and merge instead
   └─ Faster
   └─ Creates merge commit
   └─ May be easier for complex conflicts

Recommendation:
- If you understand both sides → Resolve
- If confused/uncomfortable → Abort and merge
```

### Scenario 4: "I accidentally rebased a shared branch"

```markdown
INCIDENT: Pushed branch rebased, team affected

IMMEDIATE ACTION:
1. Notify team immediately
2. Don't push further changes
3. Help team recover:
   └─ git pull (creates duplicate commits)
   └─ Or: reset to pre-rebase state

PREVENTION:
1. Always check if branch is shared
2. Use --force-with-lease
3. Prefer merge for shared branches
```

## The Rebase Decision Checklist

```
REBASE DECISION CHECKLIST
==========================

□ Where will this branch be used?
  └─ Local only → REBASE allowed
  └─ Shared/remote → Use MERGE

□ What is your team's convention?
  └─ Rebase workflow → Follow it
  └─ Merge workflow → Use MERGE

□ How complex are the changes?
  └─ Simple → REBASE fine
  └─ Complex → Consider MERGE

□ Do you need to preserve exact history?
  └─ Yes → MERGE
  └─ No → REBASE

RECOMMENDATION: [REBASE / MERGE]
```

## Rebase Best Practices

### DO

1. **Rebase local branches before pushing**
2. **Use --force-with-lease instead of --force**
3. **Resolve conflicts completely before continuing**
4. **Test after rebase**
5. **Notify team when rebasing shared branches**
6. **Use interactive rebase to clean up commits**

### DON'T

1. **Never rebase public/shared history**
2. **Don't rebase if you don't understand the conflicts**
3. **Don't ignore conflicts**
4. **Don't force push without checking**
5. **Don't rebase mid-PR without coordination**

## Rebase Workflow Patterns

### Pattern 1: Trunk-Based Rebasing

```bash
# Daily: sync with trunk
git checkout main
git pull
git checkout feature/PROJ-123
git rebase main

# Feature complete: PR
git push --force-with-lease
```

### Pattern 2: Pre-PR Cleanup

```bash
# Before creating PR, clean up commits
git rebase -i HEAD~5

# Squash: combine related commits
# Reword: improve commit messages
# Drop: remove unnecessary commits
```

## Key Principles

### 1. Rebase = Rewrite History

Every rebase rewrites commits. This is fine locally, dangerous on shared history.

### 2. Merge Commits = Recorded Truth

Merge commits show exactly when integration happened and what both branches contained.

### 3. Clean History Has Value

Linear history with rebase makes `git log` and `git bisect` easier.

### 4. Team Convention Trumps Personal Preference

If your team uses merge, use merge. Consistency matters more than purity.

### 5. When in Doubt, Merge

If you're unsure about rebasing, merge is the safer choice.

## Relationship to Other Skills

- `git-branch-strategy` — Branch creation affects rebase strategy
- `git-commit` — Interactive rebase affects commit organization
- `git-merge-resolution` — Alternative to rebasing
- `git-history-rewrite` — More advanced history manipulation
- `pre-commit-review` — Review process after rebase
