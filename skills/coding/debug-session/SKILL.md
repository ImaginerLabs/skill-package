---
name: debug-session
description: >-
  Chain-combined skill for systematic debugging workflow. Combines bug reproduction judgment, error analysis, execution tracing, and debugging expertise into a complete session规范. Use when user mentions debugging, fixing bugs, something not working, error messages, or when code isn't behaving as expected. Triggers especially when user says "debug this", "why is this broken", "it's not working", "error message", "something went wrong", or "help me find the bug".
category: coding
priority: P0
trigger_patterns:
  - "debug this"
  - "why is this broken"
  - "not working"
  - "error message"
  - "something went wrong"
  - "find the bug"
  - "debugging"
  - "it's throwing an error"
  - "null is not"
  - "cannot read property"
combines:
  - debug-expert
  - reproduce-bug
  - understand-error
  - trace-execution
---

# Debug Session — Systematic Bug Resolution Framework

## Overview

Debug-session is a **chain-combined behavioral specification skill** that merges:

- `debug-expert` — Expert debugging methodology
- `reproduce-bug` — Reliable bug reproduction
- `understand-error` — Error message interpretation
- `trace-execution` — Execution path tracking

The core judgment it encapsulates: **"How do I systematically find and fix this bug without introducing new ones?"**

This skill embodies the disciplined approach of an expert debugger: reproducible steps, systematic elimination, and verified fixes.

## Core Philosophy

### The Debugging Paradox

> "The bug is usually where you least expect it — which is exactly why you need to expect it everywhere."

The first rule of debugging: **Assume nothing.** The bug is in the code you wrote, not in the framework, the language, or cosmic rays.

### The Debugging Mindset

```
┌─────────────────────────────────────────────────────────────┐
│                    DEBUGGING MINDSET                        │
│                                                             │
│    MYSTERIOUS                       SYSTEMATIC               │
│         │                                │                  │
│         ▼                                ▼                  │
│    ┌─────────┐                    ┌─────────────┐           │
│    │ "How did│                    │ Facts first │           │
│    │  this   │                    │ Hypothesis  │           │
│    │  happen?"│                   │ then verify │           │
│    └─────────┘                    └─────────────┘           │
│         │                                │                  │
│         ▼                                ▼                  │
│    ┌─────────┐                    ┌─────────────┐           │
│    │ Random  │                    │  Root cause │           │
│    │ poking   │                    │  identified │           │
│    └─────────┘                    └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Phase 1: Reproduce the Bug

**Rule #1: If you can't reproduce it, you can't fix it.**

#### 1.1 Gather Information

Before anything else, collect:

```markdown
## Bug Report Summary

| Field | Value |
|-------|-------|
| Error message | [exact text] |
| When does it occur? | [steps to reproduce] |
| Frequency | [always/sometimes/once] |
| Environment | [dev/prod/browser/node] |
| Version | [git commit or version] |
```

#### 1.2 Create Minimal Reproduction

```markdown
## Reproduction Steps

1. [Step 1 - specific action]
2. [Step 2 - specific action]
3. [Step 3 - specific action]

Expected: [what should happen]
Actual: [what happens instead]
```

**The ideal reproduction:**
- Minimal code
- No unrelated code
- Same environment as production
- Can be shared with others

#### 1.3 Verify Reproduction

Before fixing, confirm you can:
- [ ] Make it happen on demand
- [ ] Make it NOT happen when you change something specific
- [ ] Run the exact same steps in a fresh environment

### Phase 2: Understand the Error

#### 2.1 Error Message Analysis

```
┌─────────────────────────────────────────────────────────────┐
│                 ERROR MESSAGE DECODER                       │
│                                                             │
│  Error: "Cannot read property 'name' of undefined"         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ WHERE │ WHAT │ WHY                                  │   │
│  ├───────┼──────┼──────────────────────────────────────┤   │
│  │ Line# │ 'name'│ 'name' property                     │   │
│  │       │       │ doesn't exist on                    │   │
│  │       │       │ the object                          │   │
│  │       │       │ returned from                        │   │
│  │       │       │ previous function                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Question: Why is the object undefined?                    │
│  Next: Trace back to find where it should have a value     │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2 Stack Trace Reading

```markdown
## Stack Trace Analysis

Error: TypeError: Cannot read property 'name'

at User.getFullName (User.ts:45)
    └── WHERE: Line 45 of User.ts

at UserController.handleRequest (UserController.ts:89)
    └── WHO CALLED: Line 89 of UserController

at Router.dispatch (Router.ts:123)
    └── HOW WE GOT HERE: ...

---

Question to ask: "What should be on line 45?"
Answer: A User object with a 'name' property

Question: "Where does the User come from?"
Answer: It's returned from UserController.handleRequest

Conclusion: UserController is passing undefined instead of a User
```

### Phase 3: Trace the Execution

#### 3.1 Follow the Data

```bash
# Find where data is created
grep -r "createUser" --include="*.ts" src/

# Find where data flows
grep -r "getFullName" --include="*.ts" src/
```

#### 3.2 State Inspection Points

```markdown
## Data Flow Map

Router ──► Controller ──► Service ──► Database
              │
              ▼
         [User object]
              │
              ▼
         [Middleware?] ──► Adds auth?
              │
              ▼
         [Handler] ──► Line 45: user.getFullName()
              │
              ▼
         ERROR: user is undefined
              │
              ▼
         WHY: Middleware didn't run?
         WHY: Service returned null?
         WHY: Database query failed?
```

#### 3.3 Breakpoint Strategy

**Where to break:**
1. Where the error occurs (line 45)
2. One step before (Controller line 89)
3. Where the data is created (Service)
4. Entry point (Router)

**What to check at each:**
- Variables exist
- Variables have expected values
- Functions return expected types

### Phase 4: Form Hypothesis

**Rule #2: If you think you found it, prove it.**

#### 4.1 Hypothesis Template

```markdown
## Hypothesis

I believe the bug is caused by:
[Specific code or condition]

My reasoning:
1. [Observation 1]
2. [Observation 2]
3. [Conclusion]

To verify this hypothesis, I will:
[Specific test or check]

If I'm right, [expected outcome]
If I'm wrong, [expected different outcome]
```

#### 4.2 Common Root Causes

| Category | Common Culprits |
|-----------|-----------------|
| Null/Undefined | Missing null checks, failed queries |
| Async | Race conditions, missing await |
| Types | Wrong type assumptions, missing casting |
| Scope | Closures, callbacks, this binding |
| State | Stale state, update timing, mutations |
| I/O | Network failures, file not found |

### Phase 5: Fix and Verify

#### 5.1 The Fix

**Rule #3: Fix the root cause, not the symptom.**

```markdown
## Bug Fix Analysis

SYMPTOM: "user.getFullName is not a function"

WRONG FIX:
user.getFullName?.()  // Masks the real problem

RIGHT FIX:
Understand WHY user is undefined
Fix THAT
Then user.getFullName() works naturally
```

#### 5.2 Verification Protocol

```
┌─────────────────────────────────────────────────────────────┐
│                   FIX VERIFICATION                           │
│                                                             │
│  1. Does the original bug still occur? (NO should be answer)│
│  2. Do existing tests still pass?                           │
│  3. Did I introduce any new bugs?                            │
│  4. Is the fix minimal? (No over-engineering)                │
│  5. Can I explain the fix in one sentence?                   │
│                                                             │
│  If all YES → Proceed                                       │
│  If any NO → Revert and reconsider                          │
└─────────────────────────────────────────────────────────────┘
```

#### 5.3 Regression Prevention

```markdown
## Regression Checklist

□ Write a test that fails with the bug
□ Apply the fix
□ Verify the test passes
□ Run full test suite
□ Test related functionality manually
□ Consider edge cases
□ Document the fix
```

## The Debug Session Protocol

### Step-by-Step Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    DEBUG SESSION WORKFLOW                    │
│                                                             │
│  1. REPRODUCE                                              │
│     └─► Gather exact error message                         │
│     └─► List exact steps to reproduce                     │
│     └─► Create minimal reproduction case                   │
│                                                             │
│  2. UNDERSTAND                                            │
│     └─► Parse the error message                            │
│     └─► Read the stack trace                               │
│     └─► Identify WHERE the error occurs                     │
│                                                             │
│  3. TRACE                                                 │
│     └─► Follow data flow backward                          │
│     └─► Identify potential failure points                   │
│     └─► Set strategic breakpoints                           │
│                                                             │
│  4. HYPOTHESIZE                                           │
│     └─► Form specific hypothesis                            │
│     └─► Identify how to verify                              │
│     └─► Test the hypothesis                                 │
│                                                             │
│  5. FIX                                                   │
│     └─► Fix root cause, not symptoms                        │
│     └─► Keep fix minimal                                   │
│     └─► Write regression test                               │
│                                                             │
│  6. VERIFY                                                │
│     └─► Original bug is fixed                               │
│     └─► No new bugs introduced                             │
│     └─► All tests pass                                     │
└─────────────────────────────────────────────────────────────┘
```

## Common Debugging Scenarios

### Scenario 1: "TypeError: Cannot read property 'x' of undefined"

```markdown
Analysis:
1. The object 'x' is being accessed on is undefined
2. Either it was never set, or set to undefined
3. Need to trace where it should have been assigned

Steps:
1. Check where object should be created
2. Add breakpoint or log there
3. Verify object exists
4. If not, trace back further
5. Find where it should come from
6. Check why it's not being passed/returned
```

### Scenario 2: "Race condition — sometimes works, sometimes doesn't"

```markdown
Analysis:
1. Non-deterministic behavior suggests timing issue
2. Usually async-related

Steps:
1. Identify async operations in the flow
2. Check for missing await
3. Check for state updates after async calls
4. Add logging at each async step
5. Reproduce consistently by adding delays
6. Fix the timing issue (usually proper await or reordering)
```

### Scenario 3: "It's not working, no error message"

```markdown
Analysis:
1. Silent failure is harder to debug
2. Usually caught in try/catch or returning wrong value

Steps:
1. Check for try/catch that swallows errors
2. Add explicit error logging
3. Check return values for error indicators
4. Add console.log at key points
5. Verify function is actually being called
6. Check for early returns
```

## Debugging Anti-Patterns

### 1. Shooting in the Dark

```typescript
// BAD: Random changes
const x = result?.data?.value ?? "default";
const y = result?.data?.value || "default";
const z = result && result.data && result.data.value;

// GOOD: Understand why x is undefined
if (!result?.data?.value) {
  console.log("result:", result);  // NOW you can see
  console.log("result.data:", result?.data);
}
```

### 2. Premature Optimization

```typescript
// BAD: "Maybe if I cache it..."
cache.set(key, computeExpensiveValue());

// GOOD: First reproduce, understand, THEN optimize
console.log("Computing for:", input); // Understand first
```

### 3. Ignoring the Stack Trace

```markdown
// BAD: "I have no idea why this error happens"
TypeError at line 45

// GOOD: Read it!
// "Error at getFullName called from UserController line 89"
```

### 4. Not Testing the Fix

```typescript
// BAD: "It seems to work now"
const result = fix();
if (result) console.log("Fixed!");

// GOOD: Write a test
it("should handle empty user gracefully", () => {
  const result = processUser(undefined);
  expect(result).toEqual({ error: "No user provided" });
});
```

## Key Principles

### 1. Reproduce Before Fix

If you can't make it fail reliably, you can't know if you fixed it.

### 2. One Variable at a Time

Change one thing, test, repeat. Multiple changes = confusing results.

### 3. Rubber Duck Debugging

Explain the problem out loud. The act of explaining forces clarity.

### 4. Trust the Evidence

Not your intuition, not your assumptions — the actual evidence from the code.

### 5. When Stuck, Go to the Source

Read the framework/library source. The bug is almost never there, but understanding leads to answers.

## Relationship to Other Skills

- `debug-expert` — Core debugging methodology
- `reproduce-bug` — Bug reproduction framework
- `understand-error` — Error message interpretation
- `trace-execution` — Execution path tracking
- `test-think` — Writing regression tests after fix
- `safe-refactor` — If fix requires structural changes
