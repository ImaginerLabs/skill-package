---
name: setup-test-data
description: >-
  Master test data setup: creating meaningful test fixtures, test data factories, and managing test data lifecycle. Use when user needs test data, test fixtures, sample data for tests, or when tests are hard to maintain due to data setup. Triggers especially when user says "test fixtures", "test data", "setup test", "create test objects", or "sample data".
category: coding
priority: P2
trigger_patterns:
  - "test fixtures"
  - "test data"
  - "setup test"
  - "create test objects"
  - "sample data"
  - "test data management"
---

# Setup Test Data — Strategic Test Fixture Design

## Overview

Setup-test-data is a **behavioral specification skill** that encapsulates the methodology for **creating maintainable, meaningful test data that makes tests readable and robust**.

This skill embodies the expertise of developers who've written tests with messy inline data and those who've used well-designed fixtures — and know the difference in maintainability.

## Core Philosophy

### The Test Data Principle

> "Test data should tell a story. When you read a test, you should immediately understand what scenario it's testing without deciphering random strings or magic numbers."

### Good vs Bad Test Data

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST DATA QUALITY                           │
│                                                               │
│    BAD TEST DATA:                  GOOD TEST DATA:           │
│    ─────────────                  ──────────────             │
│    const x = "asdf";              const activeUser = {...};  │
│    const y = 12345;               const premiumUser = {...}; │
│    const z = true;                const guestUser = {...};  │
│                                                               │
│    Meaningless                     Self-documenting           │
│    Hard to understand             Clear intent               │
│    Brittle                        Flexible                   │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### Test Data Strategy Selection

```
┌─────────────────────────────────────────────────────────────┐
│                  TEST DATA STRATEGY MATRIX                    │
│                                                               │
│    STRATEGY          USE WHEN              AVOID WHEN         │
│    ─────────         ─────────            ──────────         │
│    Inline data       Simple, one-off      Repeated use       │
│    Constants         Shared values         Complex objects     │
│    Factories         Dynamic creation      Simple tests       │
│    Fixtures          Complex state         Fast tests needed  │
│    Builders          Many optional fields   Simple tests       │
└─────────────────────────────────────────────────────────────┘
```

### When to Use Each Approach

| Approach | Best For | Avoid When |
|----------|---------|-----------|
| Inline | One test, simple case | Multiple tests, complex data |
| Constants | Shared test values | Tests need variations |
| Factories | Creating variations | Setup is complex |
| Fixtures | Shared complex state | Data changes frequently |
| Builders | Flexible object creation | Simple data |

## Behavioral Specification

### Phase 1: Test Data Design Principles

#### 1.1 The Meaningful Data Rule

```typescript
// ❌ BAD: What is this?
const user = {
  id: 123,
  name: "John",
  email: "john@example.com",
  active: true,
};

// ✅ GOOD: Clear from context
const testUser = {
  id: "user_test_123",
  email: "testuser@example.com",
  name: "Test User",
  role: "customer",
  isActive: true,
};

// Even better: Named for the scenario
const activeCustomer = {
  id: "customer_active_001",
  email: "customer@example.com",
  status: "active",
  subscription: "premium",
};

const inactiveUser = {
  id: "user_inactive_001",
  email: "inactive@example.com",
  status: "inactive",
  subscription: null,
};
```

#### 1.2 Self-Documenting Data

```typescript
// ❌ BAD: No context
const result = calculate(100, 20);

// ✅ GOOD: Clear expectations
const order = {
  subtotal: 100,
  taxRate: 0.2,
  expectedTotal: 120,
};
const result = calculate(order.subtotal, order.taxRate);
expect(result).toBe(order.expectedTotal);
```

### Phase 2: Test Data Patterns

#### 2.1 Factory Pattern

```typescript
// Factory for flexible test object creation
function createUser(overrides?: Partial<User>): User {
  const defaultUser: User = {
    id: "user_default_001",
    email: "default@example.com",
    name: "Default User",
    role: "customer",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  return { ...defaultUser, ...overrides };
}

// Usage: Create variations easily
const activeUser = createUser({ isActive: true });
const adminUser = createUser({ role: "admin" });
const inactiveUser = createUser({ isActive: false });
const premiumUser = createUser({ subscription: "premium" });
```

#### 2.2 Builder Pattern

```typescript
// Builder for complex objects
class UserBuilder {
  private user: Partial<User> = {
    id: "user_test_001",
  };

  withName(name: string): this {
    this.user.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  asAdmin(): this {
    this.user.role = "admin";
    this.user.isAdmin = true;
    return this;
  }

  withPremiumSubscription(): this {
    this.user.subscription = "premium";
    this.user.subscriptionEndsAt = new Date("2025-01-01");
    return this;
  }

  build(): User {
    return { ...defaultUser, ...this.user } as User;
  }
}

// Usage: Chain readable methods
const premiumAdmin = new UserBuilder()
  .withName("Premium Admin")
  .withEmail("admin@example.com")
  .asAdmin()
  .withPremiumSubscription()
  .build();
```

#### 2.3 Fixture Pattern

```typescript
// Shared fixtures for complex state
const sharedFixtures = {
  // Database state
  emptyDatabase: async () => {
    await db.clear();
  },

  databaseWithUsers: async () => {
    await db.clear();
    await db.users.bulkCreate([
      createUser({ name: "User 1" }),
      createUser({ name: "User 2" }),
    ]);
  },

  // Complex business state
  orderInProgress: (): Order => ({
    id: "order_pending_001",
    status: "pending",
    items: [
      { productId: "prod_1", quantity: 2, price: 10 },
    ],
    customer: createCustomer({ name: "Pending Customer" }),
  }),

  orderShipped: (): Order => ({
    ...orderInProgress(),
    status: "shipped",
    shippedAt: new Date(),
    trackingNumber: "TRACK123",
  }),
};

// Usage in tests
beforeEach(async () => {
  await sharedFixtures.emptyDatabase();
});

it("should process order", async () => {
  const order = sharedFixtures.orderInProgress();
  const result = await processOrder(order);
  expect(result.status).toBe("completed");
});
```

### Phase 3: Test Data Best Practices

#### 3.1 Data That Reveals Intent

```typescript
// ❌ BAD: Random-looking data
const payment = {
  amount: 938475,
  currency: "USD",
  card: "4111111111111111",
};

// ✅ GOOD: Intent-revealing data
const payment = {
  amount: 99.99, // Clear price point
  currency: "USD",
  card: "4111111111111111", // Valid test card number
};
```

#### 3.2 Edge Case Data

```typescript
// Explicit edge cases
const testCases = {
  emptyString: { name: "" },
  singleCharacter: { name: "A" },
  veryLong: { name: "A".repeat(1000)) },
  unicode: { name: "日本語テスト" },
  sqlInjection: { name: "'; DROP TABLE users; --" },
  xssAttempt: { name: "<script>alert('xss')</script>" },
};

// Easy to find and understand
it.each([
  ["empty string", testCases.emptyString],
  ["single character", testCases.singleCharacter],
  ["very long name", testCases.veryLong],
])("should handle %s", (caseName, data) => {
  // Test logic
});
```

#### 3.3 Realistic Data

```typescript
// ❌ BAD: Fake-looking
const user = {
  name: "John Doe",
  email: "john@asdf.com",
  company: "XYZ Corp",
};

// ✅ GOOD: Realistic
const user = {
  name: "Sarah Chen",
  email: "sarah.chen@techstartup.io",
  company: "Acme Technologies",
  role: "Senior Software Engineer",
  department: "Platform Engineering",
};
```

## Common Scenarios

### Scenario 1: "My test has too much setup"

```typescript
// BEFORE: 50 lines of setup
it("should send email when order ships", async () => {
  const user = {
    id: "user_123",
    email: "test@example.com",
    name: "Test User",
    preferences: { emailNotifications: true },
    // ... 20 more fields
  };
  const order = {
    id: "order_456",
    items: [...],
    shippingAddress: {...},
    // ... 15 more fields
  };
  // 100 lines of setup for a simple test
});

// AFTER: Factory with meaningful defaults
it("should send email when order ships", async () => {
  const user = createUser({
    email: "test@example.com",
    preferences: { emailNotifications: true },
  });
  const order = createOrder({
    status: "pending",
    customer: user,
  });
  // 10 lines of setup, clear intent
});
```

### Scenario 2: "Tests fail because data changes"

```typescript
// PROBLEM: Hard-coded dates break over time
const user = {
  createdAt: new Date("2024-01-01"),
  subscriptionEnds: new Date("2024-12-31"),
};

// SOLUTION: Relative dates
const user = {
  createdAt: subDays(new Date(), 30), // 30 days ago
  subscriptionEnds: addDays(new Date(), 335), // ~1 year from now
};

// OR: Stable fixture dates
const FIXED_DATE = new Date("2024-06-15T12:00:00Z");
const user = {
  createdAt: FIXED_DATE,
};
```

### Scenario 3: "Need to test with multiple variations"

```typescript
// BEFORE: Repeated setup
it("should handle premium user", () => {
  const user = createUser({ subscription: "premium" });
  // test
});

it("should handle free user", () => {
  const user = createUser({ subscription: "free" });
  // test
});

it("should handle expired subscription", () => {
  const user = createUser({ subscription: "expired" });
  // test
});

// AFTER: Parametrized tests
describe.each([
  ["premium", "premium"],
  ["free", "free"],
  ["expired", "expired"],
])("subscription type: %s", (name, subscription) => {
  it("should handle correctly", () => {
    const user = createUser({ subscription });
    // test once, covers all
  });
});
```

## Test Data Anti-Patterns

### 1. Magic Numbers

```typescript
// ❌ BAD
if (user.permissions === 0b1001) { ... }

// ✅ GOOD
const PERMISSIONS = {
  READ: 1,
  WRITE: 2,
  DELETE: 4,
  ADMIN: 8,
};
if (user.permissions === PERMISSIONS.READ | PERMISSIONS.WRITE) { ... }
```

### 2. Duplicate Data Creation

```typescript
// ❌ BAD
it("test 1", () => {
  const user = { name: "Test", email: "test@test.com" };
  // ...
});

it("test 2", () => {
  const user = { name: "Test", email: "test@test.com" }; // Duplicated!
  // ...
});

// ✅ GOOD
const testUser = { name: "Test", email: "test@test.com" };

it("test 1", () => {
  // use testUser
});

it("test 2", () => {
  // use testUser
});
```

### 3. Overly Complex Fixtures

```typescript
// ❌ BAD: Fixture does too much
const userFixture = {
  // 100 fields with obscure defaults
  // Helper methods that complicate things
  // Complex setup logic
};

// ✅ GOOD: Composable, focused fixtures
const baseUser = { /* essential fields */ };
const adminUser = { ...baseUser, role: "admin" };
const premiumUser = { ...baseUser, subscription: "premium" };
```

## The Test Data Design Checklist

```
TEST DATA DESIGN CHECKLIST
===========================

□ 1. Can you understand the test from the data alone?
□ 2. Is the data self-documenting?
□ 3. Does the name reveal intent?
□ 4. Are edge cases explicit?
□ 5. Is the data realistic?
□ 6. Can you create variations easily?
□ 7. Is setup minimal but complete?
□ 8. Will this break in 6 months?
□ 9. Can someone new understand this?
□ 10. Is there any magic data (explain if necessary)?

PATTERN SELECTION:
□ Inline → Simple, one-off test
□ Constants → Shared values across tests
□ Factory → Dynamic creation with defaults
□ Builder → Complex objects with many options
□ Fixture → Shared complex state
```

## Key Principles

### 1. Data Reveals Intent

The test data should tell you what scenario is being tested without reading the test logic.

### 2. Self-Documenting Names

Variables and values should explain themselves. No need for extra comments.

### 3. Composable, Not Monolithic

Build test objects from smaller pieces, not one giant fixture.

### 4. Stable Over Time

Use relative dates or fixed test dates. Don't let tests break naturally.

### 5. Realistic but Controlled

Use real-world patterns but controlled values. Credit card numbers should pass validation.

## Relationship to Other Skills

- `test-think` — Decides what test data is needed
- `generate-mock` — Often used alongside test data
- `intelligent-test-creation` — Combines with test design
- `debug-test` — When test data causes failures
- `test-readability` — Data organization affects readability
