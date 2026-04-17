---
name: git-stash-management
description: >-
  Master git stash: when to stash, how to organize stashes, naming strategies, and recovery patterns. Use when user mentions git stash, stashing changes, saving work in progress, or when they have uncommitted changes they need to set aside. Triggers especially when user says "should I stash this?", "git stash", "save my changes", "switch branches with uncommitted work", or "recover stash".
category: coding
priority: P2
trigger_patterns:
  - "should I stash this"
  - "git stash"
  - "save my changes"
  - "uncommitted changes"
  - "switch branches"
  - "stash management"
  - "recover stash"
---

# Git Stash Management — Strategic Work in Progress Handling

## Overview

Git-stash-management is a **behavioral specification skill** that encapsulates the judgment of **when to stash, how to organize stashes, and how to recover from stash mistakes**.

This skill embodies the experience of developers who've lost work to stash mishaps and know how to use stash as a temporary shelf without losing track of what's on it.

## Core Philosophy

### The Stash Mental Model

> "Git stash is a temporary shelf for your work-in-progress. Like a physical stash, it's meant for short-term storage, not long-term archiving. If something's been on your stash for more than a day, you probably should commit it."

### When Stash is the Right Tool

```
┌─────────────────────────────────────────────────────────────┐
│                    STASH APPROPRIATENESS                       │
│                                                               │
│    USE STASH WHEN:                                            │
│    ✓ Switching branches with uncommitted work                 │
│    ✓ Pulling changes when you have local work                 │
│    ✓ Temporarily setting aside work to debug                   │
│    ✓ Sharing a quick experiment with a colleague               │
│                                                               │
│    DON'T USE STASH WHEN:                                       │
│    ✗ Work is ready to commit (just commit it)                  │
│    ✗ Work has been sitting for days (commit it)                │
│    ✗ You need to track the work long-term (branch instead)    │
│    ✗ The work is complex (use a feature branch)                │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### Stash vs Commit Decision

| Condition | Action | Rationale |
|-----------|--------|-----------|
| Incomplete, will return to soon | Stash | Temporary, quick |
| Incomplete, will take days | Commit to feature branch | Better tracking |
| Ready for review | Commit | Should be tracked |
| Experimental, may discard | Stash or branch | Keep options open |
| Need to switch branches ASAP | Stash | Quick save |

### Stash vs Branch Decision

```
                    ┌─ Will you return to this work?
                    │   └─ NO → Consider committing or discarding
                    │       └─ YES → Continue
                    │
                    └─ Will it take more than a day?
                        └─ YES → Create feature branch
                        └─ NO → Continue
                                │
                                └─ Is it complex/multiple files?
                                    └─ YES → Feature branch
                                    └─ NO → Stash is fine
```

## Behavioral Specification

### Phase 1: Stash Creation

#### 1.1 Basic Stash

```bash
# Stash current working directory changes
git stash

# Stash with a message (recommended!)
git stash push -m "WIP: user authentication module"

# Stash specific files
git stash push -m "WIP: auth changes" src/auth.ts src/login.ts

# Stash including untracked files
git stash push -m "WIP: with new files" -u
```

#### 1.2 Stash Organization

```bash
# Create organized stashes
git stash push -m "feature/auth:WIP - need to test"
git stash push -m "bugfix/login:WIP - edge case handling"
git stash push -m "refactor:WIP - extracted helper"

# Use prefixes for organization
git stash push -m "WIP/feature:user-profile"
git stash push -m "DEBUG/stuck-on:memory-leak"
git stash push -m "TEMP/test:mocking-strategy"
```

### Phase 2: Stash Listing and Inspection

#### 2.1 Finding Your Stash

```bash
# List all stashes
git stash list

# Output example:
# stash@{0}: WIP feature/auth:WIP - need to test
# stash@{1}: On main: "fix/typo: last week"
# stash@{2}: On feature/user-profile: "temp changes"

# Inspect a specific stash
git stash show -p stash@{0}

# Quick peek at what's in stash
git stash show stash@{0}
```

#### 2.2 Stash Content Analysis

```markdown
## Stash Analysis

stash@{0}: WIP feature/auth - incomplete login flow

Contents:
- src/auth/login.ts (modified)
- src/auth/register.ts (modified)
- tests/auth.test.ts (modified)

Not included (use -u):
- src/auth/new-file.ts (untracked)

Message clarity: 6/10
Recommendation: Improve message
```

### Phase 3: Stash Recovery

#### 3.1 Apply vs Pop

```bash
# Apply stash to current branch (keeps stash in list)
git stash apply stash@{0}

# Pop stash (removes from list after applying)
git stash pop

# Pop specific stash (doesn't remove others)
git stash pop stash@{2}

# Apply to different branch
git stash branch new-branch stash@{0}
# Creates new branch from stash's commit point
```

#### 3.2 Selective Recovery

```bash
# Apply only specific files from stash
git stash show -p stash@{0} | git apply --3way -- <(git stash show -p stash@{0} -- src/auth.ts)

# Manual selective recovery
git stash show -p stash@{0} > /tmp/stash.patch
# Edit patch to keep only wanted changes
git apply /tmp/stash.patch
```

### Phase 4: Stash Cleanup

#### 4.1 Safe Cleanup

```bash
# Remove single stash (carefully!)
git stash drop stash@{0}

# Clear all stashes (DANGEROUS!)
git stash clear

# Remove multiple old stashes
git stash drop stash@{5}
git stash drop stash@{6}
```

#### 4.2 Stale Stash Detection

```bash
# Find stashes older than 1 week
git stash list | while read line; do
  # Check date if stored
  echo "$line"
done

# Typical pattern: stash@{N} format
# Older than 2 weeks = consider cleaning up
```

## Common Scenarios

### Scenario 1: "I need to switch branches but have uncommitted work"

```bash
# Step 1: Assess the work
git status

# Step 2: If ready to commit, commit it
git add .
git commit -m "WIP: incomplete feature"

# Step 3: If truly temporary, stash it
git stash push -m "WIP/feature:$(date +%Y-%m-%d)"

# Step 4: Switch branches
git checkout other-branch

# Step 5: When ready, recover
git stash pop
```

### Scenario 2: "I accidentally dropped a stash"

```bash
# Oops! Lost stash@{0}
# Check reflog for dropped stashes
git reflog | grep stash

# Output might show:
# abc1234 stash@{0}: WIP feature/auth
# def5678 stash@{1}: On main: "fix/typo"

# Recover from reflog
git stash apply abc1234
# or
git stash apply stash@{0}
```

### Scenario 3: "I have too many stashes, which should I clean?"

```markdown
## Stash Audit

Current stashes:
1. stash@{0}: "WIP feature/auth - yesterday" → KEEP (active)
2. stash@{1}: "DEBUG/stuck-on:middleware - 3 days ago" → EVALUATE
3. stash@{2}: "temp test - last week" → LIKELY DELETE
4. stash@{3}: "On main: 'fix/typo' - 2 weeks ago" → DELETE

Decision:
- Active work: Keep stash@{0}
- In-progress debugging: Finish or commit within 24h
- Old experiments: Delete or commit
- Very old: Delete
```

## The Stash Management Checklist

```
STASH MANAGEMENT CHECKLIST
===========================

□ 1. Is this ready to commit?
  └─ YES → COMMIT instead of stash

□ 2. Will you work on this again within 24h?
  └─ NO → Consider feature branch or commit

□ 3. Is the stash message descriptive?
  └─ Include what/why context

□ 4. Can you find this stash later?
  └─ Good message + not too many stashes

□ 5. Have you checked for this stash recently?
  └─ Monthly audit of old stashes

□ 6. Do you have too many stashes?
  └─ > 5 stashes = time to clean up

CLEANUP HABITS:
□ Review stashes monthly
□ Delete after use
□ Don't let stashes get stale
```

## Anti-Patterns

### 1. Stash and Forget

```bash
# BAD: Stash that becomes lost forever
git stash push -m "temp"
# ... 3 months later ...
git stash list
# "Where did that temp stash go?" 😅

# GOOD: Clear purpose, timely recovery
git stash push -m "DEBUG/memory-leak: investigate tomorrow"
# Do the work tomorrow
git stash pop
```

### 2. Cryptic Messages

```bash
# BAD: Meaningless messages
git stash
git stash push -m "changes"
git stash push -m "WIP"
git stash push -m "temp2"

# GOOD: Descriptive messages
git stash push -m "DEBUG/auth-redirect: testing flow"
git stash push -m "WIP/feature:user-profile - need test data"
```

### 3. Stash Hoarding

```bash
# BAD: 20 stashes, can't find anything
git stash list
# stash@{0} to stash@{19} of varying ages...

# GOOD: Maximum 3-5 stashes
# Clean up after use
git stash drop stash@{0}  # After recovery
```

## Stash Workflow Patterns

### Pattern 1: Quick Switch

```bash
# Quick save before switch
git stash push -m "WIP:$(basename $(pwd))"
git checkout other-branch
# ... work ...
git stash pop
```

### Pattern 2: Debug Interruption

```bash
# Interruption workflow
git stash push -m "DEBUG/stuck:$(git diff --stat HEAD | head -1)"
# ... debug the issue ...
git stash pop
# Continue from where you left off
```

### Pattern 3: Feature Branch Stash

```bash
# Create branch from stash point
git stash branch new-feature stash@{0}
# Now you have:
# - A new branch based on stash's parent
# - Stash automatically popped
```

## Key Principles

### 1. Stash is Temporary

It's a shelf, not a shelf in your basement. If it sits there for more than a few days, move it somewhere better (a branch).

### 2. Message Everything

Even `git stash` without a message creates a stash, but you'll never know what it was later.

### 3. Pop or Apply, Don't Leave Hanging

When you create a stash with intention to use it, make sure you actually apply it.

### 4. Clean Regularly

Audit your stashes weekly. Delete what you don't need.

### 5. Stashes Can Be Recovered

Unlike some operations, dropped stashes can often be recovered from reflog. But it's easier not to lose them in the first place.

## Relationship to Other Skills

- `git-branch-strategy` — Alternative to stash for longer-term work
- `git-commit` — When work is ready, commit instead
- `git-rebase-safety` — Stash during rebase conflicts
- `debug-session` — Stashing to debug without losing context
