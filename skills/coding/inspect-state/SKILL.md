---
name: inspect-state
description: >-
  Master runtime state inspection: how to examine variable values, object state, and data structures during execution. Use when debugging, understanding variable contents, or when code behavior is unexpected. Triggers especially when user says "inspect variable", "check state", "what's in this object", "variable value", "runtime inspection" or "debug state".
category: coding
priority: P2
trigger_patterns:
  - "inspect variable"
  - "check state"
  - "what's in this object"
  - "variable value"
  - "runtime inspection"
  - "debug state"
  - "watch variable"
---

# Inspect State — Runtime Variable Analysis Framework

## Overview

Inspect-state is a **behavioral specification skill** that encapsulates the methodology for **systematically examining runtime state to understand why code behaves as it does**.

This skill embodies the discipline of developers who've added 50 console.logs instead of strategically inspecting state and know the difference debugging efficiency makes.

## Core Philosophy

### The State Inspection Principle

> "Code behavior is determined by state. When behavior is unexpected, the state is wrong somewhere. Your job is to find WHERE the state became wrong, not just WHAT is wrong."

### State vs Behavior

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE vs BEHAVIOR                          │
│                                                               │
│    BEHAVIOR: What code DOES                                    │
│    STATE: What code KNOWS                                     │
│                                                               │
│    When behavior is wrong...                                  │
│    → State is wrong somewhere                                 │
│    → Find WHERE state became wrong                            │
│    → Fix THAT                                                 │
│                                                               │
│    Don't just patch behavior.                                 │
│    Fix the state.                                             │
└─────────────────────────────────────────────────────────────┘
```

## Decision Framework

### What to Inspect

| Question | Approach |
|----------|----------|
| What's in this variable? | Console.log or debugger |
| Where did this value come from? | Trace backwards |
| When did this change? | Watch/breakpoint |
| Why is this undefined? | Inspect caller, check conditions |
| What changed this object? | Break on modification |

### State Inspection Points

```
┌─────────────────────────────────────────────────────────────┐
│                  STATE INSPECTION POINTS                     │
│                                                               │
│  1. ENTRY: What did I receive?                              │
│     └─ function(x) → x is what?                             │
│                                                               │
│  2. TRANSFORM: What changed?                                │
│     └─ const y = x + 1 → y is x + 1?                        │
│                                                               │
│  3. BRANCH: What triggered this path?                        │
│     └─ if (condition) → What is condition?                  │
│                                                               │
│  4. EXIT: What am I returning?                              │
│     └─ return result → result is what?                       │
└─────────────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Phase 1: Basic Inspection

#### 1.1 Console Inspection

```typescript
// Quick state dump
console.log('Variable:', variable);
console.log('Object:', JSON.stringify(obj, null, 2));
console.log('Type:', typeof variable);
console.log('Keys:', Object.keys(obj));

// Structured inspection
console.table([{ name: 'a', value: 1 }, { name: 'b', value: 2 }]);

// Grouped inspection
console.group('Function X');
console.log('Input:', input);
console.log('Processing...');
console.log('Output:', output);
console.groupEnd();
```

#### 1.2 Debugger Inspection

```typescript
// Breakpoint at critical point
function process(input) {
  debugger; // Execution stops here

  // Then use browser DevTools:
  // - Scope panel: see local variables
  // - Watch: add specific expressions
  // - Console: run expressions
}
```

### Phase 2: Strategic Inspection

#### 2.1 Before and After Pattern

```typescript
// INSPECT STATE TRANSITION
function transform(data) {
  console.log('BEFORE:', data); // What came in?

  const result = doSomething(data);

  console.log('AFTER:', result); // What came out?
  // If before === after but expected different, doSomething didn't work
  // If after === unexpected, find what changed in doSomething

  return result;
}
```

#### 2.2 Branch Inspection

```typescript
function handleUser(user) {
  // INSPECT THE BRANCH CONDITION
  console.log('user.isAdmin:', user.isAdmin); // Is this what you think?

  if (user.isAdmin) {
    // INSPECT STATE IN BRANCH
    console.log('Entered admin branch');
    // What admin-specific state exists?
  } else {
    console.log('Entered regular branch');
  }
}
```

#### 2.3 Object Deep Inspection

```typescript
// Inspect nested structure
console.log('user:', user);
console.log('user.profile:', user.profile);
console.log('user.profile.settings:', user.profile?.settings);

// Or use structured inspect
const inspect = (obj, path = '') => {
  for (const key of Object.keys(obj)) {
    console.log(`${path}${key}:`, obj[key]);
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      inspect(obj[key], `${path}${key}.`);
    }
  }
};
inspect(user);
```

### Phase 3: Tracking State Changes

#### 3.1 Change Detection

```typescript
// Before modification
console.log('BEFORE user:', { ...user });

// Make change
user.name = 'New Name';

// After modification
console.log('AFTER user:', { ...user });

// Or use Proxy for automatic tracking
const tracked = new Proxy(original, {
  set(target, key, value) {
    console.log(`Setting ${String(key)} from ${target[key]} to ${value}`);
    target[key] = value;
    return true;
  }
});
```

#### 3.2 Break on Modification

```typescript
// Using DevTools:
// 1. Find the variable in Scope
// 2. Right-click → "Log when value changes" or "Break on value change"

// Or in code:
// For objects, use Proxy
const watchObject = (obj, name) => {
  return new Proxy(obj, {
    set(target, key, value) {
      console.log(`[WATCH ${name}] ${String(key)} changed`);
      target[key] = value;
      return true;
    }
  });
};

const watchedUser = watchObject(user, 'user');
watchedUser.name = 'Changed'; // Logs: [WATCH user] name changed
```

### Phase 4: Common State Issues

#### 4.1 Undefined vs Null

```typescript
// Issue: Variable is undefined
// Inspect:
// 1. Where should it come from?
// 2. Did that code run?
// 3. Did something reset it?

// Issue: Variable is null
// Inspect:
// 1. Explicitly set to null?
// 2. Failed API response?
// 3. Failed query?

// Debug
console.log('x is:', x, 'type:', typeof x);
// undefined = never assigned
// null = explicitly null
```

#### 4.2 Stale State

```typescript
// Issue: State not updating
// Symptom: "I changed X but Y still has old value"

// Common causes:
// 1. Closure capturing old value
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // All log 3!
}

// 2. React state not syncing
// Need to check if setState actually ran

// 3. Cached value not invalidated
// console.log('Cache before:', cache.get('key'));
// Make change
// console.log('Cache after:', cache.get('key'));
```

#### 4.3 Object Reference Issues

```typescript
// Issue: "I changed obj2 but obj1 changed too!"
// Cause: Both point to same object

const obj1 = { x: 1 };
const obj2 = obj1; // Same reference!

obj2.x = 2;
console.log(obj1.x); // 2 - obj1 was modified too!

// Inspect references
console.log('obj1 === obj2:', obj1 === obj2); // true = same reference
console.log('obj1:', obj1);
console.log('obj2:', obj2);
```

## Common Scenarios

### Scenario 1: "This variable should have a value but it's undefined"

```typescript
// STEP 1: Where should it come from?
function getUser(id) {
  return db.users.find(id); // Should return user
}

// STEP 2: Inspect at the source
const user = getUser(id);
console.log('user from db:', user); // undefined??

// STEP 3: Check the input
console.log('id passed:', id); // Wrong id?

// STEP 4: Check the query
console.log('db.users:', db.users); // Empty?

// Continue until found...
```

### Scenario 2: "Object has wrong properties"

```typescript
// Symptom: user.name works but user.email doesn't
// Expected: { name: 'John', email: 'john@example.com' }
// Actual: { name: 'John' }

// Inspect the object
console.log('user keys:', Object.keys(user));
console.log('user:', user);

// Found: email was never set
// Look at where user was created
const user = { name: 'John' }; // Missing email!
```

### Scenario 3: "Array is empty when it shouldn't be"

```typescript
// STEP 1: Where does array come from?
const results = query.filter(item => item.active);

// STEP 2: Inspect before filter
console.log('Before filter:', query);
console.log('Query length:', query.length);

// STEP 3: Inspect filter condition
console.log('Item:', item, 'item.active:', item.active);

// STEP 4: Or use more specific filter
const results = query.filter(item => {
  console.log('Checking:', item);
  return item.active;
});
```

## The State Inspection Checklist

```
STATE INSPECTION CHECKLIST
===========================

□ 1. What should the state be?
□ 2. What is the actual state?
□ 3. Where should it come from?
□ 4. Did that code execute?
□ 5. Did the value change?
□ 6. Is there a reference issue?
□ 7. Is there stale state?

FOR OBJECTS:
□ Inspect keys: Object.keys(obj)
□ Inspect values: Object.values(obj)
□ Inspect entries: Object.entries(obj)
□ Check for undefined: obj.missingKey

FOR ARRAYS:
□ Check length: arr.length
□ Check contents: arr[0], arr[1]
□ Check for undefined: arr[1000]

FOR REFERENCES:
□ Check equality: obj1 === obj2
□ Clone to test: JSON.parse(JSON.stringify(obj))
```

## Debugging Patterns

### Pattern 1: Log Location Context

```typescript
// BAD: Where did this log come from?
console.log('Value:', value);

// GOOD: Clear source
console.log('[processUser] value:', value);
console.log('[getUserFromDB] value:', value);
console.log('[validateUser] value:', value);
```

### Pattern 2: Format for Readability

```typescript
// BAD: Messy output
console.log('user', user, 'order', order);

// GOOD: Structured output
console.log({
  action: 'processOrder',
  user,
  order,
  result,
});
```

### Pattern 3: Conditional Logging

```typescript
// Only log in debug mode
const DEBUG = process.env.DEBUG === 'true';

function process(data) {
  if (DEBUG) console.log('[process] input:', data);

  const result = doWork(data);

  if (DEBUG) console.log('[process] output:', result);

  return result;
}
```

## Anti-Patterns

### 1. Log Everything

```typescript
// BAD: Noise, not signal
console.log('1');
console.log('2');
console.log('a');
console.log('b');
// Now you can't find anything

// GOOD: Strategic logging
console.log('Before critical operation:', importantState);
```

### 2. Not Checking the Right Thing

```typescript
// BAD: Checked wrong variable
console.log('userId:', userId); // Correct
// But bug is in user.email...

// GOOD: Check systematically
console.log('user:', user); // See everything
```

### 3. Modifying State to Debug

```typescript
// BAD: Adding to production code
if (data.length > 0) {
  // Now behavior changed
}

// GOOD: Use debugger
debugger; // Read without modifying
```

## Key Principles

### 1. Inspect Before Assuming

Never assume what state is. Inspect it.

### 2. One Thing at a Time

Change one thing, inspect one thing.

### 3. Track State Backwards

State came from somewhere. Trace backwards to find the source.

### 4. Use the Right Tool

Console.log for quick checks. Debugger for deep inspection.

### 5. Compare Expected vs Actual

State inspection is always comparing "what I expected" to "what I got".

## Relationship to Other Skills

- `debug-session` — Uses state inspection during debugging
- `trace-execution` — Often inspect state at trace points
- `understand-error` — Errors guide what to inspect
- `reproduce-bug` — State inspection for isolation
- `inspect-state` — This IS this skill (self-referential)
