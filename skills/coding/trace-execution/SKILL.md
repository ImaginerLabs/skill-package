---
name: trace-execution
description: >-
  Master tracing code execution: how to follow execution paths, set strategic breakpoints, and understand control flow. Use when debugging, understanding code flow, or when you need to figure out how code reaches a certain point. Triggers especially when user says "trace execution", "follow the code", "debugging execution", "breakpoint strategy", "control flow", or "how does this get called".
category: coding
priority: P2
trigger_patterns:
  - "trace execution"
  - "follow the code"
  - "debugging execution"
  - "breakpoint strategy"
  - "control flow"
  - "how does this get called"
  - "execution path"
---

# Trace Execution — Systematic Code Path Analysis

## Overview

Trace-execution is a **behavioral specification skill** that encapsulates the methodology for **systematically following code execution paths, setting breakpoints strategically, and understanding how code flows through a system**.

This skill embodies the discipline of developers who've traced complex bugs and know that "adding logs everywhere" is not a strategy — understanding the path is.

## Core Philosophy

### The Execution Trace Principle

> "Code execution is a path through a graph. To understand it, you don't follow every edge — you find the critical path and follow that."

### Tracing vs Logging

```
┌─────────────────────────────────────────────────────────────┐
│                    TRACING vs LOGGING                         │
│                                                               │
│    TRACING:                     LOGGING:                     │
│    ─────────                     ───────                      │
│    Understanding WHERE code     Recording WHAT happened       │
│    is going                     for later analysis            │
│                                                               │
│    Tools: Breakpoints, Step     Tools: console.log, logger   │
│    through, Call stack          Purpose: Audit, reproduce    │
│    Purpose: Understand path     Purpose: Verify behavior      │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### When to Trace vs Log

| Situation | Approach | Why |
|-----------|----------|-----|
| Understanding unfamiliar code | TRACE | Don't know where to log |
| Reproducing a bug | LOG + TRACE | Need both |
| Verifying a fix | LOG | Just need to confirm |
| Understanding flow | TRACE | Follow the path |
| Finding where code diverges | TRACE | Find the branch |

### Breakpoint Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                  BREAKPOINT PLACEMENT                          │
│                                                               │
│    Entry Point ──► Key Decision ──► Important State ──► Exit │
│         │                │                  │                │
│         ▼                ▼                  ▼                │
│    First line      Branch check        Before mutation        │
│    of function     if/else/switch     critical operation     │
│                                                               │
│    "Where does it start?"      "Where might it branch?"      │
│    "What's the flow?"          "Where is state changed?"    │
└─────────────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Phase 1: Map the Execution Path

#### 1.1 Entry Point Identification

```typescript
// Find where execution STARTS
// 1. Look for event handlers, API routes, main functions
// 2. Find the public/exported functions
// 3. Find where your code is CALLED

// Example: Understanding an API request flow
// 1. router.post('/users', ...) → Entry point
// 2. createUser(req.body) → Function called
// 3. validateUserData(data) → Inside createUser
// 4. userRepo.save(user) → Database call
```

#### 1.2 Call Graph Construction

```typescript
// Build a simple call graph
function main() {
  //     main
  //    /    \
  //   A()    B()
  //  / \     |
  // C() D()  E()
  //
  // To trace from main to E:
  // main → B → E
}

// How to trace:
// 1. Start at entry
// 2. For each function call, note WHERE it's called
// 3. Follow the most relevant path
```

#### 1.3 Async Execution Tracing

```typescript
// Async adds complexity:
// 1. Promises resolve later
// 2. Call stack is lost
// 3. Order matters

// Trace async:
async function processOrder(orderId: string) {
  // 1. Fetch order (async)
  const order = await fetchOrder(orderId); // ← Breakpoint here

  // 2. Validate (sync)
  validate(order); // ← Then here

  // 3. Process (async)
  const result = await processPayment(order); // ← Then here

  // 4. Save (async)
  await saveResult(result); // ← Finally here
}
```

### Phase 2: Strategic Breakpoint Placement

#### 2.1 Breakpoint Types

```typescript
// LINE BREAKPOINT: Stop at specific line
// Useful for: Known problematic area

// CONDITIONAL BREAKPOINT: Stop only when condition met
// Useful for: Specific case within a loop

// FUNCTION BREAKPOINT: Stop at function entry
// Useful for: Trace function calls

// EXCEPTION BREAKPOINT: Stop when exception thrown
// Useful for: Catch unhandled errors
```

#### 2.2 Strategic Placement

```typescript
// PLACEMENT STRATEGY

// 1. ENTRY/EXIT: Function boundaries
function complexOperation(input) {
  // BREAKPOINT: Entry
  console.log('Input:', input);

  // ... code ...

  // BREAKPOINT: Exit
  console.log('Output:', result);
  return result;
}

// 2. DECISION POINTS: If/switch/ternary
if (user.isAdmin) { // BREAKPOINT: Before branch
  // Admin path
} else {
  // Regular path
}

// 3. STATE CHANGES: Assignments to important variables
let total = 0;
total = calculate(items); // BREAKPOINT: After important assignment
```

#### 2.3 Efficiency in Tracing

```typescript
// BAD: Too many breakpoints
function process() {
  // breakpoint at line 1
  // breakpoint at line 2
  // breakpoint at line 3 ... (useless noise)

  // GOOD: Strategic breakpoints
  function process() {
    // breakpoint at key decision
    // breakpoint before mutation
    // breakpoint at return
  }
```

### Phase 3: Call Stack Analysis

#### 3.1 Reading the Stack

```typescript
// Call Stack (top to bottom = recent to old):
// at C (c.ts:10)          ← CURRENTLY HERE
// at B (b.ts:20)          ← WHO CALLED C
// at A (a.ts:30)          ← WHO CALLED B

// To trace BACKWARDS:
// 1. Start at current (C)
// 2. Read up for caller (B)
// 3. Read up for caller (A)

// This is how you got HERE
```

#### 3.2 Async Stack Analysis

```typescript
// Async stack is DISCONNECTED
// Example:

// Stack 1 (async trigger):
async function trigger() {
  await process(); // ← Point A: Called process
}

// Stack 2 (async continuation):
async function process() {
  // ← Point B: Code here
  // The "who called" chain is broken!
}

// Solution: Use correlation IDs
async function trigger(correlationId) {
  await process(correlationId); // Pass ID through
}

async function process(correlationId) {
  console.log('Triggered by:', correlationId);
  // Now you can trace!
}
```

### Phase 4: Control Flow Patterns

#### 4.1 Common Patterns

```typescript
// Pattern 1: Linear Flow
A(); B(); C(); // Trace: A → B → C

// Pattern 2: Conditional Flow
if (x) { A(); } else { B(); }
// Trace: x? → A or B

// Pattern 3: Loop Flow
for (const item of items) {
  process(item);
}
// Trace: items[0] → items[1] → items[2]...

// Pattern 4: Callback Flow
fetch(url, (err, data) => {
  if (err) handleError(err);
  else process(data);
});
// Trace: fetch → callback (success or error path)

// Pattern 5: Event Flow
emitter.on('event', handler);
// Trace: emit → handler
```

## Common Scenarios

### Scenario 1: "How does this button click get handled?"

```typescript
// Step 1: Find the button
// <button onClick={handleSubmit}>

// Step 2: Trace the handler
const handleSubmit = async (event) => {
  event.preventDefault(); // Breakpoint here

  // Step 3: Find what it calls
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  // Step 4: Continue tracing
  await api.submit(data); // Breakpoint here
};

// Step 5: Trace the API
// POST /api/submit → server route → handler
```

### Scenario 2: "Why did this code path execute?"

```typescript
// Given: 'if (user.isAdmin)' branch was taken
// Question: Why was user.isAdmin true?

// Trace backwards:
function handleRequest(user) {
  // user.isAdmin came from HERE
  const userFromDB = await getUser(user.id);
  // Why was this true?

  // Continue backwards...
  // getUser returned { isAdmin: true }
  // Was the data correct in DB?
  // Did something modify it?
}

// Solution: Breakpoint at assignment
const userFromDB = await getUser(user.id);
// Inspect: What did getUser return?
// If wrong → problem in getUser
// If right → problem elsewhere
```

### Scenario 3: "This function is called but I don't see why"

```typescript
// Question: Who is calling this function?
// findAllUsers()

// Solution 1: Stack trace (runtime)
// Add breakpoint, look UP the stack

// Solution 2: IDE find usages (static)
// Right click → Find All References
// Shows all call sites

// Solution 3: Grep
grep -r "findAllUsers" --include="*.ts"
// Lists all files that call this function
```

## Debugging Execution Tools

### Browser DevTools

```typescript
// 1. Breakpoints panel
// - Set by clicking line number
// - See all breakpoints
// - Enable/disable individually

// 2. Watch panel
// - Add expressions to watch
// - See value update as you step

// 3. Call Stack panel
// - See current path
// - Click frame to jump to caller
```

### Node.js Debugging

```bash
# Start with inspector
node --inspect index.js

# Or in Chrome DevTools
node --inspect-brk index.js
# --inspect-brk pauses on first line

# VS Code attach
# Debug > Attach to Node
```

### Logging for Tracing

```typescript
// When you can't use debugger
const trace = (label, value) => {
  console.log(`[TRACE] ${label}:`, value);
  return value;
};

// Usage
const result = trace('processed', actualValue);
// Output: [TRACE] processed: { ... }
```

## The Trace Execution Checklist

```
TRACE EXECUTION CHECKLIST
=========================

□ 1. Identify entry point
□ 2. Map the call graph (at least roughly)
□ 3. Find the critical path
□ 4. Place breakpoints strategically
  □ Entry/exit of functions
  □ Decision points
  □ State mutations
□ 5. Follow the call stack
□ 6. Note any async boundaries
□ 7. Verify understanding matches reality

FOR ASYNC CODE:
□ Use correlation IDs
□ Break on promise creation and resolution
□ Watch for detached stacks
```

## Key Principles

### 1. Start at the Beginning

Always trace from a known point. Entry points are anchors.

### 2. Follow One Path

Don't try to trace all paths. Find the relevant one.

### 3. Breakpoints > Logs for Tracing

Breakpoints let you explore. Logs are for verification.

### 4. Async Breaks the Stack

Remember that async/callbacks create gaps in the call stack.

### 5. Correlation IDs Connect Async

Pass IDs through async chains to trace across boundaries.

## Anti-Patterns

### 1. Scatter Shot Logging

```typescript
// BAD: Log everything
console.log('A');
console.log('B');
console.log('C');
// Now you have noise, not signal

// GOOD: Strategic logging
console.log('Before critical operation:', importantState);
```

### 2. Not Using IDE Tools

```typescript
// BAD: Add logs to understand flow
function trace(x) {
  console.log('x:', x);
  return x * 2;
}

// GOOD: Use debugger
debugger; // Or set breakpoint in IDE
```

### 3. Ignoring the Call Stack

```typescript
// BAD: Don't look at call stack
// "Something called my function"

// GOOD: Read the stack
// "Oh, moduleA.line 42 called this"
```

## Relationship to Other Skills

- `debug-session` — Uses tracing as part of debugging workflow
- `debug-test` — Tracing helps understand test failures
- `understand-error` — Stack trace reading uses this
- `inspect-state` — Often used alongside tracing
- `reproduce-bug` — Tracing is part of reproduction
