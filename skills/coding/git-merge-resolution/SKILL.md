---
name: git-merge-resolution
description: >-
  Master git merge conflict resolution: when to merge vs rebase, conflict handling strategies, and maintaining clean merge history. Use when user encounters merge conflicts, git merge issues, or when they need to combine branch histories. Triggers especially when user says "merge conflict", "resolve conflicts", "git merge", "merge strategy", or "conflicts in git".
category: coding
priority: P2
trigger_patterns:
  - "merge conflict"
  - "resolve conflicts"
  - "git merge"
  - "merge strategy"
  - "conflicts in git"
---

# Git Merge Resolution — Conflict Handling Framework

## Overview

Git-merge-resolution is a **behavioral specification skill** that encapsulates the judgment of **when to merge, how to handle conflicts, and how to maintain clean merge history**.

This skill embodies the experience of developers who've merged hundreds of branches and know that most merge conflicts are preventable through strategy, not just resolution.

## Core Philosophy

### The Merge Truth

> "Merge conflicts aren't bugs — they're Git's way of saying 'I need a human to make a decision.' The conflict is easy. Deciding WHICH version to keep is the real work."

### Merge vs Rebase Decision

```
┌─────────────────────────────────────────────────────────────┐
│                   MERGE vs REBASE                              │
│                                                               │
│    USE MERGE WHEN:                                           │
│    ✓ Merging shared/public branches                          │
│    ✓ Preserving exact history is important                   │
│    ✓ Complex conflicts (single merge commit easier)          │
│    ✓ Team prefers merge commits                             │
│                                                               │
│    USE REBASE WHEN:                                          │
│    ✓ Local-only feature branches                             │
│    ✓ Clean linear history desired                           │
│    ✓ Regular sync with main (avoid merge bubbles)            │
│    ✓ Interactive cleanup before PR                          │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### When to Merge

| Situation | Action | Rationale |
|-----------|--------|-----------|
| Merging main to feature | Rebase OR Merge | Either works |
| Merging feature to main | MERGE | Main is shared |
| Merging release branch | MERGE | Preserves release point |
| Merging hotfix | MERGE | Quick, clear |
| Team convention | Follow | Consistency matters |

### Conflict Risk Assessment

```
┌─────────────────────────────────────────────────────────────┐
│                   CONFLICT RISK MATRIX                       │
│                                                               │
│    Low Risk (Merge OK)         High Risk (Review First)      │
│    ─────────────────           ────────────────────────       │
│    • Same files, no overlap   • Same files, same lines      │
│    • Well-structured commits   • Large features merged        │
│    • Small changes            • Long-running branches        │
│    • Good test coverage       • Multiple people contributed  │
└─────────────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Phase 1: Pre-Merge Preparation

#### 1.1 Assess the Situation

```bash
# See what changed in target branch
git fetch origin
git log main..origin/main --oneline

# See what changed in your branch
git log origin/main..HEAD --oneline

# Find potential conflict areas
git diff --name-only origin/main...HEAD
```

#### 1.2 Prepare for Merge

```bash
# Update all refs
git fetch --all

# Create merge backup branch (safety!)
git branch backup/feature-xyz

# Verify target branch is clean
git checkout target-branch
git status
```

### Phase 2: Merge Execution

#### 2.1 Standard Merge

```bash
# Start merge
git checkout feature-branch
git merge main

# If successful (fast-forward or clean)
# Git will create merge commit automatically

# If conflicts occur → resolve then commit
```

#### 2.2 Merge Strategies

```bash
# Fast-forward only (no merge commit)
git merge --ff-only main

# Force merge commit (even if fast-forward possible)
git merge --no-ff main

# Squash merge (all commits into one)
git merge --squash feature-branch

# Ours strategy (keep our version, ignore theirs)
git merge -s ours feature-branch

# Patience strategy (slower but better for renames)
git merge -X patience feature-branch
```

### Phase 3: Conflict Resolution

#### 3.1 Understanding Conflicts

```markdown
## What Git Tells You

When conflicts occur, Git shows:

<<<<<<< HEAD (your changes)
const x = 1;
=======
const x = 2;
>>>>>>> feature-branch (their changes)

Git cannot automatically decide because:
- Both versions modified the same lines
- Git doesn't know which is "correct"

Your job: Decide what the final code should be
```

#### 3.2 Conflict Resolution Protocol

```
┌─────────────────────────────────────────────────────────────┐
│                 CONFLICT RESOLUTION STEPS                     │
│                                                               │
│  1. IDENTIFY: Find conflicting files                         │
│     git status (shows "both modified")                        │
│                                                               │
│  2. UNDERSTAND: What did each side change?                   │
│     git diff --base conflicted-file                           │
│     git diff --ours conflicted-file                          │
│     git diff --theirs conflicted-file                        │
│                                                               │
│  3. DECIDE: What should the final code be?                    │
│     - Ours only?                                             │
│     - Theirs only?                                           │
│     - A combination?                                         │
│     - Something entirely different?                           │
│                                                               │
│  4. EDIT: Resolve the conflict markers                       │
│     <<<<<<< HEAD                                             │
│     [your version]                                           │
│     =======                                                  │
│     [their version]                                          │
│     >>>>>>> feature-branch                                    │
│     Replace with final version, remove markers               │
│                                                               │
│  5. TEST: Verify the resolution                              │
│     npm test                                                 │
│                                                               │
│  6. STAGE & COMMIT                                           │
│     git add resolved-file                                     │
│     git commit (merge commit auto-created)                   │
└─────────────────────────────────────────────────────────────┘
```

#### 3.3 Conflict Resolution Strategies

```bash
# Accept OUR changes completely
git checkout --ours conflicted-file
git add conflicted-file

# Accept THEIR changes completely
git checkout --theirs conflicted-file
git add conflicted-file

# Manual resolution (preferred)
# Edit the file, keeping what makes sense
# Remove conflict markers
# Add when done
git add conflicted-file
```

#### 3.4 Useful Commands for Understanding

```bash
# See common ancestor version
git show :1:conflicted-file  # common ancestor

# See our version (HEAD)
git show :2:conflicted-file  # ours

# See their version
git show :3:conflicted-file  # theirs

# Or use git mergetool
git mergetool
```

### Phase 4: Post-Merge Validation

#### 4.1 Verification Checklist

```bash
# Run tests
npm test

# Check the merge commit
git log -1 --stat

# Verify no missing conflicts
git status

# Build to catch any issues
npm run build
```

#### 4.2 Common Post-Merge Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Lost changes | Tests failing after merge | Check original branch commits |
| Inconsistent state | Build errors | Clean rebuild |
| Dependencies | Import errors | Reinstall deps |

## Conflict Patterns

### Pattern 1: Same Line, Different Changes

```typescript
// CONFICT:
<<<<<<< HEAD
const MAX_RETRIES = 3;
=======
const MAX_RETRIES = 5;
>>>>>>> feature-branch

// RESOLUTION:
// If both are valid, pick larger or add comment
const MAX_RETRIES = 5; // Increased for flaky API
```

### Pattern 2: Same Function, Different Implementation

```typescript
// CONFLICT:
<<<<<<< HEAD
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
=======
function calculateTotal(items: Item[]): number {
  return items
    .filter(item => item.active)
    .reduce((sum, item) => sum + item.price, 0);
}
>>>>>>> feature-branch

// RESOLUTION: Both changes needed!
// Take the feature's change
function calculateTotal(items: Item[]): number {
  return items
    .filter(item => item.active)
    .reduce((sum, item) => sum + item.price, 0);
}
```

### Pattern 3: Deleted vs Modified

```typescript
// CONFLICT:
<<<<<<< HEAD
const API_URL = 'https://api.example.com';
=======
// API_URL was removed
>>>>>>> feature-branch

// RESOLUTION:
// Ask: Should the URL exist or not?
// If feature removed it intentionally → theirs
// If main changed away from it → needs discussion
```

## Merge Strategies Deep Dive

### Strategy 1: Fast-Forward Merge

```bash
# Only possible when no divergent commits
git merge --ff-only feature-branch

# Result: No merge commit, just moves pointer
# Good: Clean history
# Bad: No merge record if revert needed
```

### Strategy 2: No Fast-Forward (Create Merge Commit)

```bash
# Always creates merge commit
git merge --no-ff feature-branch

# Result: Merge commit with two parents
# Good: Clear merge record, easy to revert
# Bad: Cluttered history if overused
```

### Strategy 3: Squash Merge

```bash
# Combines all commits into one
git merge --squash feature-branch
git commit -m "feat: complete user authentication"

# Result: Single commit on main
# Good: Very clean history
# Bad: Loses individual commit history
```

### Strategy 4: Three-Way Merge

```bash
# Git finds common ancestor and combines
git merge feature-branch

# Result: Merge commit if conflicts
# Good: Preserves history
# Bad: Can have complex conflicts
```

## Common Scenarios

### Scenario 1: "Large merge with many conflicts"

```markdown
## Strategy: Incremental Merge

Instead of merging feature/entire-overhaul into main at once:

1. Merge small pieces first:
   git merge feature/part-1  # Auth
   git merge feature/part-2  # User profiles

2. Each merge is smaller, easier to resolve

3. If conflicts between parts, resolve incrementally

4. Final merge to main has less risk
```

### Scenario 2: "I made changes that conflict with main"

```bash
# Option A: Rebase onto main first
git fetch origin
git rebase origin/main
# Resolve conflicts during rebase
# Then merge (likely fast-forward)

# Option B: Merge main into your branch
git fetch origin
git merge origin/main
# Resolve conflicts in your branch
# Then merge to main
```

### Scenario 3: "Merge failed, but I made things worse"

```bash
# ABORT the merge
git merge --abort

# Start fresh
git checkout feature-branch
git merge main

# Or restore from backup
git checkout -b restored-feature backup/feature-xyz
```

## The Merge Resolution Checklist

```
MERGE RESOLUTION CHECKLIST
==========================

PRE-MERGE:
□ Fetched and updated branches
□ Reviewed what changed in each branch
□ Created backup branch
□ Verified clean working directory
□ Assessed conflict risk

DURING:
□ Identified all conflicting files
□ Understood what each side changed
□ Made conscious decision on each conflict
□ Tested resolution compiles/runs
□ No conflict markers left

POST-MERGE:
□ Run full test suite
□ Review merge commit message
□ Verify no unintended changes
□ Push if ready
□ Notify team of significant changes
```

## Key Principles

### 1. Understand Before Deciding

Don't just pick "ours" or "theirs" blindly. Understand what each version does and why.

### 2. Small Merges Are Safer

Merging 5 small commits is safer than merging 1 large one.

### 3. Test After Resolving

Just because it compiles doesn't mean it's right. Run tests.

### 4. Communication Matters

If merging branches from teammates, talk to them about conflicting changes.

### 5. Commit the Resolution

Don't leave conflicts staged. Commit the merge to complete it.

## Anti-Patterns

### 1. Blindly Taking One Side

```bash
# BAD: Just taking all ours or all theirs
git checkout --ours .
git add .

# This loses work!

# GOOD: Evaluate each conflict
```

### 2. Leaving Conflict Markers

```typescript
// BAD: Still has markers
<<<<<<< HEAD
const x = 1;
=======
const x = 2;
>>>>>>> feature-branch

// Must remove these before committing!
```

### 3. Not Testing After Merge

```bash
# BAD: "Looks fine, pushing..."
git commit -m "Merge"
git push

# Tests fail in CI

# GOOD: Always test before pushing
npm test
```

## Relationship to Other Skills

- `git-branch-strategy` — Branch planning affects merge frequency
- `git-rebase-safety` — Alternative to merge for local branches
- `git-history-rewrite` — Cleaning up history before merge
- `pre-commit-review` — Review after merge
- `git-stash-management` — Stashing during merge interruptions
