---
name: generate-mock
description: >-
  Master the art of creating effective mocks: when to mock, what to mock, and how to avoid over-mocking. This skill encapsulates the judgment of mock strategy, mock depth, and maintaining test reliability. Use when user mentions mocking, mocks, test doubles, stubbing, or when they're unsure about mock strategy. Triggers especially when user says "should I mock this?", "how to mock", "mock strategy", "too many mocks", or "test mocks".
category: coding
priority: P1
trigger_patterns:
  - "should I mock this"
  - "how to mock"
  - "mock strategy"
  - "too many mocks"
  - "mocking in tests"
  - "test doubles"
  - "stubbing"
---

# Generate Mock — Strategic Mocking Framework

## Overview

Generate-mock is a **behavioral specification skill** that encapsulates the judgment of **when to mock, what to mock, how deeply to mock, and how to avoid common mocking pitfalls**.

This skill embodies the expertise of developers who've written both over-mocked fragile tests and well-balanced test strategies and know the difference.

## Core Philosophy

### The Mocking Paradox

> "Mocks are powerful tools that let you test units in isolation. But overuse turns your tests from 'verifying behavior' into 'verifying implementation details' — making refactoring harder, not easier."

### The Mocking Value Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                    MOCKING DECISION MATRIX                    │
│                                                               │
│                    Slow/Expensive      Fast/Cheap           │
│  ┌────────────────┼─────────────────┬────────────────────┐  │
│  │ External API   │   ✅ MOCK IT    │   🤔 CONSIDER      │  │
│  ├────────────────┼─────────────────┼────────────────────┤  │
│  │ Database       │   ✅ MOCK IT    │   🤔 INTEGRATE     │  │
│  ├────────────────┼─────────────────┼────────────────────┤  │
│  │ File System    │   ✅ MOCK IT    │   🤔 CONSIDER     │  │
│  ├────────────────┼─────────────────┼────────────────────┤  │
│  │ Simple Helper  │   🤔 DON'T     │   ❌ DON'T MOCK   │  │
│  │                │   (test it)     │   (test it directly)│  │
│  ├────────────────┼─────────────────┼────────────────────┤  │
│  │ Shared Utils   │   ✅ MOCK IT    │   🤔 INTEGRATE    │  │
│  └────────────────┴─────────────────┴────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### When to MOCK

| Situation | Mock? | Rationale |
|-----------|-------|-----------|
| External API calls | ✅ Yes | Speed, reliability, cost |
| Database operations | ✅ Yes | Speed, isolation |
| File system access | ✅ Yes | Speed, platform issues |
| Time/Date | ✅ Yes | Determinism |
| Random values | ✅ Yes | Reproducibility |
| Complex calculations | 🤔 Careful | May indicate design issue |
| Business logic | ❌ No | Test the real thing |
| Simple getters | ❌ No | Not worth it |
| Core domain objects | ❌ No | Test real behavior |

### When NOT to MOCK

| Situation | Don't Mock | Alternative |
|-----------|------------|-------------|
| Simple one-liners | Mock adds noise | Test directly |
| Business rules | Need real behavior | Use real objects |
| Value objects | Cheap to create | Test directly |
| Domain logic | Your core value | Integration test |
| Config that rarely changes | May not be needed | Test with real config |

### The Mock Decision Tree

```
                    ┌─ Is it slow or expensive?
                    │   └─ NO → Continue
                    │       └─ YES → MOCK
                    │
                    └─ Is it external (API, DB, FS)?
                        └─ YES → MOCK
                        └─ NO → Continue
                                │
                                └─ Is it complex to set up?
                                    └─ YES → MOCK (or simplify)
                                    └─ NO → Continue
                                            │
                                            └─ Does it affect what you're testing?
                                                └─ YES → Don't mock, test together
                                                └─ NO → MOCK
```

## Behavioral Specification

### Phase 1: Mock Strategy Design

#### 1.1 Identifying Mock Points

```markdown
## System Under Test (SUT) Analysis

Component: UserService.getUserById(id)

Dependencies identified:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    UserService ──► Database ──► Repository ──► [MOCK THIS] │
│         │                                                    │
│         └──► EmailService ──► [MOCK THIS]                   │
│                                                             │
│         └──► Logger ──► [MOCK THIS]                        │
│                                                             │
│         └──► Cache ──► [MOCK THIS]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

SUT: UserService.getUserById
Direct: Nothing (this IS the unit)
Indirect: Database, Email, Logger, Cache
```

#### 1.2 Mock Depth Strategy

```typescript
// DEEP MOCK - Mock entire object
const mockRepo = {
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

// PARTIAL MOCK - Mock specific methods
const mockRepo = {
  findById: vi.fn(),
  // save, delete use real implementation
};

// SPY - Real object, track calls
const realRepo = new UserRepository();
const mockRepo = vi.spyOn(realRepo, 'findById');
```

### Phase 2: Mock Implementation

#### 2.1 Good Mock Patterns

```typescript
// PATTERN 1: Factory for consistent mocks
function createMockUserRepository(overrides?: Partial<MockUserRepository>) {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockImplementation((user) => Promise.resolve(user)),
    delete: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

// Usage
const mockRepo = createMockUserRepository({
  findById: vi.fn().mockResolvedValue(testUser),
});
```

```typescript
// PATTERN 2: Mock with预设 return values
const mockApi = {
  fetchUser: vi.fn()
    .mockResolvedValueOnce({ id: 1, name: 'Alice' })  // First call
    .mockResolvedValueOnce({ id: 2, name: 'Bob' })    // Second call
    .mockRejectedValueOnce(new Error('Network error')) // Third call fails
};
```

#### 2.2 Mock Verification Patterns

```typescript
// GOOD: Verify behavior, not implementation
it('should call repository with correct id', async () => {
  const mockRepo = createMockUserRepository();
  const service = new UserService(mockRepo);

  await service.getUserById('123');

  expect(mockRepo.findById).toHaveBeenCalledWith('123');
});

it('should return user when found', async () => {
  const mockRepo = createMockUserRepository({
    findById: vi.fn().mockResolvedValue(testUser),
  });
  const service = new UserService(mockRepo);

  const result = await service.getUserById('123');

  expect(result).toEqual(testUser);
});
```

### Phase 3: Anti-Patterns

#### 3.1 Over-Mocking

```typescript
// BAD: Too many mocks = testing implementation
it('should call repo.findById then cache.set then logger.info', async () => {
  const mockRepo = { findById: vi.fn().mockResolvedValue(user) };
  const mockCache = { set: vi.fn().mockResolvedValue(undefined) };
  const mockLogger = { info: vi.fn() };
  const service = new UserService(mockRepo, mockCache, mockLogger);

  await service.getUserById('123');

  expect(mockRepo.findById).toHaveBeenCalled();
  expect(mockCache.set).toHaveBeenCalled();
  expect(mockLogger.info).toHaveBeenCalled(); // ← This is fragile
});

// GOOD: Test behavior, not implementation
it('should return user and cache it', async () => {
  const mockRepo = { findById: vi.fn().mockResolvedValue(user) };
  const mockCache = { set: vi.fn().mockResolvedValue(undefined) };
  const service = new UserService(mockRepo, mockCache);

  const result = await service.getUserById('123');

  expect(result).toEqual(user);
  expect(mockCache.set).toHaveBeenCalledWith('user:123', user);
  // Implementation detail (repo call) not verified
});
```

#### 3.2 Brittle Mocks

```typescript
// BAD: Testing exact call order
it('should call in order', () => {
  const mock1 = vi.fn();
  const mock2 = vi.fn();

  process(mock1, mock2);

  expect(mock1).toHaveBeenCalledTimes(1);
  expect(mock2).toHaveBeenCalledTimes(1);
  expect(mock1).toHaveBeenCalledBefore(mock2); // ← Brittle!
});

// GOOD: Test outcomes
it('should complete processing', () => {
  const mock1 = vi.fn();
  const mock2 = vi.fn();

  process(mock1, mock2);

  expect(mock1).toHaveBeenCalled();
  expect(mock2).toHaveBeenCalled();
  // Order doesn't matter for the outcome
});
```

#### 3.3 Mocking What You Own

```typescript
// BAD: Mocking internal modules
import { validateEmail } from './validators';

it('should validate email', () => {
  vi.mock('./validators', () => ({
    validateEmail: vi.fn().mockReturnValue(true),
  }));
  // Now testing a mock, not real behavior
});

// GOOD: Test real validation
it('should validate email correctly', () => {
  expect(validateEmail('test@example.com')).toBe(true);
  expect(validateEmail('invalid')).toBe(false);
});
```

### Phase 4: Mock Maintenance

#### 4.1 Mock Hygiene Rules

```markdown
MOCK HYGIENE CHECKLIST
=======================

□ Mocks match the interface they're replacing
□ Mock returns realistic data structures
□ Mock handles edge cases (null, errors)
□ Mock cleanup in afterEach or vi.clearAllMocks()
□ Mocks are injected, not imported inline
□ Mock assertions verify behavior, not implementation
□ Mocks are documented when behavior is non-obvious
□ Mocks fail tests when they're wrong, not silently succeed
```

#### 4.2 Mock Cleanup

```typescript
// Use beforeEach/afterEach for cleanup
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Or reset specific mocks
beforeEach(() => {
  mockRepository.findById.mockReset();
});
```

## Mock Strategy Patterns

### Pattern 1: Repository Pattern Mocks

```typescript
// Interface-based mocking
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// Mock implementation
const createMockUserRepository = (overrides?: Partial<IUserRepository>) => ({
  findById: vi.fn(),
  findByEmail: vi.fn(),
  save: vi.fn(),
  ...overrides,
});

// Usage in tests
const mockRepo = createMockUserRepository({
  findById: vi.fn().mockResolvedValue(testUser),
});
```

### Pattern 2: HTTP/API Mocks

```typescript
// Using MSW or similar
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, name: 'Test User' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Pattern 3: Time Mocks

```typescript
// Mocking Date.now()
const mockDate = new Date('2024-04-17T12:00:00Z');
vi.setSystemTime(mockDate);

// Or for specific Date calls
vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
```

### Pattern 4: Config Mocks

```typescript
// For feature flags, env vars, etc.
vi.stubEnv('FEATURE_ENABLED', 'true');
vi.stubEnv('API_URL', 'https://test.example.com');
```

## Common Scenarios

### Scenario 1: "Should I mock this external API call?"

```markdown
Analysis:
- External API call
- 500ms latency
- Rate limited
- Can fail intermittently

Mock Strategy:
✅ YES - Mock it
  - Speed up tests significantly
  - Avoid rate limits
  - Ensure deterministic tests

Mock Implementation:
- Use msw for HTTP mocks
- Create realistic response fixtures
- Add error case mocks too
```

### Scenario 2: "My tests are brittle because of too many mocks"

```markdown
Analysis:
- 15 mocks in one test
- 10+ assertions on mock calls
- Refactoring breaks tests constantly

Problem: Testing implementation details

Solution:
1. Reduce mock count - mock only external deps
2. Test outcomes, not calls
3. Use integration tests for internal interactions

Before:
expect(mock.validate).toHaveBeenCalledWith('input');
expect(mock.transform).toHaveBeenCalledWith(mock.validate());
expect(mock.save).toHaveBeenCalledWith(mock.transform());

After:
const result = service.process('input');
expect(result).toEqual(expectedOutput);
```

### Scenario 3: "Mock vs Integration test?"

```markdown
Decision Framework:

UNIT TEST (with mocks):
- Testing a single function
- Isolating from external dependencies
- Fast feedback needed
- Internal logic only

INTEGRATION TEST (no mocks):
- Testing multiple components together
- Verifying data flow
- Ensuring contracts work
- Catching integration bugs

Hybrid Approach:
- Unit tests for logic
- Integration tests for component interaction
- E2E for critical user paths
```

## The Mock Decision Checklist

```
MOCK DECISION CHECKLIST
=======================

□ Is this external? (API, DB, FS)
  └─ YES → MOCK

□ Is this slow or expensive?
  └─ YES → MOCK

□ Does this affect test reliability?
  └─ YES → MOCK (date, random, time)

□ Is this a simple helper function?
  └─ YES → DON'T MOCK, test directly

□ Is this core business logic?
  └─ YES → DON'T MOCK, test with real objects

□ Am I testing implementation details?
  └─ YES → STOP, reconsider

□ Will refactoring break this test?
  └─ YES → Too brittle, reduce mocks
```

## Key Principles

### 1. Mocks Are for Isolation

Mocks let you test one thing in isolation by replacing its dependencies.

### 2. Don't Mock What You Own

If you control the code, test it directly or use real objects.

### 3. Test Behavior, Not Implementation

Verify outcomes, not the internal calls that lead to them.

### 4. Mocks Should Match Reality

Mocks that return unrealistic data create false confidence.

### 5. Keep Mocks Minimal

The more you mock, the more your tests become fragile.

## Relationship to Other Skills

- `test-think` — Determines what to test (and what to mock)
- `setup-test-data` — Creates realistic test fixtures
- `debug-test` — When mocked tests fail
- `test-readability` — Clear test structure with mocks
- `intelligent-test-creation` — Combines mock strategy with test design
