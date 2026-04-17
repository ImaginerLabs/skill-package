---
name: test-readability
description: >-
  Master writing readable tests: how to structure tests for clarity, name tests descriptively, and make tests self-documenting. Use when writing tests, reviewing test quality, or when tests are hard to understand. Triggers especially when user says "readable tests", "test structure", "test naming", "test organization", "self-documenting tests" or "clear tests".
category: coding
priority: P2
trigger_patterns:
  - "readable tests"
  - "test structure"
  - "test naming"
  - "test organization"
  - "self-documenting tests"
  - "clear tests"
---

# Test Readability — Test Structure and Naming Framework

## Overview

Test-readability is a **behavioral specification skill** that encapsulates the methodology for **writing tests that are self-documenting, well-structured, and communicate intent clearly**.

This skill embodies the experience of developers who've inherited tests they couldn't understand and spent hours deciphering what they did — and knows that readable tests are as important as working code.

## Core Philosophy

### The Test Readability Principle

> "Tests are documentation. When you write a test, you're documenting how the code should behave. If someone can read your test and understand the system, you've done it right."

### Readable vs Unreadable Tests

```
┌─────────────────────────────────────────────────────────────┐
│                    READABLE vs UNREADABLE                     │
│                                                               │
│    UNREADABLE:                  READABLE:                     │
│    ───────────                  ─────────                     │
│    test('1', () => {...})      test('returns user when      │
│    test('2', () => {...})       valid id provided')          │
│                                                               │
│    expect(u).toBe(e)           expect(gotUser).toEqual(      │
│                                  expectedUser)                │
│                                                               │
│    No context                   Clear intent                  │
│    Cryptic                     Self-documenting             │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### What Makes a Test Readable?

| Aspect | Poor | Good |
|--------|------|------|
| Name | "test 1" | "should return user when valid id provided" |
| Structure | Everything in one block | Arrange-Act-Assert |
| Assertions | Cryptic | Self-documenting |
| Context | Hidden | Explicit |
| Intent | Hidden | Clear |

### Test Name Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST NAME PATTERNS                         │
│                                                               │
│    PATTERN 1: "should [expected behavior]"                  │
│    "should return user when valid id provided"              │
│                                                               │
│    PATTERN 2: "[action] [target] [expected result]"         │
│    "returns user for valid id"                              │
│                                                               │
│    PATTERN 3: "[when/scenario] [expected]"                  │
│    "when user not found throws error"                       │
│                                                               │
│    AVOID: "test 1", "test 2", "does thing"                 │
└─────────────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Phase 1: Test Structure

#### 1.1 Arrange-Act-Assert Pattern

```typescript
// CLASSIC: Arrange-Act-Assert
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when id exists', async () => {
      // ARRANGE: Set up test data
      const existingUser = await createTestUser({ id: '123' });

      // ACT: Perform the action
      const result = await userService.getUserById('123');

      // ASSERT: Verify the outcome
      expect(result).toEqual(existingUser);
    });
  });
});
```

#### 1.2 Given-When-Then Pattern

```typescript
// BDD: Given-When-Then
describe('OrderProcessor', () => {
  describe('when order is valid', () => {
    given('a valid order with in-stock items', () => {
      const order = createOrder({ items: [{ inStock: true }] });

      when('processOrder is called', () => {
        const result = orderProcessor.process(order);

        then('should mark order as processed', () => {
          expect(result.status).toBe('processed');
        });
      });
    });
  });
});
```

#### 1.3 Descriptive Block Structure

```typescript
// ORGANIZED: Nested describe blocks
describe('PaymentService', () => {
  describe('processPayment', () => {
    describe('when payment method is credit card', () => {
      describe('and card is valid', () => {
        it('should process payment successfully', () => {
          // Test for valid card
        });

        it('should charge correct amount', () => {
          // Test amount calculation
        });
      });

      describe('and card is expired', () => {
        it('should reject payment', () => {
          // Test expired card handling
        });
      });
    });

    describe('when payment method is PayPal', () => {
      // PayPal-specific tests
    });
  });
});
```

### Phase 2: Test Naming

#### 2.1 Good Test Names

```typescript
// EXCELLENT: Self-documenting
it('should return null when user does not exist', () => { ... });
it('should throw ValidationError when email is invalid', () => { ... });
it('should retry three times before failing on network error', () => { ... });
it('should format currency correctly for USD locale', () => { ... });

// Each name tells you:
// 1. What triggers it (when)
// 2. What expected behavior (should)
// 3. No need to read the test body to understand
```

#### 2.2 Naming Templates

```typescript
// TEMPLATE: should [expected result] when [condition]

it('should return {value} when {condition}', () => { ... });
it('should throw {error} when {condition}', () => { ... });
it('should {action} when {condition}', () => { ... });

// Examples:
it('should return empty array when user has no orders', () => { ... });
it('should throw UnauthorizedError when token is expired', () => { ... });
it('should redirect to dashboard when login succeeds', () => { ... });
```

#### 2.3 Names to Avoid

```typescript
// BAD: Cryptic names
it('test 1', () => { ... });
it('process', () => { ... });
it('works', () => { ... });
it('edge case', () => { ... });

// BAD: Implementation details in name
it('calls repository.findById', () => { ... });
it('uses cache.get', () => { ... });

// BAD: Too vague
it('handles error', () => { ... });
it('works correctly', () => { ... });
```

### Phase 3: Self-Documenting Code

#### 3.1 Clear Assertions

```typescript
// BAD: Cryptic assertion
expect(res).toBe(true);

// GOOD: Descriptive assertion
expect(isValid).toBe(true);
expect(paymentProcessed).toBe(true);

// GREAT: Clear value in assertion
expect(result).toEqual({
  status: 'success',
  userId: 'user-123',
  amount: 99.99,
});

// EVEN BETTER: Named expected value
const expectedOrder = {
  status: 'pending',
  items: [expectedItem],
};
expect(order).toEqual(expectedOrder);
```

#### 3.2 Helper Functions for Clarity

```typescript
// GOOD: Descriptive helpers
function createValidUser(overrides?: Partial<User>): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    isActive: true,
    ...overrides,
  };
}

// Usage in test
it('should reject inactive user', async () => {
  const inactiveUser = createValidUser({ isActive: false });
  // Clear what 'inactive' means in context
});
```

#### 3.3 Comments for Context

```typescript
// GOOD: Why, not what
it('should handle race condition in concurrent updates', () => {
  // Race condition occurs when two requests try to update
  // the same resource simultaneously. The database should
  // use optimistic locking to handle this gracefully.
});

// BAD: What, not why (code already says this)
// Increment counter
counter++;

// GOOD: Add context when non-obvious
// Use <= not < to match the API spec's inclusive bounds
const isInRange = value <= MAX_VALUE;
```

### Phase 4: Test Organization

#### 4.1 Grouping Related Tests

```typescript
describe('UserService', () => {
  // GROUP: Creation
  describe('createUser', () => { ... });
  describe('createAdmin', () => { ... });

  // GROUP: Retrieval
  describe('getUserById', () => { ... });
  describe('getUserByEmail', () => { ... });

  // GROUP: Updates
  describe('updateUser', () => { ... });
  describe('deleteUser', () => { ... });
});
```

#### 4.2 Setup and Teardown

```typescript
describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepo: MockOrderRepository;

  // SHARED SETUP: Runs before each test
  beforeEach(() => {
    mockOrderRepo = createMockOrderRepository();
    orderService = new OrderService(mockOrderRepo);
  });

  // CLEANUP: Runs after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create order', () => { ... });
  it('should cancel order', () => { ... });
});
```

## Common Scenarios

### Scenario 1: "This test is too long"

```typescript
// BAD: 100 lines in one test
it('should process full order flow', async () => {
  // Create user...
  // Create product...
  // Add to cart...
  // Apply discount...
  // Calculate total...
  // Create payment...
  // Verify email...
  // Update inventory...
  // 100 lines later...
});

// GOOD: Split into focused tests
it('should create order from cart', () => {
  const cart = createCartWithItems();
  const order = orderService.createOrder(cart);
  expect(order.items).toEqual(cart.items);
});

it('should calculate total with tax', () => {
  const order = createOrder({ subtotal: 100 });
  const total = orderService.calculateTotal(order);
  expect(total).toBe(110); // 10% tax
});

it('should send confirmation email', () => {
  const order = createCompletedOrder();
  await orderService.sendConfirmation(order);
  expect(emailService.send).toHaveBeenCalledWith(order.email);
});
```

### Scenario 2: "What is this test testing?"

```typescript
// BAD: Unclear context
it('should handle 400 error', () => {
  mockApi.post.mockRejectedValue({ status: 400 });
  // What endpoint? What causes 400?
});

// GOOD: Clear context
it('should return ValidationError when POST /users has invalid email', async () => {
  mockApi.post.mockRejectedValue({
    status: 400,
    message: 'Invalid email format',
  });

  await expect(createUser({ email: 'invalid' }))
    .rejects.toThrow(ValidationError);
});
```

### Scenario 3: "Magic values everywhere"

```typescript
// BAD: Magic numbers
it('should calculate', () => {
  const result = calculate(100, 20, 5);
  expect(result).toBe(25);
  // What do 100, 20, 5 mean?
});

// GOOD: Named values
it('should apply discount correctly', () => {
  const price = 100;
  const discountPercent = 20;
  const taxRate = 5;

  const result = calculate(price, discountPercent, taxRate);

  const expected = (price * (1 - discountPercent / 100)) * (1 + taxRate / 100);
  expect(result).toBeCloseTo(expected);
});
```

## Test Readability Anti-Patterns

### 1. Cryptic Test Names

```typescript
// BAD
test('1', () => { ... });
test('a', () => { ... });
test('t', () => { ... });

// GOOD
test('should return user when id is valid', () => { ... });
```

### 2. No Structure

```typescript
// BAD: Everything in one flat describe
describe('Tests', () => {
  it('test 1', () => { ... });
  it('test 2', () => { ... });
  it('test 3', () => { ... });
});

// GOOD: Organized structure
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when exists', () => { ... });
    it('should throw when not found', () => { ... });
  });
});
```

### 3. Unclear Assertions

```typescript
// BAD: What is being checked?
expect(result).toBe(1);

// GOOD: Clear expectation
expect(userRole).toBe(Role.ADMIN);
expect(hasPermission).toBe(true);
expect(errorCode).toBe('INVALID_EMAIL');
```

### 4. Missing Context

```typescript
// BAD: Assumes global state
beforeEach(() => {
  db.clear(); // What db?
});

// GOOD: Clear setup
beforeEach(() => {
  testDatabase.clear(); // What is being cleared?
});
```

## The Test Readability Checklist

```
TEST READABILITY CHECKLIST
==========================

□ 1. Does the test name describe WHAT it tests?
□ 2. Is the scenario/condition clear?
□ 3. Is the expected behavior obvious?
□ 4. Is there Arrange-Act-Assert structure?
□ 5. Are assertions self-documenting?
□ 6. Are there clear setup/teardown?
□ 7. Can someone understand test without reading code?
□ 8. Are helper functions used to reduce noise?
□ 9. Are magic values named?
□ 10. Is the test single-purpose?

FOR TEST NAMES:
□ "should [expected] when [condition]"
□ Describes behavior, not implementation
□ No cryptic abbreviations
□ Clear scenario
```

## Key Principles

### 1. Tests Document Behavior

Good tests explain how the system should behave.

### 2. Name = Documentation

The test name should summarize the test completely.

### 3. Structure for Scannability

Anyone should be able to scan and find tests they need.

### 4. Assertions Should Self-Verify

Read the assertion, understand what was checked.

### 5. Reduce Cognitive Load

Readers shouldn't have to hold context in their head.

## Relationship to Other Skills

- `test-think` — Determines what to test
- `intelligent-test-creation` — Creates readable tests
- `setup-test-data` — Data setup affects readability
- `generate-mock` — Mock setup affects readability
- `debug-test` — Unclear tests cause debugging difficulty
