---
name: understand-error
description: >-
  Master the art of correctly interpreting error messages, stack traces, and failure indicators. This skill encapsulates the judgment of WHAT an error really means, WHERE it originates, and WHY it occurred. Use when user encounters an error message, unexpected behavior, exception, or when code fails with any kind of diagnostic output. Triggers especially when user pastes an error message and asks "what does this mean?", "why am I getting this error?", "how do I fix this?", or "error message explained".
category: coding
priority: P0
trigger_patterns:
  - "what does this error mean"
  - "why am I getting"
  - "how to fix this error"
  - "error message explained"
  - "understand this error"
  - "error analysis"
  - "debug this error"
  - "how to interpret"
---

# Understand Error — Error Message Interpretation Framework

## Overview

Understand-error is a **behavioral specification skill** that encapsulates expert judgment for correctly interpreting error messages, stack traces, and diagnostic output.

The core judgment it provides: **"What does this error REALLY mean, where did it come from, and what is the actual problem?"**

This skill embodies the expertise of developers who can look at an error and immediately understand the root cause — not because they've seen it before, but because they know how to read errors systematically.

## Core Philosophy

### The Error Interpretation Paradox

> "Error messages are honest — they're telling you exactly what's wrong. The problem is you're not listening."

Most developers see errors as obstacles. Expert developers see them as the code explaining itself.

### The Error is Your Friend

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR AS COMMUNICATION                    │
│                                                             │
│    CODE: "Something went wrong!"                            │
│         │                                                   │
│         │ TRANSLATION                                       │
│         ▼                                                   │
│    ┌─────────────────────────────────────────────────────┐  │
│    │ I tried to do X                                     │  │
│    │ But Y was in an unexpected state                    │  │
│    │ So I couldn't complete X                            │  │
│    │ Here's exactly where I was (stack trace)            │  │
│    │ Here's exactly what I saw (error details)           │  │
│    └─────────────────────────────────────────────────────┘  │
│                                                             │
│    YOUR JOB: Figure out WHY Y was in that state            │
└─────────────────────────────────────────────────────────────┘
```

## Behavioral Specification

### Layer 1: Error Message Parsing

#### 1.1 Anatomy of an Error

```markdown
┌─────────────────────────────────────────────────────────────┐
│                    ERROR MESSAGE ANATOMY                     │
│                                                             │
│  TypeError: Cannot read property 'name' of undefined       │
│  ────────┬────────── ───────────────────────────────┬────── │
│          │                                        │        │
│    ERROR TYPE                               ERROR DETAILS   │
│    (What category)                         (What happened)  │
│                                                             │
│  at User.getFullName (User.ts:45)                          │
│  ───────────────────────────────────────────┬─────────────  │
│  WHERE (Stack trace)                        │ LINE NUMBER    │
│                                            │                │
│  at async UserController.handleRequest      │                │
│  ───────────────────────────────────────────┘               │
│  CALL STACK (How we got here)                               │
└─────────────────────────────────────────────────────────────┘
```

#### 1.2 Error Type Categories

| Error Type | Implies | Investigation Direction |
|------------|---------|--------------------------|
| `TypeError` | Wrong type used | Check variable types |
| `ReferenceError` | Variable not defined | Check spelling, scope |
| `SyntaxError` | Invalid syntax | Check parsing |
| `RangeError` | Value out of bounds | Check limits |
| `EvalError` | eval() misuse | Avoid eval |
| `URIError` | URI encoding issue | Check encode/decode |
| `AssertionError` | Condition failed | Check logic |

#### 1.3 Reading the Error Details

```typescript
// Error: "Cannot read property 'name' of undefined"

// BREAK IT DOWN:
"Cannot read property"  // You're accessing a property
'of undefined'          // The object is undefined
'name'                  // The property name

// TRANSLATE:
"The variable you're trying to access the 'name' property on
is undefined at this point"
```

### Layer 2: Stack Trace Analysis

#### 2.1 Stack Trace Reading Order

```
┌─────────────────────────────────────────────────────────────┐
│                  STACK TRACE READING                         │
│                                                             │
│  1. START AT THE BOTTOM                                    │
│     └─ This is where execution began                        │
│                                                             │
│  2. READ UPWARD                                             │
│     └─ Each line is who called the next                     │
│                                                             │
│  3. ERROR IS AT THE TOP (usually)                          │
│     └─ This is where it actually broke                      │
│                                                             │
│  Example:                                                   │
│                                                             │
│  at handleClick (Button.tsx:45)        ◄── ERROR HERE     │
│      at onPress (Touchable.tsx:89)                         │
│          at Navigator.dispatch (Router.ts:200)              │
│              at App.render (App.tsx:50)                    ◄── START HERE
│                                                             │
│  Translation: App.render called Navigator.dispatch,         │
│  which called onPress, which called handleClick,            │
│  which broke at line 45 in Button.tsx                      │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2 Finding the Real Problem

The error is AT the problem, but the CAUSE is often BEFORE:

```typescript
// Line 45: user.getFullName()
//            ^^^^ undefined here

// But WHY is user undefined?
// Look at line 30: const user = getUser(id);
// Look at getUser: returns undefined if id invalid
// Look at id: passed from request
// Conclusion: invalid id passed

// The error is at line 45
// The bug is at how id was validated
```

### Layer 3: Context Analysis

#### 3.1 Five Whys for Errors

```markdown
## Root Cause Analysis: "Cannot read property 'name' of undefined"

WHY 1: Why is 'name' being accessed on undefined?
└─ Because user is undefined

WHY 2: Why is user undefined?
└─ Because getUserById returned undefined

WHY 3: Why did getUserById return undefined?
└─ Because the user ID doesn't exist in the database

WHY 4: Why is a non-existent ID being queried?
└─ Because the API endpoint didn't validate the ID parameter

WHY 5: Why didn't the API validate the ID?
└─ Because validation was not implemented

CONCLUSION: Implement ID validation at API entry point
FIX: Add schema validation for user ID parameter
```

#### 3.2 Error Context Checklist

When analyzing an error, check these common causes:

| Category | What to Check |
|----------|---------------|
| Null/Undefined | Where should this value come from? |
| Type Mismatch | What type is expected? What was passed? |
| Async | Is there a missing await? |
| Scope | Is the variable in scope? |
| Import | Is the module imported correctly? |
| Timing | Is the code running at the right time? |

### Layer 4: Error Message Translation

#### 4.1 Common Error Translations

| Error Message | Real Meaning | Common Fix |
|--------------|--------------|------------|
| `Cannot read X of undefined` | X is undefined | Add null check or find why it's undefined |
| `X is not a function` | X is not callable | Check if it's the right type |
| `X is not defined` | X doesn't exist in scope | Check spelling, imports |
| `Cannot set property X of undefined` | Object X doesn't exist | Create object first |
| `X is not an array` | X should be array | Check type conversion |
| `Unexpected token` | Syntax error | Check quotes, brackets, commas |
| `Module not found` | Import path wrong | Check file path, extensions |
| `Cyclic object value` | Circular reference | Check data structure |

#### 4.2 Error Message Templates

```markdown
## Template: "Cannot read [PROPERTY] of [UNDEFINED_REASON]"

Pattern: You're accessing [property] on something that is [undefined/null]

Questions to Ask:
1. Where does [property] come from?
2. Why is [undefined_reason]?
3. What should [undefined_reason] be?
4. Where should it be set?

## Template: "[TYPE] is not a [EXPECTED_TYPE]"

Pattern: Variable has wrong type

Questions to Ask:
1. What type do you expect?
2. What type is it actually?
3. Where is it created?
4. Where is type checking/validation?

## Template: "[FUNCTION] is not defined"

Pattern: Variable/function not in scope

Questions to Ask:
1. Is it spelled correctly?
2. Is it imported?
3. Is it in scope?
4. Is it declared before use?
```

### Layer 5: From Error to Fix

#### 5.1 The Error → Fix Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR → FIX WORKFLOW                      │
│                                                             │
│  ERROR MESSAGE                                              │
│      │                                                     │
│      ▼                                                     │
│  PARSE (What happened?)                                     │
│      │                                                     │
│      ▼                                                     │
│  LOCATE (Where in code?)                                    │
│      │                                                     │
│      ▼                                                     │
│  TRACE (Why did it happen?)                                 │
│      │                                                     │
│      ▼                                                     │
│  HYPOTHESIZE (What would fix it?)                           │
│      │                                                     │
│      ▼                                                     │
│  VERIFY (Does fix work?)                                    │
│      │                                                     │
│      ▼                                                     │
│  PREVENT (Test for regression?)                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2 Fix Quality Checklist

```markdown
## Fix Verification

□ Does the original error still occur without the fix?
□ Does the fix actually solve the root cause?
□ Will this fix break anything else?
□ Is this a symptom fix or a root cause fix?
□ Should I add a test for this case?
□ Is there a better way to handle this?
□ Did I introduce new potential errors?
```

## Common Error Patterns

### Pattern 1: Async/Await Errors

```typescript
// Error: "async/await is only valid in async functions"
// OR: "Promise resolved before async operation completed"

Common Causes:
- Forgetting 'async' keyword
- Not awaiting an async call
- Mixing callbacks with async/await

Diagnosis:
- Check if function is marked 'async'
- Check if all async calls have 'await'
- Check if promise handling is correct
```

### Pattern 2: Object/Array Errors

```typescript
// Error: "Cannot read property 'X' of undefined"
// OR: "X is not iterable"

Common Causes:
- Accessing index beyond array bounds
- Accessing property on null/undefined
- Destructuring from non-object

Diagnosis:
- Check initial value
- Check if it was reassigned
- Check if API returned expected type
```

### Pattern 3: Import/Module Errors

```typescript
// Error: "Module not found"
// OR: "Cannot find module"

Common Causes:
- Wrong path
- Wrong file extension
- Case sensitivity
- Circular dependencies

Diagnosis:
- Verify file exists
- Check path matches exactly
- Check case sensitivity
- Check package.json exports
```

### Pattern 4: Type Errors

```typescript
// Error: "Argument of type 'X' is not assignable to parameter of type 'Y'"
// OR: "Property 'X' does not exist on type 'Y'"

Common Causes:
- Type inference too narrow
- Missing type annotation
- Wrong type imported
- Using 'any' too liberally

Diagnosis:
- Check type definitions
- Check what TS infers
- Check import types
- Consider type widening
```

## Advanced Error Analysis

### Analyzing Minified Stack Traces

```markdown
When stack traces are minified:

1. Look for source maps (xxxx.js.map)
2. Use browser DevTools to unminify
3. Look for recognizable function names
4. Check if build is production mode

Example Minified:
at n (a.1234.js:1)
at r (b.5678.js:2)

What to do:
- Enable source maps in dev
- Check console for original location
- Use 'Pause on caught exceptions'
```

### Analyzing Network Errors

| Error | Meaning | Investigation |
|-------|---------|---------------|
| 400 Bad Request | Invalid request | Check request body/params |
| 401 Unauthorized | Not authenticated | Check auth token |
| 403 Forbidden | Authenticated but no permission | Check user roles |
| 404 Not Found | Resource doesn't exist | Check URL, resource ID |
| 500 Server Error | Server exception | Check server logs |
| Network Error | Connection failed | Check network, CORS |

### Analyzing Memory/Performance Errors

```markdown
"Maximum call stack exceeded"
└─ Infinite recursion — check base case in recursive function

"Out of memory"
└─ Memory leak — check for unbounded data structures

"Execution timeout"
└─ Infinite loop or too much work — check loops, algorithms
```

## Key Principles

### 1. Read the Error (Actually Read It)

Most developers skim errors. Actually read every word — they're trying to tell you something.

### 2. Trust the Stack Trace

The stack trace is honest. If it says line 45, the problem is accessible from line 45. The question is WHY it has that value.

### 3. One Error at a Time

Fix one error, then see if others were downstream effects. Don't try to fix everything at once.

### 4. Reproduce Before Fixing

Make the error happen reliably before attempting to fix it. If you can't reproduce, you can't verify the fix.

### 5. The First Error is Usually the Root Cause

Don't assume the first error is a symptom. Usually it's the root. Fix that first.

## Relationship to Other Skills

- `debug-session` — Uses this skill for error understanding
- `reproduce-bug` — Complementary skill for reliable reproduction
- `trace-execution` — Follows error understanding in debug flow
- `test-think` — Write tests to prevent future errors
- `understand-error` — This IS this skill (self-referential)
