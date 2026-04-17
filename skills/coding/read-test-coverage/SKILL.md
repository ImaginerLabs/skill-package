---
name: read-test-coverage
description: >-
  Master reading test coverage reports: how to interpret coverage metrics, understand what they mean, and identify untested gaps. Use when analyzing code coverage, identifying test gaps, or when coverage numbers don't match expectations. Triggers especially when user says "test coverage", "coverage report", "interpret coverage", "untested code", or "what's not tested".
category: coding
priority: P2
trigger_patterns:
  - "test coverage"
  - "coverage report"
  - "interpret coverage"
  - "untested code"
  - "what's not tested"
  - "coverage analysis"
---

# Read Test Coverage — Coverage Report Interpretation Framework

## Overview

Read-test-coverage is a **behavioral specification skill** that encapsulates the methodology for **effectively reading and interpreting test coverage reports to identify testing gaps and understand actual test quality**.

This skill embodies the experience of developers who've chased 100% coverage thinking it meant quality, only to find bugs in the covered code, and know that coverage is a tool, not a goal.

## Core Philosophy

### The Coverage Truth

> "Coverage tells you what code was EXECUTED, not what was TESTED. You can have 100% coverage and test nothing meaningful."

### Coverage vs Quality

```
┌─────────────────────────────────────────────────────────────┐
│               COVERAGE vs TEST QUALITY                       │
│                                                               │
│    HIGH COVERAGE + HIGH QUALITY:                            │
│    ✓ Code is exercised                                       │
│    ✓ Edge cases covered                                      │
│    ✓ Assertions verify behavior                             │
│                                                               │
│    HIGH COVERAGE + LOW QUALITY:                              │
│    ✓ Code is exercised                                       │
│    ✗ No meaningful assertions                                │
│    ✗ Tests pass but don't verify                            │
│    Example: expect(true).toBe(true)                         │
│                                                               │
│    LOW COVERAGE + HIGH QUALITY:                              │
│    ⚠ Code not executed (missing tests)                     │
│    ✓ Tests that exist are excellent                         │
│    → Focus: Add tests for critical paths                    │
│                                                               │
│    LOW COVERAGE + LOW QUALITY:                              │
│    ✗ Code not tested                                         │
│    ✗ Existing tests are weak                                │
│    → Priority: Both need work                               │
└─────────────────────────────────────────────────────────────┘
```

## Coverage Metrics Explained

### Types of Coverage

| Metric | What It Measures | Good For |
|--------|------------------|----------|
| **Line Coverage** | Lines executed | Quick check |
| **Branch Coverage** | Decision branches taken | Finding untested if/else |
| **Function Coverage** | Functions called | Finding dead code |
| **Statement Coverage** | Individual statements | Detailed analysis |
| **Path Coverage** | Execution paths | Comprehensive testing |

### Interpreting Numbers

```
┌─────────────────────────────────────────────────────────────┐
│                    COVERAGE INTERPRETATION                   │
│                                                               │
│    100% LINE COVERAGE:                                      │
│    → Every line ran                                          │
│    → Does NOT mean every scenario                           │
│    → "Exercised" ≠ "Tested"                                │
│                                                               │
│    80% LINE COVERAGE:                                        │
│    → 20% of lines never executed                            │
│    → Look at WHICH 20%                                      │
│    → High-risk untested code?                               │
│                                                               │
│    BRANCH < LINE:                                            │
│    → Some branches not taken (if/else imbalance)           │
│    → Find and add missing test cases                       │
│                                                               │
│    FUNCTION < LINE:                                         │
│    → Dead code? Uncalled functions?                         │
│    → Or test skips some functions                           │
└─────────────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Phase 1: Reading the Report

#### 1.1 Coverage Report Structure

```bash
# Typical coverage output
-----------|---------|----------|---------|---------|-------------------
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
-----------|---------|----------|---------|---------|-------------------
auth.ts    |   95.23 |    88.89 |    100   |   94.44 | 45,67,89
user.ts    |   78.50 |    65.00 |    90.00 |   76.00 | 12,34,56,78
order.ts   |   60.00 |    50.00 |    80.00 |   58.00 | 10,20,30,40,50
-----------|---------|----------|---------|---------|-------------------
TOTAL      |   77.92 |    68.47 |    90.00 |   76.33 |
```

#### 1.2 What to Look For

```markdown
## Coverage Analysis Checklist

□ 1. Which files have lowest coverage?
   └─ Priority for adding tests

□ 2. What type of coverage is low?
   └─ Line: Code not executed
   └─ Branch: Decision paths missing
   └─ Function: Functions not called

□ 3. Is low coverage in CRITICAL code?
   └─ Business logic = HIGH PRIORITY
   └─ Error handling = HIGH PRIORITY
   └─ Utils (low risk) = LOWER PRIORITY

□ 4. Are the "uncovered" lines:
   └─ Unreachable code?
   └─ Error handlers?
   └─ Edge cases?
```

### Phase 2: Analyzing Gaps

#### 2.1 Gap Analysis Framework

```markdown
## Uncovered Code Analysis

For each uncovered line, ask:

1. IS THIS CODE REACHABLE?
   └─ Yes → Add test
   └─ No → Dead code, consider removing

2. IF REACHABLE, SHOULD THIS BE TESTED?
   └─ Critical path → HIGH PRIORITY test
   └─ Error handling → Test error cases
   └─ Edge case → Consider if common
   └─ Low risk utility → LOWER PRIORITY

3. WHAT TEST WOULD COVER THIS?
   └─ Unit test (isolated function)
   └─ Integration test (data flow)
   └─ E2E test (user interaction)
```

#### 2.2 Coverage Report Navigation

```typescript
// Typical tools:
// 1. CLI Reports (Jest, Vitest, etc.)
npm test -- --coverage

// 2. HTML Reports
// Open coverage/lcov-report/index.html

// 3. IDE Integration
// VS Code: Coverage Gutters
// WebStorm: Built-in coverage

// Navigate to uncovered lines
// Ask: Why isn't this covered?
// Add test for that scenario
```

### Phase 3: Strategic Coverage Decisions

#### 3.1 Coverage Targets by Code Type

```markdown
## Target Coverage Guidelines

| Code Type | Target | Rationale |
|-----------|--------|-----------|
| Business Logic | 80-90% | Core value, high ROI |
| Data Validation | 90%+ | Security boundary |
| Error Handling | 80%+ | Resilience matters |
| Utilities | 60-70% | Lower risk |
| Simple Getters | 50% | Not worth testing |
| UI Components | 70-80% | Behavior matters |
| Configuration | 50% | Rarely changes |

Note: These are GUIDELINES, not mandates
```

#### 3.2 When High Coverage is Misleading

```typescript
// Example: 100% coverage, but tests are useless
describe('User', () => {
  it('has name', () => {
    const user = new User({ name: 'John' });
    expect(user.name).toBe('John'); // Runs line, doesn't TEST
  });

  it('has email', () => {
    const user = new User({ email: 'john@example.com' });
    expect(user.email).toBe('john@example.com'); // Useless!
  });
});

// This gives 100% coverage but tests NOTHING meaningful
```

## Common Scenarios

### Scenario 1: "Coverage dropped after adding feature"

```markdown
## Analysis: Feature Added, Coverage Down

Possible causes:
1. New code without tests (normal)
2. Removed old tests for refactored code
3. Code moved to untested utility file

Steps:
1. Compare coverage reports before/after
2. Find the new files/changes
3. Add tests for new code
4. Verify old tests still pass

Priority: New code needs tests
```

### Scenario 2: "100% coverage but bugs still found"

```markdown
## Analysis: High Coverage ≠ No Bugs

This happens because:
1. Tests execute code but don't assert properly
2. Edge cases not tested
3. Integration points untested
4. Tests test implementation, not behavior

Solution:
1. Review test assertions - are they meaningful?
2. Add edge case tests
3. Test integration between modules
4. Code review for test quality
```

### Scenario 3: "This function has low coverage"

```typescript
// Given: validateUser() at 40% coverage
// Uncovered: Error handling branch

// BEFORE: Just runs happy path
it('validates valid user', () => {
  const result = validateUser({ name: 'John', email: 'john@test.com' });
  expect(result.valid).toBe(true);
});

// ADD COVERAGE FOR ERROR BRANCHES
it('rejects invalid email', () => {
  const result = validateUser({ name: 'John', email: 'not-an-email' });
  expect(result.valid).toBe(false);
  expect(result.errors).toContain('Invalid email');
});

it('rejects missing name', () => {
  const result = validateUser({ email: 'john@test.com' });
  expect(result.valid).toBe(false);
  expect(result.errors).toContain('Name required');
});

// NOW: Error branches are covered
```

### Scenario 4: "Where are the bugs hiding?"

```typescript
// Find patterns in untested code:
// 1. Error handlers (catch blocks)
try {
  await process();
} catch (error) {
  // Is this tested?
  handleError(error); // Is handleError tested?
}

// 2. Edge cases in conditionals
if (user.isAdmin && user.active) {
  // Both conditions tested?
}

// 3. Boundary conditions
if (amount > 0 && amount < MAX_LIMIT) {
  // What about amount = 0?
  // What about amount = MAX_LIMIT?
}
```

## Coverage Report Tools

### Jest

```bash
# Generate coverage
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html

# CI threshold (fail if below %)
{
  "coverageThreshold": {
    "global": {
      "branches": 50,
      "functions": 50,
      "lines": 50,
      "statements": 50
    }
  }
}
```

### Vitest

```bash
# Similar to Jest
npm test -- --coverage

# Coverage providers
// v8 (default)
npm test -- --coverage --coverage.provider=v8

// istanbul
npm test -- --coverage --coverage.provider=istanbul
```

### Istanbul (NYC)

```bash
# CLI
npx nyc npm test

# Reporters
npx nyc --reporter=text npm test
npx nyc --reporter=html npm test
npx nyc --reporter=lcov npm test
```

## The Coverage Analysis Checklist

```
COVERAGE ANALYSIS CHECKLIST
============================

□ 1. Overall coverage percentage (reasonable?)
□ 2. Lowest covered files (critical code?)
□ 3. Low coverage TYPE (line/branch/function)
□ 4. Uncovered lines - why?
  □ Dead code?
  □ Edge cases missing?
  □ Error handlers untested?

□ 5. High coverage files - really tested?
  □ Meaningful assertions?
  □ Edge cases?
  □ Or just coverage theater?

□ 6. Integration points covered?
□ 7. Critical paths have tests?
□ 8. Error handling tested?

DECISION:
□ Where to add tests?
□ Where is coverage theater?
□ What coverage target makes sense?
```

## Key Principles

### 1. Coverage is a Tool

It's useful for finding untested code, not measuring quality.

### 2. Critical Code Matters Most

Focus test effort on critical business logic, not utilities.

### 3. Quality Over Quantity

90% meaningful coverage > 100% useless coverage.

### 4. Look at the Uncovered

The uncovered lines tell you where tests are missing.

### 5. Coverage Thresholds are Guidelines

Use thresholds to catch regressions, not as mandates.

## Anti-Patterns

### 1. Chasing 100% Coverage

```typescript
// BAD: Useless test just for coverage
it('covers this line', () => {
  const x = calculate(); // Runs line
  expect(x).toBeDefined(); // Meaningless assertion
});

// This hurts more than helps
```

### 2. Ignoring Low Coverage

```typescript
// BAD: "It's just a utility, doesn't need tests"
const formatDate = (date) => { /* ... */ };

// Until that "useless" utility breaks in production
// And you can't figure out why because no tests
```

### 3. Testing Trivial Code

```typescript
// BAD: Testing getters
it('has name', () => {
  const user = new User({ name: 'John' });
  expect(user.name).toBe('John'); // Obviously works
});

// GOOD: Testing meaningful behavior
it('trims whitespace from name', () => {
  const user = new User({ name: '  John  ' });
  expect(user.name).toBe('John');
});
```

## Relationship to Other Skills

- `test-think` — Determines what should be tested
- `intelligent-test-creation` — Creates tests to fill gaps
- `generate-mock` — Mocks needed for coverage
- `setup-test-data` — Test data for coverage scenarios
- `debug-test` — When coverage doesn't match expectations
