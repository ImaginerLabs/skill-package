---
name: explain-code
description: >-
  Master the art of explaining code clearly: how to distill complex logic into understandable explanations, adjust depth for audience, and make unfamiliar code accessible. Use when user asks to explain code, understand code, document code, or when they need to communicate how code works. Triggers especially when user says "explain this code", "what does this do", "how does this work", "help me understand", or "explain this function".
category: coding
priority: P1
trigger_patterns:
  - "explain this code"
  - "what does this do"
  - "how does this work"
  - "help me understand"
  - "explain this function"
  - "code explanation"
  - "document this code"
---

# Explain Code — Code Comprehension Framework

## Overview

Explain-code is a **behavioral specification skill** that encapsulates the methodology for **clearly explaining code to humans**, whether that's documenting for future self, teaching teammates, or creating accessible documentation.

The core judgment it provides: **"How do I explain this code so that someone can understand what it does and why?"**

## Core Philosophy

### The Explanation Paradox

> "Code explains HOW, but not WHY. Comments explain WHY, but not HOW. Good explanation does both — in the right proportion for the audience."

The best code explanation is the one that answers the question behind the question.

### The Three Levels of Code Understanding

```
┌─────────────────────────────────────────────────────────────┐
│                 CODE UNDERSTANDING LEVELS                     │
│                                                               │
│  LEVEL 1: SYNTAX                                             │
│  └─ "I understand the code structure"                       │
│                                                               │
│  LEVEL 2: BEHAVIOR                                           │
│  └─ "I understand what the code does"                       │
│                                                               │
│  LEVEL 3: INTENT                                             │
│  └─ "I understand WHY the code does this"                    │
│                                                               │
│  Best explanations address LEVEL 3 first,                    │
│  then fill in levels 1-2 as needed.                          │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### Before Explaining: Audience Analysis

| Question | Audience Adjustment |
|----------|---------------------|
| Who's reading? | Expert vs novice |
| What's their goal? | Understand to use vs modify vs review |
| What do they already know? | Domain concepts, tech stack |
| What's their time pressure? | Quick summary vs deep dive |
| Why are they asking? | Debugging vs learning vs reviewing |

### The Audience Spectrum

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUDIENCE ADJUSTMENT                          │
│                                                                   │
│  NEWCOMER                   COLLEAGUE                   EXPERT   │
│  ─────────                  ─────────                  ───────  │
│  Explain basics             Assume some                Just show │
│  Define terms               knowledge                  the code   │
│  Show examples              Focus on interesting       Focus on  │
│  Connect to concepts        parts                      edge cases │
│                                                                   │
│  WHY: Learn                  WHY: Collaborate            WHY: Review│
└─────────────────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Phase 1: Code Analysis

#### 1.1 First Read: Understanding Structure

```markdown
## Code Structure Analysis

File: paymentProcessor.ts

Lines 1-20: Imports and types
Lines 21-50: Helper functions
Lines 51-100: Main processor class
Lines 101-150: Error handling
Lines 151-200: Integration points

Initial observations:
- Uses class-based design
- Depends on external payment gateway
- Has significant error handling
- ~200 lines suggests single responsibility concern
```

#### 1.2 Second Read: Understanding Flow

```markdown
## Execution Flow Analysis

paymentProcessor.charge()

Entry: User provides payment details
    │
    ▼
Step 1: Validate payment data
    │
    ▼
Step 2: Format for gateway API
    │
    ▼
Step 3: Call payment gateway
    │
    ▼
Step 4: Map response to internal format
    │
    ▼
Exit: Return payment result
```

#### 1.3 Third Read: Understanding Intent

```markdown
## Intent Discovery

Questions to ask:
- Why was this approach chosen over alternatives?
- What business rules are encoded here?
- What constraints shaped the design?
- What edge cases is this handling?

Clues in the code:
- Comments mentioning business rules
- Error handling for specific cases
- Validation of specific formats
- Comments referencing external systems
```

### Phase 2: Explanation Structure

#### 2.1 The Intention-First Pattern

**BAD:**
```markdown
"This function takes a user ID, queries the database for the user,
creates an order object, saves it to the database, and returns the order."
```

**GOOD:**
```markdown
"Creates an order for a user.

The function handles the full order creation flow:
1. Fetches the user to ensure they exist
2. Creates an order in PENDING state
3. Saves to database
4. Returns the created order

Why this flow matters: This ensures atomic order creation —
if any step fails, no partial order is created."
```

#### 2.2 The Purpose-Signature-Body Pattern

```markdown
## FunctionName: What It Does

**Purpose:** [One sentence describing WHY this exists]

**Signature:**
```typescript
function processPayment(
  amount: number,
  paymentMethod: PaymentMethod
): Promise<PaymentResult>
```

**Behavior:**
1. [Step 1]
2. [Step 2]
3. [Returns/Throws]

**Key decisions:**
- [Why approach X over Y]
- [Edge cases handled]
- [Business rules enforced]
```

#### 2.3 The Story Pattern for Complex Logic

```markdown
## The Story of This Algorithm

Once upon a time, we needed to [problem].

The first approach was [naive solution], but it had issues:
- [Problem with approach 1]

So we tried [alternative], which [worked because...]

Then we discovered [edge case] which broke [previous approach].

Finally, we settled on [current approach] because:
- It handles [edge case]
- It's efficient for [use case]
- It's simple enough to maintain

The result is what you see today.
```

### Phase 3: Documentation Generation

#### 3.1 Code Comment Best Practices

```typescript
// ❌ BAD: States the obvious
// Increment counter
counter++;

// ❌ BAD: Explains HOW (code already does this)
// Loop through users array
users.forEach(user => {});

// ✅ GOOD: Explains WHY
// Retry logic needed because payment gateway occasionally
// returns 503 due to their own scaling events
const retryCount = 3;

// ✅ GOOD: Explains context
// Business rule: Orders over $1000 require manual review
// This is enforced by the compliance team (see TICKET-123)
const MANUAL_REVIEW_THRESHOLD = 1000;
```

#### 3.2 JSDoc Pattern for Functions

```typescript
/**
 * Processes a payment for the given amount.
 *
 * @param amount - The payment amount in cents (integer only)
 * @param paymentMethod - The payment method to charge
 * @returns Promise resolving to payment result
 * @throws {PaymentDeclinedError} When payment is declined
 * @throws {InsufficientFundsError} When balance is too low
 *
 * @example
 * const result = await processPayment(5000, card);
 * if (result.success) {
 *   console.log(`Paid ${result.amount}`);
 * }
 */
async function processPayment(
  amount: number,
  paymentMethod: PaymentMethod
): Promise<PaymentResult> {
  // Implementation
}
```

### Phase 4: Audience-Tailored Explanation

#### 4.1 For a Newcomer

```markdown
## Understanding the Authentication Flow

**What is authentication?**
Authentication answers: "Who are you?"

**How our system does it:**

1. User submits email + password
2. System checks if credentials match
3. If yes, system creates a "session" (like a temporary ID card)
4. All future requests include this session
5. System knows who you are from the session

**Why this design?**
- Passwords are never stored directly (stored as "hash")
- Sessions expire automatically (security)
- Separate from login means we can log out without losing your identity
```

#### 4.2 For a Colleague

```markdown
## Authentication Flow - Technical Summary

**Login flow:**
1. POST /auth/login with credentials
2. Verify password against bcrypt hash
3. Create JWT with 24h expiry
4. Return token to client

**Token validation:**
- Middleware extracts Bearer token
- JWT verified with server secret
- User ID extracted, attached to request
- If invalid/expired → 401

**Key decisions:**
- JWT over sessions (stateless, scalable)
- 24h expiry (balance security/usability)
- bcrypt over MD5/SHA1 (cost factor for brute force)
```

#### 4.3 For an Expert

```markdown
## Auth Implementation Notes

**JWT Strategy:**
- RS256 signed (asymmetric)
- Claims: sub (userId), iat, exp, roles[]
- Refresh token rotation in separate endpoint

**Security considerations:**
- Passwords: bcrypt, cost 12
- Rate limiting: 5 attempts per 15 min per IP
- Token storage: httpOnly cookie (not localStorage)

**Scaling:**
- Token validation: stateless, no DB hit
- Refresh: requires DB, but infrequent
- Logout: blacklist in Redis (if needed) or short expiry
```

## Common Scenarios

### Scenario 1: "What does this function do?"

```markdown
## Explanation for "understand this function" request

**Function:** processUserRegistration

**One-line answer:** Registers a new user in the system.

**What it does (step by step):**
1. Validates email format and uniqueness
2. Hashes password with bcrypt
3. Creates user record in database
4. Sends welcome email
5. Returns created user (without password hash)

**Key edge cases handled:**
- Duplicate email → throws RegistrationError
- Weak password → validation rejects
- Email service down → user still created (email is async)

**What it doesn't do:**
- Log the user in (separate function)
- Send verification email (separate flow)
```

### Scenario 2: "How does this complex algorithm work?"

```markdown
## Dijkstra's Algorithm Implementation - Explained

**Purpose:** Find the shortest path between nodes

**The insight:** At each step, the node with the smallest known distance from start is the next one to process.

**How it works:**

1. Start with source node at distance 0, all others at infinity
2. Pick the unvisited node with smallest distance (source at start)
3. For each neighbor, calculate distance through current node
4. If shorter than known, update that neighbor's distance
5. Mark current node as visited
6. Repeat 2-5 until destination visited or all distances settled

**Why this works:** Every node's shortest path goes through nodes with smaller distances first (otherwise there'd be a shorter path).

**Time complexity:** O(V²) naive, O(E log V) with priority queue
```

### Scenario 3: "Why was this code written this way?"

```markdown
## Historical Context: Why the Cache Layer?

**Current implementation:**
We have a two-tier cache: in-memory L1, Redis L2.

**Why this design:**

Originally (2021), we had only Redis. But we noticed:
- 90% of reads were the same 10% of data
- Redis latency (2-5ms) was dominating response times
- Our API was fast but not fast enough for SLA

**What we tried:**
1. In-memory cache alone → works locally, but 6 app servers have different caches = inconsistency
2. Redis only → fast enough for some, but P99 was high

**Solution:** Two-tier cache
- L1 (in-memory): Very fast, but server-specific
- L2 (Redis): Consistent, shared between servers
- Cache-aside pattern: check L1 → miss → check L2 → miss → DB

**Trade-offs accepted:**
- Memory usage increased (L1 caches)
- Cache invalidation more complex
- 1-2ms added latency for L1 misses

**This is documented because new team members keep asking "why not just Redis?"**
```

## Key Principles

### 1. Answer the Why First

People want to know WHY code exists before they care HOW it works.

### 2. Match the Audience

The same code explained to a newcomer vs expert should look very different.

### 3. Use Analogies Wisely

"Good analogy: Authentication is like a hotel key card system"
"Bad analogy: Authentication is like quantum entanglement"

### 4. Show, Don't Just Tell

Code examples make abstract descriptions concrete.

### 5. Document the Unusual

If something looks weird but has a reason, explain it. Future readers will wonder.

### 6. Write for Future You

Assume you'll forget everything in 6 months. Write comments that would help you then.

## Anti-Patterns

### 1. Commenting the Obvious

```typescript
// BAD: No new information
// Loop through array
array.forEach(item => doSomething(item));

// GOOD: Adds context
// Retry failed items in separate pass to avoid
// compounding failures (if A fails, B succeeds, retry A)
```

### 2. Outdated Comments

```typescript
// ❌ OLD: Comment doesn't match code anymore
// Max retries is 3 (changed to 5 last sprint)
// [but comment still says 3]

// Keep comments updated OR delete them
const MAX_RETRIES = 5;
```

### 3. Noisy Comments

```typescript
// ❌ BAD: Too many comments
// Function starts here
function process() {
  // If condition
  if (x) {
    // Do thing
    doThing();
  }
}

// ✅ GOOD: Meaningful comments
function process() {
  // Only process active items (inactive filtered at query level)
  if (x) {
    doThing();
  }
}
```

## Relationship to Other Skills

- `code-comment-writer` — Writing effective code comments
- `generate-diagram-from-code` — Visual explanation of code
- `documentation-writer` — Creating formal documentation
- `context-learning` — Learning about a new codebase
- `code-to-documentation` — Full documentation from code
