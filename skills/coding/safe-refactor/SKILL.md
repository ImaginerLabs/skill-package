---
name: safe-refactor
description: >-
  Chain-combined skill that ensures refactoring is done safely by combining refactor judgment, test coverage verification, and pre-commit review. Encapsulates the decision of WHEN to refactor, HOW to ensure safety, and WHAT verification is needed. Use when user mentions refactoring, code restructuring, improving code quality, or when they want to refactor without breaking behavior. Triggers especially when user says "should I refactor this?", "is it safe to refactor?", "how do I refactor without breaking things?", or "refactor my code".
category: coding
priority: P0
trigger_patterns:
  - "safe refactor"
  - "refactor without breaking"
  - "should I refactor"
  - "refactor checklist"
  - "refactor safety"
  - "code restructuring"
combines:
  - refactor
  - doublecheck
  - test-think
---

# Safe Refactor — Behavioral Specification for Secure Code Restructuring

## Overview

Safe-refactor is a **chain-combined behavioral specification skill** that merges:

- `refactor` — When and how to refactor judgment
- `doublecheck` — Verification and safety checks
- `test-think` — Test coverage decisions

The core judgment it encapsulates: **"How do I refactor this code while ensuring I don't change its behavior?"**

This skill embodies the mindset of an experienced developer who knows that refactoring without tests is gambling.

## Core Philosophy

### The Refactoring Contract

> "Refactoring changes the structure of code, not its behavior."

This is the fundamental contract. If behavior changes, it's not refactoring — it's a feature change or bug fix, and needs appropriate process.

### The Safety Equation

```
┌─────────────────────────────────────────────────────┐
│                    SAFE REFACTOR                     │
│                                                     │
│    Existing Tests ─────┐                            │
│                        ├──► SAFE TO REFACTOR        │
│    Coverage Good? ─────┘                            │
│                                                     │
│    Existing Tests ─────┐                            │
│                        ├──► ADD TESTS FIRST         │
│    Coverage Poor? ─────┘                            │
└─────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Phase 1: Refactor Readiness Assessment

Before touching any code, answer these questions:

#### 1.1 Why Are You Refactoring?

| Reason | Proceed? | Notes |
|--------|----------|-------|
| "Code is messy" | 😐 Maybe | Define success criteria first |
| "Hard to add feature" | ✅ Yes | Ensure tests cover feature path |
| "Performance" | ✅ Yes | Benchmark before/after |
| "Learning the code" | ✅ Yes | But don't merge until understood |
| "Just feels old" | ❌ No | YAGNI applies to structure too |

#### 1.2 What Will Change?

Map out the scope:

```markdown
## Refactoring Scope

### High-Risk Changes (Require Extra Care)
- [ ] Changing function signatures
- [ ] Moving code between modules
- [ ] Changing data structures
- [ ] Modifying shared utilities

### Medium-Risk Changes
- [ ] Extracting functions
- [ ] Renaming variables
- [ ] Reordering code

### Low-Risk Changes
- [ ] Formatting
- [ ] Comment improvements
- [ ] Renaming (non-shared)
```

#### 1.3 What's the Blast Radius?

```bash
# Find all usages
grep -r "functionName" --include="*.ts" src/

# Check if it's a shared utility
# Check how many files depend on it
```

### Phase 2: Test Coverage Verification

#### 2.1 Test Coverage Check

```markdown
## Current Test Coverage Analysis

| Module | Coverage | Tests | Action |
|--------|----------|-------|--------|
| utils.ts | 45% | 2 | Add tests before refactor |
| auth.ts | 89% | 12 | Safe to refactor |
| payment.ts | 0% | 0 | MUST add tests first |
```

#### 2.2 Critical Path Identification

Before refactoring, identify what's MOST important to keep working:

```
┌────────────────────────────────────────────────────────────┐
│                    CRITICAL PATH MAP                       │
│                                                             │
│    User ──► Login ──► Dashboard ──► Action ──► Result     │
│                    │              │                        │
│                    │              └──► Analytics           │
│                    │                                     │
│                    └──► Notifications                     │
│                                                             │
│    Must keep working: Auth, Core business logic            │
└────────────────────────────────────────────────────────────┘
```

#### 2.3 Test-Then-Refactor Protocol

For modules with poor coverage:

```
┌─────────────────────────────────────────────────────────────┐
│  UNSAFE → SAFE REFACTORING                                  │
│                                                             │
│  1. BEFORE: Write tests for current behavior                │
│     - Don't change behavior, just document it               │
│     - Tests should FAIL if behavior changes                 │
│                                                             │
│  2. REFACTOR: Make structural changes                       │
│     - Keep behavior identical                              │
│     - Tests should STILL PASS                              │
│                                                             │
│  3. AFTER: Verify all tests pass                           │
│     - If tests fail, behavior changed                      │
│     - Fix the refactor, not the tests                       │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Refactoring Execution

#### 3.1 Small Steps Protocol

**Rule: Commit after each logical step.**

```bash
# Step 1: Extract function
git commit -m "refactor: extract validateEmail from processUser"

# Step 2: Move to new module
git commit -m "refactor: move validateEmail to utils/validation"

# Step 3: Update imports
git commit -m "refactor: update imports to use utils/validation"

# Step 4: Clean up
git commit -m "refactor: remove duplicate validation"
```

**Never do multiple refactorings in one commit.**

#### 3.2 The Boy Scout Rule

> "Leave the code cleaner than you found it."

But only clean what you came to clean. Don't get distracted by other issues.

### Phase 4: Verification

#### 4.1 Pre-Commit Checklist

```
SAFE REFACTOR CHECKLIST
=======================

PRE-REFACTOR
□ Understand why you're refactoring
□ Identify blast radius
□ Ensure tests exist for critical paths
□ Coverage is acceptable (or tests added)
□ Define success criteria

DURING REFACTOR
□ Behavior unchanged (tests pass throughout)
□ Small steps, one logical change at a time
□ Tests still pass after each step
□ No shortcuts or workarounds added

POST-REFACTOR
□ All tests pass
□ Coverage maintained or improved
□ No new code smells introduced
□ Documentation updated (if needed)
□ Peer review (if high-risk)
```

#### 4.2 Behavior Verification

Run these to confirm behavior is preserved:

```bash
# Unit tests
npm test

# E2E tests (if available)
npm run test:e2e

# Manual smoke tests
- Login flow works
- Core feature works
- Error handling works
```

## Risk-Based Refactoring Strategy

### Low Risk (Self-Refactor)

| Characteristics | Examples |
|------------------|----------|
| Small scope | 1-2 files |
| No shared code | Internal to module |
| Good tests | >80% coverage |
| Well-understood | Already worked with |

**Strategy:** Refactor with care, verify with tests.

### Medium Risk (Peer Review)

| Characteristics | Examples |
|------------------|----------|
| Medium scope | 3-10 files |
| Some shared code | 2-3 consumers |
| Good tests | 60-80% coverage |
| Partially understood | Some uncertainty |

**Strategy:** Self-refactor + quick peer review before merge.

### High Risk (Must Have Review)

| Characteristics | Examples |
|------------------|----------|
| Large scope | 10+ files |
| Highly shared | 10+ consumers |
| Poor tests | <60% coverage |
| Unfamiliar code | Legacy/touch |
| Security sensitive | Auth/data |

**Strategy:** Pair programming or detailed review required.

## Common Scenarios

### Scenario 1: "I want to rename this function"

```markdown
Analysis:
- Function used in 15 files
- Medium risk

Steps:
1. [ ] Find all usages (grep)
2. [ ] Write test that calls the function (if none exists)
3. [ ] Rename the function
4. [ ] Update all references
5. [ ] Run tests
6. [ ] Commit
```

### Scenario 2: "This component is too large, I want to split it"

```markdown
Analysis:
- Single component, 500 lines
- Hooks state management
- High risk

Steps:
1. [ ] Identify logical sections (useEffect, handlers, render)
2. [ ] Write tests for the component
3. [ ] Extract one logical piece at a time
4. [ ] Create child component
5. [ ] Move related state/logic to child
6. [ ] Verify parent still works
7. [ ] Repeat until done
```

### Scenario 3: "I want to change this shared utility"

```markdown
Analysis:
- Shared by 20+ files
- Low test coverage (30%)
- HIGH RISK

Steps:
1. [ ] MUST increase test coverage first
2. [ ] Write tests for all known use cases
3. [ ] Consider if change is truly necessary
4. [ ] If yes, make smallest possible change
5. [ ] Update all consumers
6. [ ] Run full test suite
7. [ ] Mandatory peer review
```

## Key Principles

### 1. Tests Are the Contract

If you don't have tests, you can't refactor safely. Tests prove behavior is preserved.

### 2. Small Commits, Small Risk

The smaller the change, the easier to verify. Large refactors are just many small ones queued up.

### 3. If It's Hard to Test, It's Hard to Refactor

Difficult-to-test code usually has design problems. Fix the design, then refactor.

### 4. Don't Mix Refactoring with Feature Work

Separate commits for refactoring and feature changes. This makes rollback easier and review clearer.

### 5. When in Doubt, Add More Tests

The cost of tests is low. The cost of breaking production is high.

## Relationship to Other Skills

- `refactor` — The refactoring judgment this builds upon
- `doublecheck` — Verification patterns
- `test-think` — Test coverage decisions
- `pre-commit-review` — Pre-commit verification
- `debug-session` — If something goes wrong during refactor
