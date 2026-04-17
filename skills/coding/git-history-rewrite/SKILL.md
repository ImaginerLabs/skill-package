---
name: git-history-rewrite
description: >-
  Master git history manipulation: when modifying history is safe, git reset/rebase alternatives, and maintaining history integrity. Use when user mentions git history, rewriting commits, git reset, amending commits, or when they want to clean up commit history. Triggers especially when user says "clean up history", "rewrite git history", "git reset", "amend commit", or "squash commits".
category: coding
priority: P2
trigger_patterns:
  - "clean up history"
  - "rewrite git history"
  - "git reset"
  - "amend commit"
  - "squash commits"
  - "git history"
---

# Git History Rewrite — Safe History Manipulation Framework

## Overview

Git-history-rewrite is a **behavioral specification skill** that encapsulates the judgment of **when modifying history is safe, which tool to use, and how to avoid breaking things**.

This skill embodies the experience of developers who've learned (sometimes painfully) that rewriting history is powerful but dangerous, and the key is knowing when it's appropriate.

## Core Philosophy

### The History Rewrite Golden Rules

> **Rule 1: Never rewrite public/shared history**
> **Rule 2: If you broke Rule 1, communicate immediately**

```
┌─────────────────────────────────────────────────────────────┐
│                   HISTORY REWRITE SAFETY                       │
│                                                               │
│    SAFE: Local-only branches that haven't been shared       │
│    ✓ Your feature branch                                      │
│    ✓ Commits you haven't pushed                             │
│    ✓ Branches that only you have                            │
│                                                               │
│    DANGEROUS: Shared or published branches                   │
│    ✗ Main/develop branches                                   │
│    ✗ Pushed feature branches                                 │
│    ✗ Branches others have checked out                       │
│    ✗ Any branch in a PR                                     │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### History Rewrite Tool Selection

```
┌─────────────────────────────────────────────────────────────┐
│                    TOOL SELECTION                              │
│                                                               │
│  Want to...                 Use...              Safe if...   │
│  ─────────                  ─────              ──────────   │
│  Fix last commit message    git commit --amend  Not pushed   │
│  Add file to last commit    git commit --amend  Not pushed   │
│  Remove last commit         git reset          Not pushed   │
│  Combine multiple commits   git rebase -i       Local only  │
│  Remove commits entirely    git rebase -i       Local only  │
│  Move branch to new base    git rebase          Local only  │
│  Undo pushed changes        git revert           Always safe │
└─────────────────────────────────────────────────────────────┘
```

### When Each Tool is Appropriate

| Tool | Use When | Don't Use When |
|------|----------|----------------|
| `commit --amend` | Fix last commit message/add forgotten file | Pushed commits |
| `git reset` | Undo uncommitted changes, clean staging | Pushed commits |
| `git rebase -i` | Squash/fixup/reorder commits before PR | Pushed/shared branches |
| `git revert` | Undo published changes safely | Simple local cleanup |
| `git filter-branch` | Mass history changes | Almost never needed |

## Behavioral Specification

### Phase 1: Understanding git reset

#### 1.1 Three Modes of Reset

```bash
# SOFT: Move branch pointer, keep changes staged
git reset --soft HEAD~1
# Result: Last commit unstaged, changes ready to recommit

# MIXED (default): Move branch pointer, unstaged
git reset HEAD~1
# Result: Last commit unstaged and unstaged

# HARD: Move branch pointer, DISCARD changes
git reset --hard HEAD~1
# WARNING: This deletes work!
```

#### 1.2 Reset Decision Tree

```
                    ┌─ Did you push this commit?
                    │   └─ YES → DON'T RESET
                    │       └─ Use git revert instead
                    │       └─ NO → Continue
                    │
                    └─ Do you want to keep the changes?
                        └─ NO → git reset --hard (DANGEROUS!)
                        └─ YES → Continue
                                │
                                └─ Do you want to recommit?
                                    └─ YES → git reset --soft
                                    └─ NO → git reset --mixed
```

### Phase 2: Interactive Rebase

#### 2.1 Interactive Rebase Commands

```bash
# Clean up last N commits
git rebase -i HEAD~5

# Commands available in interactive mode:
pick abc1234  Add user authentication      # Use commit as-is
fixup def5678 Fix typo                     # Squash into previous, discard message
squash ghi9012 WIP                         # Squash into previous, keep messages
reword jkl2345 Update readme               # Change commit message
drop mnop6789 WIP debugging                 # Remove commit entirely
exec uvwx9012 npm test                     # Run command during rebase
```

#### 2.2 Common Rebase Scenarios

```bash
# Scenario 1: Squash commits into one
pick abc123 Add feature
fixup def567 Fix typo
fixup ghi890 Fix another typo
# Result: One commit with all changes

# Scenario 2: Reorder commits
pick abc123 Add feature A
pick def456 Add feature B
# Can reorder to change order

# Scenario 3: Edit commit message
pick abc123 Update readme
reword abc123 Add better readme
# Opens editor to change message

# Scenario 4: Split a commit (advanced)
# In rebase, mark commit as "edit"
# Then git reset HEAD~
# Then git add + git commit multiple times
# Then git rebase --continue
```

### Phase 3: Safe History Cleanup

#### 3.1 Before Cleanup Checklist

```markdown
## Pre-Cleanup Safety Check

□ Is this branch local only?
□ Has it been pushed to remote?
□ Have others branched from this?
□ Is there a PR open?

If ALL NO → Safe to rewrite
If ANY YES → DO NOT rewrite, consider alternatives
```

#### 3.2 Common Safe Cleanups

```bash
# 1. Fix the last commit message
git commit --amend -m "fix(auth): correct typo in login validation"

# 2. Add forgotten file to last commit
git add forgotten-file.ts
git commit --amend --no-edit

# 3. Combine commits on a feature branch
git rebase -i HEAD~3
# Change 'pick' to 'fixup' for commits to combine

# 4. Remove a commit entirely (local only!)
git rebase -i HEAD~5
# Change 'pick' to 'drop' for commit to remove
```

### Phase 4: Handling History Rewrite Accidents

#### 4.1 Recovery Options

```bash
# REFLOG is your safety net
git reflog
# Shows all places HEAD has been
# Format: HEAD@{N} - description

# Recover a "lost" commit
git checkout abc1234  # The commit hash from reflog
# Creates detached HEAD, can branch from here
git branch recovered-work

# Or reset back to a reflog point
git reset --hard HEAD@{5}
```

#### 4.2 After Rewriting Pushed History

```markdown
## INCIDENT: Pushed History Rewritten

IMMEDIATE ACTIONS:
1. STOP - Don't push more changes
2. ASSESS - Who might have this history?
3. COMMUNICATE - Tell affected team members
4. RECOVER - Help them get back to correct state

PREVENTION:
1. Always check if branch is shared before rewriting
2. Use --force-with-lease instead of --force
3. Prefer merge over rebase for shared branches
```

## Common Scenarios

### Scenario 1: "I need to clean up before PR"

```bash
# BEFORE PR, clean up commits
git rebase -i HEAD~5

# Typical cleanup in editor:
pick abc123 Add feature
fixup def456 Fix typo in comment
fixup ghi789 Fix typo in function name
drop jkl012 WIP debugging
drop mnop345 More debugging

# Result: Clean history with 2-3 meaningful commits
```

### Scenario 2: "I accidentally committed to main"

```bash
# Oops! Committed to main instead of feature branch

# Solution 1: Move to feature branch
git branch feature-temp          # Create branch from current main
git reset --hard origin/main    # Reset main back
git checkout feature-branch       # Switch to feature
git merge feature-temp          # Merge the work
git branch -d feature-temp       # Clean up

# Solution 2: If you haven't pushed
git reset --soft HEAD~1         # Uncommit but keep staged
git stash                        # Stash the changes
git checkout feature-branch      # Switch to feature
git stash pop                   # Get changes back
```

### Scenario 3: "I need to undo a pushed commit"

```bash
# DON'T: git reset (rewrites history)
# DON'T: git rebase (rewrites history)

# DO: Use git revert (safe, creates new commit)
git revert HEAD

# This creates a NEW commit that undoes the change
# Pushes the "undo" to shared history
# Everyone can pull safely
```

## The History Rewrite Decision Checklist

```
HISTORY REWRITE DECISION CHECKLIST
===================================

□ 1. Is this history local only?
  └─ YES → Rewrite may be safe
  └─ NO → STOP, don't rewrite

□ 2. Has this been pushed?
  └─ YES → Use git revert instead
  └─ NO → Continue

□ 3. Is this a PR branch?
  └─ YES → Coordinate with reviewers
  └─ NO → Continue

□ 4. Do others have this branch checked out?
  └─ YES → Coordinate with them first
  └─ NO → Continue

□ 5. Have you created a backup?
  └─ YES → Good!
  └─ NO → git branch backup/branch-name

□ 6. Do you understand the tool you're using?
  □ git reset --hard = PERMANENT deletion
  □ git rebase -i = Interactive review
  □ git revert = Safe undo

TOOL SELECTION:
□ commit --amend → Last commit, message/content fix
□ git reset → Undo commits, keep/don't keep changes
□ git rebase -i → Multiple commits, reorder/fix/squash
□ git revert → Undo published changes safely
```

## Anti-Patterns

### 1. Rewriting Pushed History

```bash
# DANGEROUS!
git push --force

# If others have this history, you just broke their branches
# Their commits now point to commits that don't exist

# SAFER: --force-with-lease
git push --force-with-lease
# Refuses if remote has commits you don't have
# Still dangerous but slightly safer
```

### 2. Not Creating Backup

```bash
# BAD: No backup before risky operation
git reset --hard HEAD~5
# 5 commits deleted...

# GOOD: Create backup first
git branch backup-before-cleanup
git reset --hard HEAD~5
# If something goes wrong, backup exists
```

### 3. Using Filter-Branch Unnecessarily

```bash
# OVERKILL for most cases
git filter-branch --tree-filter 'rm -f password.txt'

# CONSIDER: git-filter-repo (newer, faster)
# Or: Ask if you really need this
```

## History Rewrite Workflow Patterns

### Pattern 1: Pre-PR Cleanup

```bash
# 1. Fetch latest
git fetch origin

# 2. Rebase onto latest main
git rebase -i origin/main
# OR: git merge origin/main if rebasing is complex

# 3. Clean up during rebase
# pick → use
# fixup → combine, discard message
# squash → combine, keep messages
# drop → remove

# 4. Push (may need --force-with-lease)
git push --force-with-lease origin feature-branch
```

### Pattern 2: Fixing a Mistake

```bash
# 1. If last commit not pushed
git commit --amend

# 2. If commit from a few ago, not pushed
git rebase -i HEAD~3
# Mark as 'reword' for message or 'fixup' for content

# 3. If pushed commit needs undoing
git revert HEAD
git push
```

### Pattern 3: Recovering from Accident

```bash
# 1. Check reflog
git reflog

# 2. Find the good state
git reflog | grep "your-branch"
# abc1234 your-branch: commit: Feature X
# def5678 your-branch: reset: to "origin/..."

# 3. Recover
git reset --hard abc1234
```

## Key Principles

### 1. Public History is Sacred

If others have it, don't rewrite it. Use revert instead.

### 2. Local History is Flexible

You own your local branches. Clean up before sharing.

### 3. Backup Before Risky Operations

Create a branch or tag before `reset --hard` or complex rebase.

### 4. Commit Messages Can Be Fixed

Until pushed, commit messages are editable. Do it before sharing.

### 5. Reflog Saves Lives

Even after a mistake, reflog can usually recover your work.

## Understanding git reflog

```bash
# View reflog
git reflog

# Output example:
# abc1234 HEAD@{0}: reset: moving to HEAD~2
# def5678 HEAD@{1}: commit: WIP feature
# ghi9012 HEAD@{2}: commit: More WIP
# jkl3456 HEAD@{3}: checkout: moving to feature

# Recover to specific point
git checkout HEAD@{1}

# Or reset
git reset --hard HEAD@{1}
```

## Relationship to Other Skills

- `git-branch-strategy` — Branch decisions affect history
- `git-rebase-safety` — Rebase is a form of history rewrite
- `git-merge-resolution` — Alternative to rewriting
- `git-commit` — Amending improves commit messages
- `git-stash-management` — Stashing before risky operations
