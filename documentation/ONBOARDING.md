# Developer Onboarding

_Setup, then the guided path through everything you need to know._

---

## 1. Setup

### Prerequisites

- **Node.js** >= 16 ([nvm](https://github.com/nvm-sh/nvm) recommended)
- **pnpm** >= 7 (`npm install -g pnpm`)
- **Git**

### Clone, Install, Run

```bash
git clone <repository-url>
cd learncraft-spanish
pnpm install:local
cp .env.development .env   # edit with your Auth0/API credentials
pnpm start                 # http://localhost:5173
pnpm test:hexagon          # verify tests pass
```

If anything fails, see [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md).

---

## 2. Engineering Doctrine

Read [`ENGINEERING_DOCTRINE.md`](./ENGINEERING_DOCTRINE.md) first. Everything else derives from it.

It defines five non-negotiable principles for the system:

0. **Explicit dependency direction** — No circular authority. If cause and effect can't be drawn as a directed graph, the system is decaying.
1. **Explicit boundaries and interfaces** — Modules have defined responsibility. Every boundary is crossed through declared interfaces.
2. **Testability** — Every module has verifiable behavioral expectations. If it can't be tested in isolation, it isn't owned.
3. **Maintainability** — The cost of understanding and modifying behavior must remain low.
4. **Extensibility and portability** — New features don't destabilize. The system can move across frameworks without rewriting.

These are structural, not stylistic. They drive every architectural and process decision below.

---

## 3. Architecture

Read [`src/hexagon/ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md). This is the implementation of the doctrine.

The codebase uses **hexagonal architecture** (ports and adapters). Six layers, each with a single responsibility:

| Layer | Responsibility | Dependencies |
|---|---|---|
| **Domain** | Pure business logic | None |
| **Application** | Use cases, queries, orchestration | Domain |
| **Infrastructure** | External APIs, HTTP clients | Domain, Application |
| **Interface** | React components, pages | Domain, Application |
| **Composition** | App bootstrap, providers | All layers |
| **Testing** | Test utilities, factories | All layers |

**Key rule**: Dependencies flow inward only. Interface and Infrastructure depend on Application and Domain — never the reverse.

---

## 4. Boundaries

Each layer has a `BOUNDARIES.md` file that defines what is and isn't allowed in that layer.

**These are the authoritative source of truth for architecture rules.** Not the linter. The linter catches common import violations, but passing lint does not mean the architecture is correct. `BOUNDARIES.md` defines the actual rules — including semantic boundaries the linter can't enforce (e.g., "business logic doesn't belong in infrastructure").

Read the BOUNDARIES.md in each layer:
- `src/hexagon/domain/BOUNDARIES.md`
- `src/hexagon/application/BOUNDARIES.md`
- `src/hexagon/infrastructure/BOUNDARIES.md`
- `src/hexagon/interface/BOUNDARIES.md`
- Subdirectory BOUNDARIES.md files where they exist

---

## 5. Hexagon vs Legacy

The codebase has two worlds:

```
src/hexagon/          ← Modern architecture. All new code goes here.
src/components/       ← Legacy. Being migrated.
src/hooks/            ← Legacy. Being migrated.
src/sections/         ← Legacy. Being migrated.
src/types/            ← Legacy. Being migrated.
src/functions/        ← Legacy. Being migrated.
```

**Rule**: New features are always built in `src/hexagon/`. Legacy code outside `src/hexagon/` is never extended — it's either migrated or left alone until it can be.

---

## 6. Migration

Read [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) when you need to touch legacy code.

Migration means classifying each piece of legacy code by responsibility (domain logic? API call? UI? orchestration?) and moving it to the correct hexagonal layer. The guide covers when to migrate, the step-by-step process, and a checklist.

The goal: everything eventually lives in `src/hexagon/`, following the architecture and boundaries.

---

## 7. The Domain

Read [`DOMAIN_GLOSSARY.md`](./DOMAIN_GLOSSARY.md) to understand the business language.

This app teaches Spanish. The key concepts: courses, lessons (cumulative), vocabulary, examples (sentences), quizzes (multiple types and modes), flashcards (spaced repetition), skill tags, student progress, and three user roles (Student, Coach, Admin). The glossary defines all of these precisely.

Understanding the domain is essential — code should use the same terminology the business uses.

---

## 8. Daily Development

These docs cover how to write code day-to-day:

- [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) — Naming conventions, file organization, TypeScript patterns, React patterns, import rules
- [`DATA_FLOW.md`](./DATA_FLOW.md) — State management (TanStack Query for server state, Context for global UI, local state for components), data flow through layers, cache invalidation
- [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) — What to test per layer, mocking rules, mock patterns, cleanup, progressive improvement
- [`SCRIPTS.md`](./SCRIPTS.md) — All pnpm scripts explained (`pnpm validate`, `pnpm test:hexagon:watch`, etc.)

---

## 9. Contributing

When you're ready to build or review:

- [`FEATURE_WORKFLOW.md`](./FEATURE_WORKFLOW.md) — How to plan and implement features (break down by layer, build inside-out, validate, submit)
- [`PR_STANDARDS.md`](./PR_STANDARDS.md) — PR checklist and submission guidelines
- [`PR_REVIEW_GUIDE.md`](./PR_REVIEW_GUIDE.md) — Step-by-step review process (architecture verification, testing, code quality)

---

## 10. Reference

- [`SCRIPTS.md`](./SCRIPTS.md) — All scripts and what they do
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) — Common issues and solutions
- [`INTERNAL_PROD_CHECKLIST.md`](./INTERNAL_PROD_CHECKLIST.md) — Production release process
