# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Skill Manager** is a full-stack web application for browsing, orchestrating, and syncing AI Skill files to IDEs. It provides a local UI for managing AI programming assistant skills with features including fuzzy search, workflow orchestration, IDE synchronization, and i18n support.

**Tech Stack**: React 19 + TypeScript (Vite) · Express 5 (ESM) · Tailwind CSS v4 + shadcn/ui · Zustand 5 · Vitest + Playwright

---

## Developer Commands

```bash
npm run dev        # Frontend (5173) + Backend (3001) in parallel
npm run build      # tsc --noEmit + vite build
npm run typecheck  # TypeScript check only
npm run lint       # ESLint (zero warnings enforced)
npm run lint:fix   # Auto-fix lint issues
npm run format     # Prettier format all files
npm run test        # Vitest watch mode
npm run test:run    # Vitest single run
npm run test:coverage # Coverage report
npm run test:e2e    # Playwright E2E tests
npm run test:all    # vitest run + playwright test
```

---

## Architecture

```
skill-package/
├── src/                  # React frontend (Vite)
│   ├── components/       # By feature: skills/, sync/, workflow/, layout/, stats/, settings/
│   ├── stores/           # Zustand stores (skill-store, sync-store, ui-store, workflow-store, bundle-store)
│   ├── hooks/            # Custom hooks (useSkillSearch, useSyncFlow, useFilteredSkills...)
│   ├── lib/api.ts        # Frontend API client (single entry point for all fetch calls)
│   └── i18n/             # i18n configuration
├── server/               # Express backend
│   ├── routes/           # Thin route handlers (parse + validate → delegate)
│   ├── services/         # Business logic (functional exports, no classes)
│   └── utils/            # pathUtils, fileUtils, frontmatterParser, yamlUtils
├── shared/               # Shared types, schemas, constants (single source of truth)
├── skills/               # Skill files (.md with YAML frontmatter)
├── config/               # YAML config files (categories.yaml, settings.yaml)
└── tests/                # unit/, integration/, e2e/
```

**Dev Server Ports**: Frontend at `http://localhost:5173`, Backend at `http://localhost:3001` (proxied via Vite `/api`)

---

## Critical Rules (LLM-frequent-mistakes)

### ESM Imports (Server)

Server-side imports **must** include `.js` extension: `import { foo } from "./bar.js"` even when source is `.ts`. This is required by NodeNext moduleResolution.

### Shared Types

All shared types go in `shared/types.ts` — **never** define types in `src/` or `server/`. Zod schemas in `shared/schemas.ts`, constants in `shared/constants.ts`.

### Error Handling

Use `AppError` class from `server/types/errors.ts` — **never** hardcode error codes. Use `ErrorCode` constants from `shared/constants.ts`. Routes must wrap in try/catch → `next(err)`.

### File Operations

Use `safeWrite()` (atomic + concurrent-safe) — **never** `fs.writeFile()`. Use `fs-extra` — **never** native `fs` module. All file operations must validate path with `isSubPath()` before proceeding.

### API Layer (Frontend)

All frontend fetch calls go via `src/lib/api.ts` — **never** call `fetch` directly in components/stores.

### Routing Order (Express)

These routes must register **before** their parameterized counterparts:

- `POST /api/workflows/preview` before `GET /api/workflows/:id`
- `GET /api/skills/errors` before `GET /api/skills/:id`
- `GET /api/skill-bundles/export` before `GET /api/skill-bundles/:id`

---

## Git Workflow

### Pre-commit (lint-staged)

- `eslint --max-warnings=0` — zero tolerance for warnings
- Prettier check on all staged files

### Pre-push (main branch only)

- Conventional Commits based versioning
- `feat:` → patch only; `feat!:` or `fix!:` → minor
- Non-main branches: hooks skipped entirely

### README Sync Rule

Changes to `src/`, `server/`, `shared/`, `skills/`, `_bmad-output/` **must** update both `README.md` (Chinese) and `README.en.md` (English) before commit. Use `git commit --no-verify` to skip if intentionally not updating docs.

---

## BMad Skills

This project uses BMad development methodology. Key skills for working with this codebase:

- `bmad-help` — Navigate project state and get recommendations
- `bmad-dev-story` — Execute story implementation
- `bmad-code-review` — Multi-layer adversarial code review
- `bmad-qa-generate-e2e-tests` — Generate E2E tests

**Execution pipeline**: `docs/execution-pipeline.md`  
**Skills inventory**: `docs/bmad-skills-inventory.md`
