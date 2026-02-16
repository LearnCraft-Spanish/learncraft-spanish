# CLAUDE.md — LearnCraft Spanish

Quick reference guide for AI assistants working in this codebase.

---

## What This Project Is

**LearnCraft Spanish** - React/TypeScript frontend for Spanish language learning (students, coaches, admins).

- **This repository** = Frontend (React, Vite, TypeScript)
- **Backend & shared** = Separate repos. Domain types in `@learncraft-spanish/shared` npm package
- **Architecture** = Hexagonal (see `src/hexagon/ARCHITECTURE.md`)
- **Status** = Active migration from legacy to hexagon structure

---

## 🚨 Critical Rules

⚠️ **BOUNDARIES.md files are authoritative** - NOT the linter. Always verify against BOUNDARIES.md for architecture compliance.

⚠️ **Explicit return types required** - All hooks must have explicit return types (no inference, no `typeof`, no `ReturnType<>`).

⚠️ **Dependencies flow inward only** - Domain → Application → Infrastructure/Interface → Composition.

⚠️ **One use case per page** - Interface pages call exactly one use case hook.

📖 **Full details:** See `src/hexagon/ARCHITECTURE.md` and `documentation/ENGINEERING_DOCTRINE.md`

---

## 📚 Documentation Map

**Start here:**
- 📖 [`README.md`](./README.md) - Project overview and quick start
- 🏗️ [`src/hexagon/ARCHITECTURE.md`](./src/hexagon/ARCHITECTURE.md) - Hexagonal architecture guide
- 📋 [`documentation/ONBOARDING.md`](./documentation/ONBOARDING.md) - New developer setup

**For development:**
- 🔨 [`documentation/FEATURE_WORKFLOW.md`](./documentation/FEATURE_WORKFLOW.md) - Building features step-by-step
- 🎯 [`documentation/COMMON_PATTERNS.md`](./documentation/COMMON_PATTERNS.md) - Code conventions and patterns
- 📊 [`documentation/DATA_FLOW.md`](./documentation/DATA_FLOW.md) - State management and data flow
- 🔄 [`documentation/MIGRATION_GUIDE.md`](./documentation/MIGRATION_GUIDE.md) - Legacy to hexagon migration
- 📚 [`documentation/DOMAIN_GLOSSARY.md`](./documentation/DOMAIN_GLOSSARY.md) - Business terminology

**For quality:**
- 🧪 [`documentation/TESTING_STANDARDS.md`](./documentation/TESTING_STANDARDS.md) - Testing requirements
- ✅ [`documentation/PR_STANDARDS.md`](./documentation/PR_STANDARDS.md) - PR checklist
- 🔍 [`documentation/PR_REVIEW_GUIDE.md`](./documentation/PR_REVIEW_GUIDE.md) - Detailed review steps
- 🔧 [`documentation/TROUBLESHOOTING.md`](./documentation/TROUBLESHOOTING.md) - Common issues
- 📜 [`documentation/SCRIPTS.md`](./documentation/SCRIPTS.md) - All npm/pnpm scripts explained

**For architecture:**
- 📐 [`documentation/ENGINEERING_DOCTRINE.md`](./documentation/ENGINEERING_DOCTRINE.md) - Core principles
- 🔒 `src/hexagon/**/BOUNDARIES.md` - Per-layer boundary rules (authoritative)

---

## 🎭 Operating Modes

### Mode 1: PR Review (CI Context)

**Priority:** Follow `documentation/PR_STANDARDS.md` checklist + `documentation/PR_REVIEW_GUIDE.md` detailed steps.

**CRITICAL:** Verify architecture against `BOUNDARIES.md` files - linter is NOT authoritative.

**Principle:** We do not bypass systems, we enrich or divide them.

---

### Mode 2: Feature Development (Local Context)

**Workflow:** Follow `documentation/FEATURE_WORKFLOW.md` step-by-step.

**Pattern:** Domain (pure logic) → Application (orchestration) → Infrastructure (I/O) → Interface (UI) → Composition (wiring).

**Testing:** All new code requires tests (see `documentation/TESTING_STANDARDS.md`).

---

### Mode 3: Explain Non-Technical (Cloud Context)

**Audience:** Non-developers (product, stakeholders).

**Focus:** Design, UX, tradeoffs, feasibility - NO technical details, NO code.

**Requirement:** Translate ALL descriptions to plain language.

---

### Mode 4: Explain Technical (Architecture Review)

**Purpose:** Architectural decisions, long-term stability, technical debt assessment.

**Reference:** `documentation/ENGINEERING_DOCTRINE.md` and `src/hexagon/ARCHITECTURE.md`

---

## ⚡ Quick Commands

```bash
pnpm start              # Dev server
pnpm test:hexagon:watch # Test in watch mode
pnpm validate           # Lint + format + typecheck
```

📖 **All commands:** See [`documentation/SCRIPTS.md`](./documentation/SCRIPTS.md)

---

## 🗺️ Codebase Structure

```
src/hexagon/          # Modern architecture (use for all new code)
  ├── domain/         # Pure logic, no dependencies
  ├── application/    # Use cases, queries, orchestration
  ├── infrastructure/ # API clients, external services
  ├── interface/      # React components, pages
  └── composition/    # App bootstrap, providers

src/components/       # Legacy (being migrated)
src/hooks/            # Legacy (being migrated)

documentation/        # All project documentation
```

📖 **Full details:** See `src/hexagon/ARCHITECTURE.md`

---

**Remember:** This is a quick reference. For detailed information, always consult the specific documentation files linked above.
