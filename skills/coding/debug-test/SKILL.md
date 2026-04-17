---
name: debug-test
description: >-
  Master debugging failing tests: when tests fail, how to determine if it's a real bug or test issue, and how to fix test problems without breaking production code. Use when tests fail, test debugging, fixing broken tests, or when tests don't work as expected. Triggers especially when user says "test failed", "debug test", "fix test", "test not working", "why is this test failing".
category: coding
priority: P2
trigger_patterns:
  - "test failed"
  - "debug test"
  - "fix test"
  - "test not working"
  - "why is this test failing"
  - "test debugging"
---

# Debug Test — Test Failure Analysis Framework

## Overview

Debug-test is a **behavioral specification skill** that encapsulates the methodology for **systematically debugging failing tests to determine if the failure is a real bug or a test problem**.

This skill embodies the expertise of developers who've spent hours chasing phantom test bugs and know the discipline of separating "my code is broken" from "my test is wrong."

## Core Philosophy

### The Debugging First Principle

> "When a test fails, your first question should be: 'Is my test testing what I think it's testing?' The answer is 'not always' more often than you'd think."

### Test Failure Types

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST FAILURE CATEGORIES                    │
│                                                               │
│  REAL BUG IN CODE:          TEST PROBLEM:                     │
│  ─────────────────          ─────────────                      │
│  • Code doesn't work       • Test checks wrong thing          │
│  • Logic is wrong           • Test has wrong assertion        │
│  • Edge case not handled    • Test data is wrong              │
│  • Type error               • Test is flaky                  │
│                                                               │
│  BOTH:                             NEITHER:                     │
│  • Code was right, test was vague      • Environment issue    │
│  • Both code and test wrong           • Tooling issue         │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### The Test Failure Diagnosis Tree

```
                    ┌─ Does test pass locally?
                    │   └─ NO → Continue
                    │       └─ YES → Check CI environment
                    │
                    └─ Is test flaky?
                        └─ YES → Flaky test pattern
                        └─ NO → Continue
                                │
                                └─ Does the failing assertion make sense?
                                    └─ NO → Test problem
                                    └─ YES → Continue
                                            │
                                            └─ Is the code logic correct?
                                                └─ YES → Test problem
                                                └─ NO → Real bug
```

## Behavioral Specification

### Phase 1: Initial Assessment

#### 1.1 Gather Information

```markdown
## Test Failure Report

| Field | Value |
|-------|-------|
| Test name | should_return_user_when_id_exists |
| File | users.test.ts |
| Line | 42 |
| Error type | expect(received).toBe(expected) |
| Expected | { id: "123", name: "Alice" } |
| Received | { id: "123", name: "Alice" } |

Note: Objects look same but test fails...
```

#### 1.2 First Checks

```typescript
// Check 1: Are objects actually equal?
// Deep equality vs reference equality
expect(user).toBe(expectedUser); // Reference
expect(user).toEqual(expectedUser); // Deep (usually what you want)

// Check 2: Is there a type coercion issue?
// "1" vs 1
// true vs "true"
// null vs undefined

// Check 3: Are you comparing what you think?
console.log("Expected:", JSON.stringify(expected, null, 2));
console.log("Received:", JSON.stringify(received, null, 2));
```

### Phase 2: Isolate the Problem

#### 2.1 Simplify the Test

```typescript
// ORIGINAL (complex)
it("should process complex order correctly", () => {
  const order = createComplexOrder({ ... });
  const result = processOrder(order, options, context);
  expect(result.status).toBe("shipped");
  expect(result.trackingNumber).toMatch(/^TRACK-/);
  // More assertions...
});

// SIMPLIFIED (isolate)
it("should process order", () => {
  const order = { status: "pending" }; // Minimal
  const result = processOrder(order);
  expect(result.status).toBe("processing"); // Test one thing
});
```

#### 2.2 Add Diagnostic Logging

```typescript
it("should calculate total correctly", () => {
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ];

  console.log("Input items:", items);
  const total = calculateTotal(items);
  console.log("Calculated total:", total);
  console.log("Expected:", 35); // 10*2 + 5*3 = 35

  expect(total).toBe(35);
});
```

#### 2.3 Test in Isolation

```typescript
// BEFORE: Full system test
it("should work with database", async () => {
  const result = await fullIntegrationTest();
  // Too many variables
});

// AFTER: Unit test
it("should calculate total", () => {
  const calculator = new OrderCalculator(mockLogger);
  const result = calculator.calculateTotal(items);
  // Isolated, clear failure point
});
```

### Phase 3: Common Test Problems

#### 3.1 Wrong Assertion Type

```typescript
// ❌ PROBLEM: Checking reference, not value
const user1 = { name: "Alice" };
const user2 = { name: "Alice" };
expect(user1).toBe(user2); // Fails! Different objects

// ✅ FIX: Check value
expect(user1).toEqual(user2); // Passes! Same values

// ❌ PROBLEM: toBe for objects
expect({ a: 1 }).toBe({ a: 1 }); // Fails!

// ✅ FIX: toEqual for objects
expect({ a: 1 }).toEqual({ a: 1 }); // Passes!
```

#### 3.2 Async Issues

```typescript
// ❌ PROBLEM: Not waiting for async
it("should update user", async () => {
  await updateUser({ id: "1", name: "Bob" });
  const user = getUser("1");
  expect(user.name).toBe("Bob"); // Might pass/fail randomly
});

// ✅ FIX: Properly await
it("should update user", async () => {
  await updateUser({ id: "1", name: "Bob" });
  const user = await getUser("1"); // Await here too!
  expect(user.name).toBe("Bob");
});

// ❌ PROBLEM: Forgotten async
it("should return promise", () => {
  const promise = fetchData(); // Returns promise
  expect(promise).resolves.toEqual(data); // Missing async/await
});

// ✅ FIX: Handle promise correctly
it("should return promise", async () => {
  const promise = fetchData();
  await expect(promise).resolves.toEqual(data);
});
```

#### 3.3 Mock Configuration Errors

```typescript
// ❌ PROBLEM: Mock not configured correctly
const mockRepo = {
  findById: vi.fn(), // No return value!
};
// Test fails because findById returns undefined

// ✅ FIX: Configure mock properly
const mockRepo = {
  findById: vi.fn().mockResolvedValue(testUser),
};

// ❌ PROBLEM: Mock not reset between tests
beforeEach(() => {
  // Forgot to clear mocks!
});
it("calls repo", () => {
  service.getUser("1");
  expect(mockRepo.findById).toHaveBeenCalled(); // Passes from previous test?
});

// ✅ FIX: Always reset mocks
beforeEach(() => {
  vi.clearAllMocks();
});
```

#### 3.4 Test Data Issues

```typescript
// ❌ PROBLEM: Test data not matching expectations
const user = {
  name: "Alice",
  email: null, // What test expects?
};
// Test expects email to be defined

// ✅ FIX: Ensure test data matches scenario
const user = {
  name: "Alice",
  email: "alice@example.com",
};
```

### Phase 4: Real Bug vs Test Bug

#### 4.1 Indicators of Real Bug

```markdown
## Real Bug Signals

□ Code logic can be manually verified wrong
□ Edge case not handled in code
□ Type mismatch causing issues
□ Expected behavior not implemented
□ Integration with external system broken

Example:
Code: if (user.isActive && user.isAdmin) // Should be OR
Test: Expect admin panel to show for admin user
Failure: isActive=false, isAdmin=true → fails
Conclusion: Real bug (wrong operator)
```

#### 4.2 Indicators of Test Bug

```markdown
## Test Bug Signals

□ Test assertions don't match spec
□ Test data doesn't match scenario
□ Wrong assertion type (toBe vs toEqual)
□ Missing async/await
□ Mock not configured correctly
□ Test checks implementation, not behavior

Example:
Code: Returns user object correctly
Test: expect(user).toBe({ name: "Alice" }) // Reference check!
Failure: Same values but different object reference
Conclusion: Test bug (wrong assertion)
```

#### 4.3 Decision Framework

```
┌─────────────────────────────────────────────────────────────┐
│                   REAL BUG vs TEST BUG                        │
│                                                               │
│  1. Can you manually verify the expected behavior?            │
│     └─ NO → Test problem or unclear spec                     │
│     └─ YES → Continue                                        │
│                                                               │
│  2. Does changing the test fix the problem?                  │
│     └─ YES, but test seems correct → Test problem            │
│     └─ NO → Real bug in code                                │
│                                                               │
│  3. Does the code match requirements?                         │
│     └─ NO → Real bug                                         │
│     └─ YES, but test fails → Test problem                    │
└─────────────────────────────────────────────────────────────┘
```

## Common Scenarios

### Scenario 1: "toBe vs toEqual"

```typescript
// FAILING TEST
it("should create user", () => {
  const user = createUser({ name: "Alice" });
  expect(user).toBe({ name: "Alice" }); // Reference check!
});

// WHY IT FAILS:
// toBe checks reference (are they the SAME object?)
// user is a new object created by createUser()
// { name: "Alice" } is a different object in memory

// FIX
it("should create user", () => {
  const user = createUser({ name: "Alice" });
  expect(user).toEqual({ name: "Alice" }); // Value check!
});
```

### Scenario 2: "Mock not being called"

```typescript
// FAILING TEST
it("should call logger", () => {
  const mockLogger = { info: vi.fn() };
  const service = new Service(mockLogger);

  service.doSomething();

  expect(mockLogger.info).toHaveBeenCalled(); // Fails!
});

// DEBUG
it("should call logger", () => {
  const mockLogger = { info: vi.fn() };
  const service = new Service(mockLogger);

  service.doSomething();

  console.log("Calls:", mockLogger.info.mock.calls); // []
  // Info was never called...

  // FIX: Check if the code actually calls logger.info
  // Maybe it calls logger.debug instead?
  // Or maybe doSomething doesn't actually log?
});
```

### Scenario 3: "Flaky test that sometimes passes"

```typescript
// FLAKY TEST
it("should return users", async () => {
  const users = await fetchUsers();
  expect(users.length).toBeGreaterThan(0);
});

// WHY FLAKY:
// fetchUsers() returns users from database
// Database might be empty in some test runs

// FIX: Ensure consistent state
beforeEach(async () => {
  await seedTestDatabase(); // Ensure known state
});

it("should return users", async () => {
  const users = await fetchUsers();
  expect(users.length).toBeGreaterThan(0); // Now reliable
});
```

### Scenario 4: "Test passes but code is wrong"

```typescript
// PASSING TEST (but code is buggy!)
it("should double numbers", () => {
  expect(double(2)).toBe(4);
  expect(double(3)).toBe(6);
});

function double(n) {
  return n + 1; // Bug! Should be n * 2
}

// WHY TEST PASSES:
// double(2) = 3 ≈ 4? No wait... actually 2+1=3, not 4
// Oh wait, it would fail...

// The point: Sometimes bugs cancel out
// Test has implicit bug that makes it pass despite code bug

// FIX: Better test coverage
it("should double numbers", () => {
  expect(double(2)).toBe(4);  // 2*2=4
  expect(double(0)).toBe(0);   // 0*2=0
  expect(double(-1)).toBe(-2); // -1*2=-2
});
```

## The Test Debugging Checklist

```
TEST DEBUGGING CHECKLIST
========================

□ 1. Isolate the failing test
□ 2. Run only this test (not entire suite)
□ 3. Add diagnostic logging
□ 4. Verify expected vs actual values
□ 5. Check assertion type (toBe vs toEqual)
□ 6. Verify async/await is correct
□ 7. Check mock configuration
□ 8. Verify test data is correct
□ 9. Can you manually verify expected behavior?
□ 10. Is this a real bug or a test bug?

IF REAL BUG:
□ Create minimal reproduction
□ Fix the code
□ Add regression test
□ Verify test passes after fix

IF TEST BUG:
□ Fix the test
□ Verify test fails with buggy code
□ Verify test passes with fixed code
□ Consider: Is there a real bug the test missed?
```

## Anti-Patterns

### 1. Ignoring Flaky Tests

```typescript
// ❌ BAD: "It passes sometimes, good enough"
it.failing("should work", () => { ... });

// ✅ GOOD: Fix or mark explicitly
it("should work - KNOWN ISSUE: flaky on CI", () => {
  // File issue, fix later
  // Or fix the race condition
});
```

### 2. Changing Tests to Pass

```typescript
// ❌ BAD: "Just change the test to match whatever code does"
expect(code).toBe(whateverCodeDoes); // Now always passes!

// ✅ GOOD: Verify code is correct, then update test if needed
// Or: If requirements changed, update both
```

### 3. Not Testing the Fix

```typescript
// ❌ BAD: Fix code, don't verify test
// Code was fixed
git commit -m "Fix bug"
// Test still fails because it was wrong!

// ✅ GOOD: Verify test fails on buggy code, passes on fixed code
```

## Key Principles

### 1. Trust Tests, But Verify

If a test fails, assume the test is correct. But verify before changing code.

### 2. Isolation First

Isolate the failing test. Don't run the whole suite while debugging.

### 3. Divide and Conquer

Comment out assertions one by one to find which specific check fails.

### 4. Manual Verification

Before fixing, manually verify what the code SHOULD do. This prevents fixing tests incorrectly.

### 5. Both Fail Together

When you find a bug, always ask: "Is there a test that should have caught this?"

## Relationship to Other Skills

- `test-think` — Determines what tests are needed
- `generate-mock` — Mock issues often cause test failures
- `setup-test-data` — Wrong test data is a common cause
- `debug-session` — General debugging methodology
- `understand-error` — Error messages hint at the problem
