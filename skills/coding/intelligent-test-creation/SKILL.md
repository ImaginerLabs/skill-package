---
name: intelligent-test-creation
description: >-
  Chain-combined skill for creating comprehensive, intelligent tests by combining test-think (what to test), generate-mock (mocking strategy), and setup-test-data (test fixtures). Use when user needs to write tests, wants intelligent test coverage, or when they're unsure what tests to write for a feature. Triggers especially when user says "write tests for this", "how to test this", "test coverage", "what tests do I need", or "generate test cases".
category: coding
priority: P1
trigger_patterns:
  - "write tests for this"
  - "how to test this"
  - "test coverage"
  - "what tests do I need"
  - "generate test cases"
  - "intelligent testing"
  - "smart test creation"
combines:
  - test-think
  - generate-mock
  - setup-test-data
---

# Intelligent Test Creation — Strategic Test Design Framework

## Overview

Intelligent-test-creation is a **chain-combined behavioral specification skill** that merges:

- `test-think` — What to test decisions
- `generate-mock` — Mocking strategy
- `setup-test-data` — Test fixtures

The core judgment it encapsulates: **"Given this code change, what tests do I need to write, how should I structure them, and what mocks/fixtures do they require?"**

This skill provides a systematic approach to creating test suites that are comprehensive, maintainable, and provide meaningful confidence.

## Core Philosophy

### The Intelligent Testing Principle

> "The goal isn't to test everything — it's to test the things that matter in ways that provide meaningful confidence while remaining maintainable."

### The Test Quality Equation

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST QUALITY                              │
│                                                               │
│         CONFIDENCE                                           │
│              ▲                                                │
│              │     ┌──────────────┐                         │
│              │     │ Meaningful   │                         │
│              │     │ Tests        │                         │
│              │     └──────────────┘                         │
│              │     ┌──────────────┐                         │
│              │     │ Fragile      │                         │
│              │     │ Tests        │                         │
│              └─────┴──────────────┴──────────────►          │
│                   Coverage                                    │
│                                                               │
│    HIGH CONFIDENCE + LOW MAINTENANCE = IDEAL                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### Phase 1: Test Scope Analysis

#### 1.1 Change Type Analysis

```markdown
## Change Classification

| Change Type | Test Priority | Strategy |
|-------------|--------------|----------|
| New feature | High | Positive + negative + edge cases |
| Bug fix | Critical | Regression + fix verification |
| Refactor | Medium | Verify behavior unchanged |
| Config change | Low | Verify config loaded correctly |
| Dependency update | Medium | Verify integration unchanged |
| Performance fix | Medium | Benchmark before/after |
```

#### 1.2 Risk Assessment

```markdown
## Risk Assessment Matrix

┌─────────────────────────────────────────────────────────────┐
│                   IMPACT × LIKELIHOOD                        │
│                                                               │
│                    Low Impact      High Impact              │
│  ┌────────────────┬────────────────┬───────────────────┐  │
│  │ High Likelihood│    Quick wins  │   Priority tests  │  │
│  ├────────────────┼────────────────┼───────────────────┤  │
│  │ Low Likelihood │  Consider skip │   Risk mitigation │  │
│  └────────────────┴────────────────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Test Case Design

#### 2.1 The Test Case Framework

```typescript
// TEMPLATE: Intelligent Test Case
describe('FeatureName', () => {
  // GROUP 1: Happy Path (Primary behavior)
  describe('when valid input', () => {
    it('should [expected behavior]', () => { /* ... */ });
  });

  // GROUP 2: Negative Cases (Invalid input handling)
  describe('when invalid input', () => {
    it('should [handle invalid gracefully]', () => { /* ... */ });
    it('should [return meaningful error]', () => { /* ... */ });
  });

  // GROUP 3: Edge Cases (Boundary conditions)
  describe('edge cases', () => {
    it('should handle [edge case 1]', () => { /* ... */ });
    it('should handle [edge case 2]', () => { /* ... */ });
  });

  // GROUP 4: Integration Points (If applicable)
  describe('with external dependencies', () => {
    it('should [handle dependency correctly]', () => { /* ... */ });
  });
});
```

#### 2.2 Test Naming Patterns

```typescript
// PATTERN: "should [expected behavior] when [condition]"
// Examples:

// Good test names:
should_return_user_when_id_exists()
should_throw_notfound_when_user_does_not_exist()
should_retry_three_times_when_payment_fails()
should_return_empty_list_when_no_results()

// Bad test names (implementation-focused):
test_getUser()
test_handleError()
test_function1()
```

### Phase 3: Mock Strategy

#### 3.1 Dependency Classification

```markdown
## Dependency Analysis

Component: processPayment(amount, card)

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    Dependencies:                                            │
│    ┌─────────────┐                                          │
│    │ PaymentGateway│  Type: External API                    │
│    │ [MOCK]       │  Why: Can't test with real payments   │
│    └─────────────┘                                          │
│                                                             │
│    ┌─────────────┐                                          │
│    │ Logger       │  Type: Side effect                     │
│    │ [MOCK]       │  Why: Track calls, not assertions     │
│    └─────────────┘                                          │
│                                                             │
│    ┌─────────────┐                                          │
│    │ UserService  │  Type: Internal                        │
│    │ [REAL/SPIED] │  Why: Test real behavior               │
│    └─────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2 Mock Setup Pattern

```typescript
// Pattern: Descriptive mock factory
function createPaymentGatewayMock(overrides?: {
  charge?: () => Promise<PaymentResult>;
  refund?: () => Promise<void>;
}) {
  return {
    charge: vi.fn().mockResolvedValue({ success: true, id: 'tx_123' }),
    refund: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createLoggerMock() {
  return {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };
}
```

### Phase 4: Test Data Strategy

#### 4.1 Fixture Design

```typescript
// Pattern: Composable test fixtures
const baseUser = {
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date('2024-01-01'),
};

// For specific test scenarios
function createTestUser(overrides?: Partial<typeof baseUser>) {
  return { ...baseUser, ...overrides };
}

describe('getUser', () => {
  it('should return user with id', () => {
    const user = createTestUser({ id: 'special_123' });
    // Use in test
  });
});
```

#### 4.2 Test Data Hierarchy

```markdown
## Test Data Strategy

┌─────────────────────────────────────────────────────────────┐
│                  TEST DATA HIERARCHY                         │
│                                                               │
│  MINIMAL ─────► TYPICAL ─────► EDGE CASE ─────► ANOMALY    │
│                                                               │
│  {id: 1}     {id, name,     {id: 0, -1,    {null, undefined,
│               email, etc}   MAX, MIN}      empty string}
│                                                               │
│  Fast to      Represents     Boundary        Rare/error      │
│  create       real usage     conditions      conditions       │
└─────────────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Step 1: Analyze the Change

```markdown
## Change Analysis Worksheet

**What changed?**
[Describe the code change]

**What behavior is new/changed?**
[List specific behaviors]

**What's the blast radius?**
[What could this break?]

**What existing tests cover this?**
[List existing tests, if any]
```

### Step 2: Determine Test Coverage

```markdown
## Coverage Decision

| Behavior | Test Needed | Test Type | Priority |
|----------|-------------|-----------|----------|
| Primary use case | ✅ | Happy path | P0 |
| Invalid input | ✅ | Negative | P0 |
| Edge case: empty | ✅ | Edge | P1 |
| Edge case: max value | ✅ | Edge | P1 |
| Error handling | ✅ | Error | P1 |
| Logging side effects | 🤔 | Verify only | P2 |

**Total: 4-6 tests recommended**
```

### Step 3: Structure the Tests

```typescript
// Structure recommendation:
// - Group by scenario (given/when/then)
// - Name tests descriptively
// - One assertion focus per test
// - Use setup functions for common patterns
```

### Step 4: Implement Tests

```typescript
describe('UserRegistration', () => {
  // SETUP
  let mockUserRepo: ReturnType<typeof createUserRepoMock>;
  let mockEmailService: ReturnType<typeof createEmailMock>;

  beforeEach(() => {
    mockUserRepo = createUserRepoMock();
    mockEmailService = createEmailMock();
  });

  // HAPPY PATH
  describe('when valid registration', () => {
    it('should create user and send welcome email', async () => {
      // Arrange
      const input = { email: 'new@example.com', password: 'Secure123!' };
      mockUserRepo.findByEmail.mockResolvedValue(null);

      // Act
      const result = await registerUser(input, mockUserRepo, mockEmailService);

      // Assert
      expect(result.user.email).toBe(input.email);
      expect(mockEmailService.sendWelcome).toHaveBeenCalledWith(input.email);
    });
  });

  // NEGATIVE CASES
  describe('when email already exists', () => {
    it('should throw EmailExistsError', async () => {
      // Arrange
      const existingUser = { email: 'existing@example.com' };
      mockUserRepo.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(registerUser({ ... }, mockUserRepo, mockEmailService))
        .rejects
        .toThrow(EmailExistsError);
    });
  });

  // EDGE CASES
  describe('edge cases', () => {
    it('should handle email with plus addressing', async () => {
      // Test that user+tag@example.com is treated as user@example.com
    });
  });
});
```

## Test Coverage Patterns

### Pattern 1: Given-When-Then

```typescript
describe('OrderTotalCalculation', () => {
  describe('given a cart with items', () => {
    const cart = createCartWith([
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ]);

    describe('when calculating total', () => {
      const total = calculateOrderTotal(cart);

      it('then should sum all item totals', () => {
        expect(total).toBe(250);
      });

      it('then should include tax', () => {
        expect(total.tax).toBe(25);
      });
    });
  });
});
```

### Pattern 2: State Transition Testing

```typescript
describe('OrderStateMachine', () => {
  it('should transition PENDING -> PAID -> SHIPPED -> DELIVERED', () => {
    const order = createPendingOrder();

    order.pay();
    expect(order.state).toBe('PAID');

    order.ship();
    expect(order.state).toBe('SHIPPED');

    order.deliver();
    expect(order.state).toBe('DELIVERED');
  });

  it('should reject PAID -> SHIPPED if payment failed', () => {
    const order = createPaidOrder({ paymentStatus: 'FAILED' });

    expect(() => order.ship()).toThrow(InvalidStateTransitionError);
  });
});
```

### Pattern 3: Error Path Testing

```typescript
describe('PaymentProcessing', () => {
  it('should throw PaymentDeclined when card is expired', async () => {
    const expiredCard = createCard({ expiry: '01/20' }); // Past date

    await expect(processPayment(100, expiredCard))
      .rejects
      .toThrow(PaymentDeclinedError);
  });

  it('should include decline reason in error', async () => {
    const declinedCard = createCard();
    mockPaymentGateway.charge.mockRejectedValue(
      new DeclinedError('Insufficient funds')
    );

    try {
      await processPayment(100, declinedCard);
    } catch (error) {
      expect(error.declineReason).toBe('Insufficient funds');
    }
  });
});
```

## Common Scenarios

### Scenario 1: "I just added a new feature, what tests do I need?"

```markdown
Analysis: New feature - User profile update

**Required tests:**
1. ✅ Happy path: Update name successfully
2. ✅ Negative: Reject invalid email
3. ✅ Negative: Reject empty name
4. ✅ Edge: Handle very long name (truncation?)
5. ✅ Auth: Reject unauthenticated requests
6. ✅ Auth: Reject updating other users

**Optional (if complex):**
- Rate limiting
- Concurrent updates

**Mock strategy:**
- UserRepository: MOCK (database)
- AuthService: REAL (test real auth)
- EmailService: MOCK (don't send real emails)
```

### Scenario 2: "I fixed a bug, how do I test the fix?"

```markdown
Bug: NullPointerException when user has no orders

**Regression tests (ensure bug doesn't return):**
1. ✅ should_not_throw_when_user_has_no_orders
2. ✅ should_return_empty_array_when_user_has_no_orders

**Fix verification tests:**
1. ✅ should_handle_null_orders_from_db
2. ✅ should_filter_out_invalid_orders

**Edge cases added:**
1. ✅ should_handle_user_exists_but_orders_table_empty
2. ✅ should_handle_orders_query_returns_null
```

### Scenario 3: "How do I improve test coverage?"

```markdown
Wrong approach: Add tests just for coverage %
Right approach: Find real bugs that aren't tested

**Coverage improvement plan:**
1. List last 6 months of production bugs
2. Check if each has a test
3. If not, add a test for that specific bug scenario
4. That's meaningful coverage improvement

**Not worth testing just for coverage:**
- Trivial getters
- One-line wrappers
- Already-covered edge cases
```

## The Intelligent Test Creation Checklist

```
INTELLIGENT TEST CREATION CHECKLIST
====================================

□ 1. Change analyzed - understand what behavior changed
□ 2. Test scope determined - happy path + negative + edge
□ 3. Risk assessed - critical paths covered
□ 4. Dependencies classified - what to mock
□ 5. Test data planned - fixtures designed
□ 6. Test structure organized - grouped by scenario
□ 7. Names are descriptive - what/when/then pattern
□ 8. Assertions are meaningful - test outcomes, not internals
□ 9. Setup is clean - beforeEach for common setup
□ 10. Cleanup is handled - mocks cleared between tests
□ 11. Edge cases included - boundaries + anomalies
□ 12. Error paths tested - what could go wrong
□ 13. Integration verified - if applicable
□ 14. Tests are maintainable - won't break on refactor
```

## Key Principles

### 1. Test Behavior, Not Implementation

Tests should pass when behavior is preserved, even if implementation changes.

### 2. One Assertion Focus Per Test

Each test should verify one specific behavior. Multiple assertions are OK if they verify one behavior from multiple angles.

### 3. Descriptive Names Are Documentation

Test names serve as executable documentation. Invest in making them clear.

### 4. Setup/Teardown Reduces Duplication

Common setup in beforeEach keeps tests DRY and maintainable.

### 5. Edge Cases Matter More Than Happy Path

The happy path probably works. It's the edge cases that bite you.

### 6. Mocks Are Tools, Not Goals

Mock to isolate, not to avoid testing real behavior.

## Relationship to Other Skills

- `test-think` — Decides what to test
- `generate-mock` — Provides mock strategy
- `setup-test-data` — Creates test fixtures
- `debug-test` — When tests fail
- `test-readability` — Clean test structure
- `safe-refactor` — Tests enable safe refactoring
- `read-test-coverage` — Understanding coverage metrics
