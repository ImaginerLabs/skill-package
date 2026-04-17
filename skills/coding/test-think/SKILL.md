---
name: test-think
description: >-
  Master the thinking process behind effective testing decisions. This skill encapsulates the judgment of WHAT to test, WHAT NOT to test, and the prioritization framework for test coverage. Use when user mentions test strategy, testing decisions, what cases to cover, over-testing concerns, or asks "should I test this?". Triggers especially when user is unsure about testing scope, test coverage decisions, or when they say things like "should I write a test for this?", "is this worth testing?", "what test cases do I need?", or "how much testing is enough?".
category: coding
priority: P0
trigger_patterns:
  - "should I test this"
  - "is this worth testing"
  - "what should I test"
  - "test strategy"
  - "test coverage"
  - "over-testing"
  - "too many tests"
  - "what cases to cover"
  - "testing decisions"
  - "test scope"
---

# Test Thinking — The Art of Knowing What to Test

## Overview

Test-think is a **behavioral specification skill** that encapsulates expert judgment about testing decisions. It's not about HOW to write tests — it's about the **mental framework** for deciding WHAT to test, WHAT NOT to test, and in WHAT ORDER.

This skill embodies the thinking process of an experienced test architect: the judgment calls, prioritization frameworks, and risk-based reasoning that determines optimal test coverage.

## Core Philosophy

### The Testing Paradox

> "Perfect testing is the enemy of good development."

The goal isn't 100% coverage — it's **confidence at reasonable cost**. Every test has a price: write time, run time, maintenance cost, and opportunity cost.

### The Three Questions Framework

Before writing ANY test, answer these three questions:

1. **What could break?** (Risk identification)
2. **What's the cost of it breaking?** (Impact assessment)
3. **What's the cost of testing it?** (Investment evaluation)

### Test Value Matrix

```
                    Low Cost to Break     High Cost to Break
                  ┌─────────────────────┬─────────────────────┐
Low Test Cost     │ ⚡ Quick wins        │ 🎯 Priority target  │
                  ├─────────────────────┼─────────────────────┤
High Test Cost    │ 🤔 Consider carefully │ 📊 Evaluate ROI    │
                  └─────────────────────┴─────────────────────┘
```

## Decision Framework

### When to WRITE a Test

Write a test when:

| Condition | Rationale |
|-----------|-----------|
| Logic is complex | Complex logic has hidden edge cases |
| Error handling exists | Error paths are often untested |
| Edge cases are unclear | "What if someone passes null?" |
| Regression risk is high | Old bugs WILL recur without tests |
| API contract exists | Tests document and protect the contract |
| Refactoring planned | Tests enable safe refactoring |

### When NOT to Write a Test

**Don't write a test when:**

| Anti-pattern | Why | Alternative |
|--------------|-----|-------------|
| Trivial one-liners | Tests cost more than the code | Trust the type system |
| Implementation details | Fragile tests, blocks refactoring | Test behavior, not implementation |
| Coverage theater | False sense of security | Test meaningful scenarios |
| Duplicating other tests | Maintenance burden | One good test, well-named |
| Speculative edge cases | YAGNI applies to tests too | Wait for actual bugs |

### The "Is This Worth It?" Test

Use this decision tree:

```
                    ┌─ Is this a simple getter/setter?
                    │   └─ NO → Continue
                    │       └─ YES → SKIP (trust the type system)
                    │
                    └─ Does this logic have branching?
                        └─ NO → Consider SKIP (may be covered by integration test)
                        └─ YES → Continue
                                │
                                └─ What's the business impact if this breaks?
                                    │
                                    ├─ High (money, data, security) → WRITE TEST
                                    ├─ Medium → Write if test cost is low
                                    └─ Low → SKIP or document decision
```

## Prioritization Framework

### Test Priority Pyramid

```
                    ▲
                   /│\      P0: Critical paths (happy path + main edge cases)
                  / │ \         - Core business logic
                 /  │  \        - Data integrity
                /   │   \       - Security boundaries
               /────│────\
              /     │     \    P1: Important paths
             /      │      \      - Secondary flows
            /       │       \     - Error handling
           /        │        \    - Important edge cases
          /─────────│─────────\
         /          │           \  P2: Nice to have
        /           │            \   - Edge cases
       /            │             \  - Performance tests
      /─────────────│─────────────\
     /              │               P3: Luxury
    /               │                 - Documentation tests
   └────────────────┘                 - Legacy code coverage
```

### Priority Decision Criteria

**P0 — Critical (Always test):**
- User authentication/authorization
- Payment processing
- Data mutations (CRUD with side effects)
- Security boundaries
- Core business rules

**P1 — Important (Usually test):**
- Complex conditionals
- Data transformations
- API integrations
- File I/O operations
- Async workflows

**P2 — Nice to have (Test if easy):**
- Simple helpers
- Straight-line code
- Well-documented edge cases
- Configuration parsing

**P3 — Luxury (Consider skipping):**
- Trivial getters
- Code that will change soon
- One-off scripts
- Prototype code

## Test Coverage Wisdom

### The Coverage Trap

> "High coverage ≠ good tests. Good tests ≠ high coverage."

Coverage metrics measure QUANTITY, not QUALITY. A suite with 90% coverage that tests the wrong things is worse than 50% coverage that tests the right things.

### What Coverage Should You Aim For?

| Code Type | Target | Rationale |
|-----------|--------|-----------|
| Business logic | 80-90% | Core value, high ROI |
| Utility functions | 60-70% | Lower risk, simpler |
| I/O operations | 70-80% | External dependencies |
| Configuration | 50-60% | Low mutation rate |
| UI components | 60-70% | Behavior matters more |
| Integration | 40-60% | End-to-end coverage |

### The 20/80 Rule

20% of your tests likely cover 80% of your risk. Find that 20% and protect it fiercely.

## Testing Anti-Patterns

### 1. Test Counting

```typescript
// BAD: Testing to hit a number
it('should have 100% coverage', () => {
  expect(coverage).toBe(100);
});

// GOOD: Testing meaningful behavior
it('should reject negative amounts', () => {
  expect(() => processPayment(-10)).toThrow(InsufficientAmountError);
});
```

### 2. Implementation Sniffing

```typescript
// BAD: Testing HOW (fragile)
it('should call validate() then save()', () => {
  const validate = vi.fn();
  const save = vi.fn();
  // This breaks on refactor!
});

// GOOD: Testing WHAT (resilient)
it('should persist valid payment', () => {
  const payment = createPayment({ amount: 100 });
  const result = processPayment(payment);
  expect(result.status).toBe('persisted');
});
```

### 3. Over-specification

```typescript
// BAD: Testing every internal call
it('should call logger.info() then emit() then save()', () => {
  // This is testing the implementation, not the behavior
});

// GOOD: Testing the outcome
it('should complete payment and notify user', () => {
  const payment = createPayment({ amount: 100 });
  const result = processPayment(payment);
  expect(result.notified).toBe(true);
});
```

## The Test Review Checklist

Before finalizing any test, run through this checklist:

- [ ] Does this test describe WHAT we're testing, not HOW?
- [ ] Does this test have a meaningful name that serves as documentation?
- [ ] Is the assertion clear about the expected behavior?
- [ ] Would this test survive a refactor that doesn't change behavior?
- [ ] Is this test checking value, or just exercising code?
- [ ] Can someone understand the requirement from reading this test?
- [ ] Would this test catch the bug if it were introduced tomorrow?

## Common Scenarios

### Scenario 1: "Should I test this helper function?"

```
┌─ Is it pure (no side effects)?
│   └─ NO → Test the calling code instead
│   └─ YES → Continue
│
└─ Does it contain complex logic?
    └─ NO → Skip (trust TypeScript types)
    └─ YES → Test the complex branches only
```

### Scenario 2: "My colleague wants to add more tests"

Ask them to justify each test with:
1. What specific bug does this prevent?
2. What would break if this test didn't exist?
3. How often does this case actually occur in production?

### Scenario 3: "We need to improve test coverage"

Don't add tests for coverage. Instead:
1. List the bugs from the last 6 months
2. Check which ones had no test coverage
3. Add tests for those specific failure modes
4. That's your coverage improvement plan

### Scenario 4: "When to use mocks?"

| Use mocks when | Don't use mocks when |
|----------------|---------------------|
| Testing units in isolation | Testing integration |
| External services (API, DB) | Real behavior matters |
| Slow operations | Fast operations |
| Non-deterministic | Deterministic |

## Output Format

When analyzing test decisions, structure your output as:

```markdown
## Test Coverage Analysis

### Recommended Tests

| Component | Test Case | Priority | Rationale |
|-----------|-----------|----------|-----------|
| payment.ts | reject negative | P0 | Security boundary |
| payment.ts | insufficient funds | P0 | Core business logic |

### Skipping (Justified)

| Component | Reason | Alternative |
|-----------|--------|-------------|
| getUserById | Simple lookup | Trust ORM |
| formatDate | Trivial wrapper | Covered E2E |

### Test Coverage Target

- Business logic: 85%
- Utilities: 60%
- Integration: 50%
- Overall: ~65%
```

## Integration with Other Skills

- `generate-mock` — After deciding WHAT to test, use generate-mock for HOW to mock dependencies
- `setup-test-data` — Use after deciding WHAT to test for creating meaningful test fixtures
- `safe-refactor` — Use before refactoring to ensure critical paths are covered
- `debug-test` — When tests fail, use this to determine if it's a real bug or test issue
