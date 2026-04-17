---
name: reproduce-bug
description: >-
  Master reliable bug reproduction: how to construct minimal reproduction cases, isolate conditions, and verify bugs consistently. Use when debugging, creating bug reports, or when a bug is hard to reproduce. Triggers especially when user says "reproduce bug", "can't reproduce", "minimal case", "bug report", or "isolating the bug".
category: coding
priority: P2
trigger_patterns:
  - "reproduce bug"
  - "can't reproduce"
  - "minimal case"
  - "bug report"
  - "isolating the bug"
  - "reproduction steps"
---

# Reproduce Bug — Systematic Bug Reproduction Framework

## Overview

Reproduce-bug is a **behavioral specification skill** that encapsulates the methodology for **creating reliable, minimal bug reproduction cases that can be used for debugging, testing, and reporting**.

This skill embodies the discipline of developers who've spent hours on bugs they couldn't reproduce and know that a good reproduction case is half the debugging battle.

## Core Philosophy

### The Reproduction Principle

> "If you can't reproduce it, you can't fix it. If you can reproduce it reliably, you're already halfway to fixing it."

### Reproduction Quality Spectrum

```
┌─────────────────────────────────────────────────────────────┐
│                  REPRODUCTION QUALITY                          │
│                                                               │
│  UNRELIABLE:                RELIABLE:                         │
│  ───────────                ─────────                         │
│  "It happens sometimes"     "Steps 1-2-3 always reproduce"    │
│  "On my machine it works"  "Confirmed on clean environment"  │
│  "After many clicks"        "First click reproduces"         │
│                                                               │
│  Unreliable reproduction = Unreliable fix                   │
│  Reliable reproduction = Fixable problem                     │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### Is This Reproducible?

```markdown
## Reproduction Assessment

| Question | If NO | If YES |
|----------|-------|--------|
| Can you make it happen on demand? | Investigate conditions | You have reproduction |
| Does it happen in clean environment? | Environment issue? | Proceed with fix |
| Is it consistent? | Flaky test or race | Add to known issues |
| Can you minimize it? | Reduce dependencies | Minimal case found |
```

### When Reproduction is Hard

| Situation | Strategy |
|-----------|----------|
| Race condition | Add delays, repeat many times |
| Timing dependent | Mock time, slow down execution |
| Environment specific | Docker, VM, clean install |
| Data dependent | Find minimal data trigger |
| User interaction | Script the exact interaction |

## Behavioral Specification

### Phase 1: Gather Information

#### 1.1 Initial Questions

```markdown
## Bug Report Template

**What were you doing?**
[Describe actions]

**What happened?**
[Describe error/behavior]

**What should happen?**
[Describe expected]

**How often does this happen?**
- [ ] Always
- [ ] Sometimes (1 in ___ times)
- [ ] Only on specific data
- [ ] Only in specific environment

**What have you tried?**
[Attempts to reproduce]
```

#### 1.2 Environment Snapshot

```markdown
## Environment Information

| Item | Value |
|------|-------|
| Browser / Version | Chrome 120 |
| OS | macOS 14 |
| Node version | 18.17.0 |
| Branch | main |
| Commit | abc1234 |
| Date/Time | 2024-04-17 10:30 UTC |
```

### Phase 2: Isolate the Variables

#### 2.1 Variable Checklist

```markdown
## Isolation Variables

□ User state (logged in? permissions?)
□ Data state (specific record? any record?)
□ Time state (after midnight? business hours?)
□ Network state (slow? offline?)
□ Browser state (cache? cookies?)
□ Session state (new session? resumed?)
□ Configuration (feature flags? env vars?)
□ Dependencies (versions? recent updates?)
```

#### 2.2 Systematic Elimination

```typescript
// Start with FULL conditions that cause bug
const conditions = {
  userState: 'logged_in',
  dataState: 'specific_user_123',
  networkState: 'slow_3g',
  timeState: 'after_midnight',
  // ... all conditions
};

// ELIMINATE one at a time
// Does bug still happen without X?

// If yes → X was not the cause
// If no → X IS required for bug

// Continue until minimal set found
```

### Phase 3: Create Minimal Reproduction

#### 3.1 Minimal Case Principles

```typescript
// BAD: Reproduction with too much code
async function reproduce() {
  // 500 lines of setup
  // 10 dependencies
  // Complex state

  // Bug happens somewhere in there
}

// GOOD: Minimal reproduction
async function reproduce() {
  // Only essential setup
  // Only what triggers bug
  // Clear, focused test

  // Bug is isolated and clear
}
```

#### 3.2 Building Minimal Case

```typescript
// STEP 1: Start with failing case
// Your current app state when bug occurs

// STEP 2: Remove non-essential parts
// Can you remove X and still reproduce?
// Remove Y?

// STEP 3: Reduce data to minimum
// Does user "John Doe" work? → No
// Does user { id: 1 } work? → No (smaller!)
// Does any user work? → Yes (minimal!)

// STEP 4: Isolate the function
// Call the function directly
// Remove event handlers, middleware

// RESULT: A minimal, focused reproduction
```

#### 3.3 The Minimal Test Template

```typescript
// Minimal reproduction test
describe('Bug Reproduction', () => {
  it('should reproduce the issue', async () => {
    // MINIMAL SETUP: Only what you need

    // Step 1: Setup
    const state = minimalState; // As small as possible

    // Step 2: Action
    const result = functionUnderTest(state);

    // Step 3: Verify bug
    expect(result).toBe(expectedBuggyBehavior);
  });
});
```

### Phase 4: Verify Reproduction

#### 4.1 Verification Checklist

```markdown
## Reproduction Verification

□ Can you make it fail on demand?
  └─ Run test 3 times, all fail

□ Is it consistent?
  └─ No randomness causes intermittent passes

□ Is it isolated?
  └─ No dependencies on other tests
  └─ No shared state

□ Is it minimal?
  └─ Can't remove anything else
  └─ All setup is essential

□ Can others verify?
  └─ Share reproduction steps
  └─ Someone else runs it
```

#### 4.2 Creating a Reproduction Script

```typescript
// repro-bug-123.ts
// Run with: npx ts-node repro-bug-123.ts

async function main() {
  console.log('Starting reproduction...');

  // 1. Minimal setup
  const testDb = await createTestDatabase();

  // 2. Specific seed data
  await testDb.users.create({
    id: 'user-minimal',
    name: 'Test User',
  });

  // 3. Execute
  const result = await processUser('user-minimal');

  // 4. Observe
  console.log('Result:', result);
  console.log('Expected: BUG to occur');

  // 5. Exit with error if bug doesn't occur
  if (result.status !== 'error') {
    console.error('BUG NOT REPRODUCED!');
    process.exit(1);
  }

  console.log('BUG REPRODUCED SUCCESSFULLY');
}

main();
```

## Common Scenarios

### Scenario 1: "It only happens in production"

```markdown
## Production-Only Issue Strategy

1. GET PRODUCTION DATA
   - Anonymize sensitive parts
   - Create minimal reproduction

2. GET PRODUCTION ENVIRONMENT
   - Docker image
   - Environment variables
   - Version numbers

3. REPRODUCE LOCALLY
   docker run --env-from-file .env.production production-image
   # Or: npm run start:production

4. REDUCE
   - Find minimal env vars needed
   - Find minimal data needed
   - Find minimal steps needed

5. FIX AND VERIFY
   - Apply fix locally
   - Test against reproduction
   - Deploy
```

### Scenario 2: "Race condition - happens randomly"

```typescript
// Strategy: Force the race to happen

// 1. Add artificial delays
await delay(1); // Slow down first operation
await delay(0); // Speed up second operation

// 2. Run many times
for (let i = 0; i < 100; i++) {
  const result = raceCondition();
  if (result.bug) {
    console.log(`Reproduced on iteration ${i}`);
    break;
  }
}

// 3. Find the timing window
// Once you know the window, you can reproduce reliably

// 4. Create minimal reproduction
// With fixed delay, bug always happens
```

### Scenario 3: "Bug with specific data"

```typescript
// Strategy: Binary search on data

// Start: Full data that triggers bug
const fullData = { /* 50 fields */ };

// Binary search: Remove half
const half1 = { /* 25 fields */ }; // Bug still happens
// → Bug is in first half
const quarter1 = { /* 12 fields */ }; // Bug still happens
// → Continue...

// Continue until minimal
const minimalData = { fieldA: "value", fieldB: 123 }; // Bug!

// Now you know: Only fieldA and fieldB matter
```

### Scenario 4: "Can't find the trigger"

```markdown
## When You Don't Know When It Happens

1. ADD TELEMETRY
   console.log('About to do X');
   // After each significant step

2. CAPTURE STATE AT FAILURE
   } catch (error) {
     console.error('State at failure:', {
       timestamp: new Date().toISOString(),
       stack: error.stack,
       relevantVariables: { ... }
     });
   }

3. ANALYZE PATTERNS
   - Same time each day?
   - Same user actions?
   - Same data?
   - Same load?

4. NARROW DOWN
   - Start broad, narrow each hypothesis
```

## The Reproduction Report

### Template

```markdown
## Bug Reproduction Report

**Bug ID:** [Link to issue tracker]

**Summary:** [One sentence description]

**Environment:**
- [OS, Browser, Node version]
- [Branch, Commit]

**Reproduction Rate:** [100% / 50% / 1 in 10]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What happens instead]

**Minimal Reproduction:**
[Code that reproduces the bug]

**Root Cause (suspected):**
[If known]
```

### Example

```markdown
## Bug Reproduction Report

**Bug ID:** ISSUE-456

**Summary:** User deletion fails when user has orders

**Environment:**
- macOS 14, Chrome 120, Node 18.17
- main branch, commit abc1234

**Reproduction Rate:** 100%

**Steps to Reproduce:**
1. Create user
2. Create order for that user
3. Attempt to delete user
4. Error: "Cannot delete user with orders"

**Expected Behavior:**
User should be deleted (or cascade delete)

**Actual Behavior:**
Error thrown, user not deleted

**Minimal Reproduction:**
```typescript
const user = await createUser({ name: 'Test' });
const order = await createOrder({ userId: user.id });
await deleteUser(user.id); // Throws error
```

**Root Cause:**
Missing cascade delete on user->orders relationship
```

## Key Principles

### 1. Reproduce Before Fixing

Never try to fix without reproduction. You'll never know if you succeeded.

### 2. Minimal is Better

Small reproduction is easier to understand and debug.

### 3. Document the Conditions

What specific thing triggers this? Clear conditions = clear fix.

### 4. Shareable Reproduction

If you can't hand this to someone and have them reproduce it, it's not complete.

### 5. Verify the Fix

After fixing, run reproduction again. Should now pass.

## Anti-Patterns

### 1. "It Works on My Machine"

```typescript
// BAD: Not helping
console.log('Works on my machine');

// GOOD: Find the difference
// Check versions, environment, data
// "Works on my machine because I have different data"
```

### 2. Over-Complex Reproduction

```typescript
// BAD: Reproduction is as complex as original
const bug = await reproduceBug({
  users: await createUsers(100),
  orders: await createOrders(1000),
  products: await createProducts(500),
  // ... 50 more setup steps
});

// GOOD: Minimal
const bug = await reproduceBug({
  user: { id: 'test' },
  order: { userId: 'test' },
});
```

### 3. Non-Deterministic Reproduction

```typescript
// BAD: Random behavior claimed as bug
// "It happens sometimes randomly"

// GOOD: Find the condition
// "Bug happens when operation A completes before operation B"
// "With delay(100) between A and B, it happens 100%"
```

## Relationship to Other Skills

- `debug-session` — Uses reproduction as first step
- `understand-error` — Error message guides reproduction
- `trace-execution` — Traces how bug occurs
- `debug-test` — Tests verify bug fix
- `inspect-state` — State inspection for isolation
