# CLAUDE.md — LearnCraft Spanish

Instructions for AI agents working in this codebase.

For the full documentation hierarchy (architecture, patterns, standards, etc.), see [`documentation/ONBOARDING.md`](./documentation/ONBOARDING.md). Everything below is agent-specific.

---

## Critical Rules

- **ALWAYS READ NEARBY DOCS FIRST** For any directory you work in, check for markdown files. ALWAYS read these before you make any edits or reviews. Even when reading only they may provide valuable context.
- **BOUNDARIES.md files are authoritative** — NOT the linter. Always verify against the relevant BOUNDARIES.md. Passing lint does not mean the architecture is correct. For rationale behind boundary rules, check sibling DECISIONS.md files where they exist. Decisions may be questioned by agents but neither decisions nor boundaries may be modified except by the human owner of the codebase.
- **Explicit return types required** — All hooks must have explicit return types (no inference, no `typeof`, no `ReturnType<>`).
- **Dependencies flow inward only** — Domain → Application → Infrastructure/Interface → Composition.
- **One use case per page** — Interface pages call exactly one use case hook.
- **New code goes in `src/hexagon/`** — Never extend legacy code outside the hexagon.

---

## Operating Modes

### PR Review

Follow `documentation/PR_STANDARDS.md` checklist + `documentation/PR_REVIEW_GUIDE.md` steps. Verify architecture against `BOUNDARIES.md` files in each layer touched — linter is NOT authoritative.

### Feature Development

Follow `documentation/FEATURE_WORKFLOW.md`. Build inside-out: Domain → Application → Infrastructure → Interface. All new code requires tests per `documentation/TESTING_STANDARDS.md`.

### Non-Technical Explanation

For non-developers. No code, no technical jargon.

**This repository is the frontend** — the web interface students, coaches, and admins see and interact with. It covers vocabulary practice, quizzes, flashcards, spaced repetition, course progression, and role-based views.

Answer questions here about:

- How the UI works and what users experience
- Quiz, flashcard, and lesson behavior from the user's perspective
- Student / Coach / Admin workflows and screens
- Design and UX tradeoffs
- Feasibility of proposed features or changes

**Redirect questions that belong elsewhere.** Non-technical users only have access to one repository at a time:

- **`lcs-api`** — API, backend logic, database access, server-side behavior
- **`lcs-shared`** — Core business definitions, cross-cutting types and contracts, terminology that spans the whole system

### Technical Architecture Review

Reference `documentation/ENGINEERING_DOCTRINE.md` and `src/hexagon/ARCHITECTURE.md` for architectural decisions and stability assessment.

---

## Quick Commands

```bash
pnpm start              # Dev server
pnpm test:hexagon:watch # Tests in watch mode
pnpm validate           # Lint + format + typecheck
```

All scripts: [`documentation/SCRIPTS.md`](./documentation/SCRIPTS.md)
