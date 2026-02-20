# CLAUDE.md — LearnCraft Spanish

Instructions for AI agents working in this codebase.

For the full documentation hierarchy (architecture, patterns, standards, etc.), see [`documentation/ONBOARDING.md`](./documentation/ONBOARDING.md). Everything below is agent-specific.

---

## Critical Rules

- **BOUNDARIES.md files are authoritative** — NOT the linter. Always verify against the relevant BOUNDARIES.md. Passing lint does not mean the architecture is correct. For rationale behind boundary rules, check sibling DECISIONS.md files where they exist. Decisions may be questioned by agents but neither decisions nor boundaries may be modified except by the human owner of the codebase. Decisions may be questioned by agents but neither decisions nor boundaries may be modified except by the human owner of the codebase.
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
For non-developers. Focus on design, UX, tradeoffs, feasibility. No code, no technical jargon.

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
