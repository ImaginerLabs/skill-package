---
name: code-comment-writer
description: >-
  Writes precise, reader-oriented code comments explaining "why" not "what". Covers onboarding,
  refactoring, algorithm explanation, tech debt marking, and API integration scenarios.
  Should be used when the user mentions adding comments, documenting code, explaining code
  logic, improving code readability, or needs help understanding code during handoff.
  Distinguished from refactoring skills which focus on code structure changes.
category: coding
boundary:
  vs_react-component-refactor: "react-component-refactor focuses on restructuring code, this skill focuses on adding explanatory comments"
---

# Code Comment Writer

## Core Capability

Write precise, targeted code comments that explain the "why" behind code, not the "what". Comments should help future readers (including yourself) understand intent, edge cases, pitfalls, and migration context.

## When to Use

- **Onboarding**: Help new team members understand legacy code
- **Refactoring**: Mark migration context and known pitfalls
- **Algorithm Explanation**: Document complex logic decisions
- **Tech Debt**: Mark code that needs future attention
- **API Integration**: Explain external dependencies or quirks

## When NOT to Use

- Don't explain what the code literally does (e.g., `// increment i` for `i++`)
- Don't add comments for self-documenting code
- Don't add redundant comments that duplicate the code

## Reading Scenarios

This skill supports multiple reading scenarios:

| Scenario | Focus | Example |
|----------|-------|---------|
| Onboarding | Why this code exists, what's tricky | "This cache has a 5min TTL because..." |
| Refactoring | Migration notes, what to watch for | "TODO: remove after users migrate to V2" |
| Algorithm | Why this approach was chosen | "Using binary search because data is sorted" |
| Tech Debt | Why it's a problem, how to fix | "Slow because no index; add index in V2" |
| API Integration | Quirks, error handling | "Throws on 400, caller must handle" |

## Comment Types

### 1. Intent Comments
Explain why the code does what it does.

```typescript
// Using batch insert because single insert causes
// lock contention at high concurrency.
// TODO: switch to streaming after DB upgrade.
async function saveBatch(items: Item[]) { ... }
```

### 2. Edge Case Comments
Document known boundaries.

```typescript
// Handles empty string as valid input (matches legacy behavior).
// Max length: 10000 chars (DB constraint).
function normalize(input: string) { ... }
```

### 3. Pitfall Comments
Warn about surprising behavior.

```typescript
// WARNING: This mutates the original array.
// Use clone() first if that's not intended.
function process(items) { ... }
```

### 4. Migration Comments
Track transition state.

```typescript
// DEPRECATED: Use v2 API instead.
// Will remove after Q3 2024 deprecation deadline.
// TODO(team-backend): remove in V3.0
async function legacyFetch(id: string) { ... }
```

### 5. Diagram Comments (ASCII)
Use when logic flows are complex — see `references/diagram-guide.md`.

```typescript
/*
 * Payment flow
 *
 * User clicks pay
 *      │
 *      ▼
 * Validate inventory ──fail──▶ Show error
 *      │ success
 *      ▼
 * Create order ──...
 */
const handlePay = async () => { ... };
```

## Quality Guidelines

1. **Be specific**: `// retry up to 3 times` is better than `// retry logic`
2. **Include context**: Mention external constraints or past incidents
3. **Use TODO/FIXME/Deprecation markers** for actionable items
4. **Reference tickets** when possible: `// See JIRA-1234`
5. **Keep comments in sync**: Outdated comments are worse than none

## Anti-Patterns

| Anti-Pattern | Why It's Bad |
|-------------|--------------|
| `// increment i` | Restates what code does |
| `// check if null` | Obvious from code |
| `// TODO: fix this later` | Not actionable |
| Commented-out code | Just delete it |

## Relationship to References

- `references/diagram-guide.md` — When and how to use ASCII diagrams in comments