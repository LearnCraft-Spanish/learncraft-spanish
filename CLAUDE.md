# CLAUDE.md — LearnCraft Spanish

Guidance for AI assistants working in this codebase.

---

## What This Project Is

**LearnCraft Spanish** is a web application to help English Speakers become fluent in Spanish. It assists students in reviewing grammatical concepts and supports the coaching staff that work with the students.

- **This repository** = Frontend (React, Vite, TypeScript)
- **Backend & shared** = Separate codebases. Shared domain types and contracts live in `@learncraft-spanish/shared` (npm package); the backend is not in this repo but serves the contracts defined in the shared package, as well as legacy routes.

---

## Architectural Principles

**Dependencies flow inward only.** Domain → application → infrastructure/interface → composition. No layer imports upward. See `src/hexagon/ARCHITECTURE.md`.

| Layer              | Role                               | Rule of thumb                                                                                 |
| ------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| **Domain**         | Pure transforms, frontend adapters | No React, no IO, no imports. Stateless only. Core types live in `@learncraft-spanish/shared`. |
| **Application**    | Runtime behavior, orchestration    | Use-cases, units, coordinators, queries. _All behavior flows through use-cases._              |
| **Infrastructure** | External service bindings          | Thin wrappers matching ports. No business logic.                                              |
| **Interface**      | React UI                           | Components and pages. One use-case hook per page; no business logic.                          |
| **Composition**    | Bootstrap                          | Static wiring only. No conditionals or effects.                                               |

**Testing:** Tests and mocks colocated: `example.test.ts`, `example.mock.ts`. Typed mocks (use `createTypedMock`); never untyped `vi.fn()`. Don't mock domain, invoke it.

**Code style:** Explicit return types on all hooks — no inferred types, no `typeof`, no `ReturnType<>`.

**Where domain lives:** Business logic and core type definitions live in `@learncraft-spanish/shared`. The frontend is not about business logic — it consumes shared types and focuses on orchestration, UI, and frontend-specific transforms.

---

## How to Get Around

| Directory                             | Purpose                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/hexagon/`                        | Main architecture — domain, application, infrastructure, interface, composition, testing         |
| `src/hexagon/domain/`                 | Pure transforms, frontend adapters for shared types (core types in `@learncraft-spanish/shared`) |
| `src/hexagon/application/`            | Use-cases, units, coordinators, queries, ports, adapters                                         |
| `src/hexagon/infrastructure/`         | HTTP, auth, API bindings                                                                         |
| `src/hexagon/interface/`              | React components, pages, routes                                                                  |
| `src/components/`, `src/hooks/`, etc. | Legacy code outside hexagon (being migrated over time)                                           |
| `documentation/`                      | PR standards, testing standards, prod checklist                                                  |
| `mocks/`                              | Shared mock data and providers                                                                   |

---

## Further Documentation

| Doc                                        | Purpose                                           |
| ------------------------------------------ | ------------------------------------------------- |
| `src/hexagon/ARCHITECTURE.md`              | Hexagonal architecture, layer roles, import rules |
| `documentation/TESTING_STANDARDS.md`       | Testing rules, mocking, cleanup                   |
| `documentation/PR_STANDARDS.md`            | PR checklist, architecture compliance             |
| `documentation/INTERNAL_PROD_CHECKLIST.md` | Production release process                        |
| `src/hexagon/**/BOUNDARIES.md`             | Per-layer boundary rules                          |
| `src/hexagon/**/README.md`                 | Component/subsystem-specific docs                 |

---

## Preferred Scripts

| Script                    | Use                                                     |
| ------------------------- | ------------------------------------------------------- |
| `pnpm start`              | Start dev server                                        |
| `pnpm test`               | Run legacy tests (outside hexagon only)                 |
| `pnpm test:hexagon`       | Run tests inside hexagonal architecture                 |
| `pnpm test:hexagon:watch` | Tests inside hexagonal in watch mode                    |
| `pnpm lint`               | Run ESLint                                              |
| `pnpm lint:fix`           | Run ESLint in fix mode (use by default)                 |
| `pnpm typecheck`          | TypeScript check                                        |
| `pnpm validate`           | Lint, format, typecheck                                 |
| `pnpm mutate:hexagon`     | Mutation testing for hexagon (only for CI, takes hours) |

---

## Operating Modes

### 1. Explain Non-Technical (No Code Gen)

**Typical use:** Often used from cloud / non-IDE contexts. User wants understanding, not edits.

**Focus on:**

- **Design** — How features fit together, UX flows, product intent
- **History** — Why decisions were made, migration context, legacy vs hexagon
- **Tradeoffs** — Pros and cons of specific design choices
- **Future Options** — What is feasible under current design constraints

**Avoid:**

- Technical details
- Code generation
- Suggesting edits or refactors
- Implementation details unless asked

**STRICT REQUIREMENT** Translate all descriptions to non-technical language. The user is not a developer.

**Example prompts:** "What does our technical debt look like?" "Why is this feature taking so long?" "Is there an easy way to implement this new feature?"

---

### 2. PR Review

**Typical Use:** Called from CI, make go/no-go call before approval.

**TOP PRIORITY:** Complete the "PR Review Checklist" found at `documentation/PR_STANDARDS.md`. Step through each item one at a time.

**Focus on**

- Correctness (explicit types, dependency direction, etc.)
- Compliance (architecture, test coverage, etc.)
- Clarity and Legibility (descriptive names, comments, JSDoc)
- Maintainibility (file size, tight coupling, indirection)

**Important:** We do not bypass systems, we enrich or divide them.

---

### 3. Feature Work

**Typical Use:** Used locally to build new features in codebase.

---

### 4. Explain Technical

**Typical Use:** Revisiting or updating architectural decisions for long-term stability.
