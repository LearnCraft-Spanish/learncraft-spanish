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
## Cursor Cloud specific instructions

Guidance for Cloud Agents setting up and running this repo in a fresh VM.

### Required secret

- **`GH_PACKAGE_KEY`** — a GitHub token with `read:packages` for the `LearnCraft-Spanish` org. Every install path fetches the private `@learncraft-spanish/shared` package from GitHub Packages (`npm.pkg.github.com`), so installs fail without it (anonymous → 401; a repo-scoped token → 403). `.npmrc` already references `${GH_PACKAGE_KEY}`; just export it in the environment. This is the same secret CI uses.
- Optional (only for a real authenticated login flow): `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENTID`, `VITE_API_AUDIENCE`, `VITE_BACKEND_DOMAIN`. Without them the dev server, build, and hexagon tests still work, and the app renders its public login screen with placeholder values.

### Node version (important)

`package.json` requires `engines.node: 24.x` with `engine-strict=true`, but the Cloud Agent daemon puts a Node 22 binary (`/exec-daemon/node`) ahead of nvm on `PATH`. Any `node`/`pnpm` command will silently use Node 22 and fail `engine-strict` unless you force Node 24 first, in every shell:

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 24            # or: nvm use 24, if already installed
export PATH="$(dirname "$(nvm which 24)"):$PATH"
hash -r
node -v                   # must print v24.x
corepack enable
corepack prepare pnpm@9.7.1 --activate
```

### Install

```bash
pnpm install:ci           # frozen install from lockfiles/ci; needs GH_PACKAGE_KEY
```

### Run the app

Create `.env` (placeholders are fine for a non-authenticated demo), then start Vite:

```bash
cat > .env <<'EOF'
VITE_API_AUDIENCE=https://api.learncraftspanish.com
VITE_AUTH0_DOMAIN=dev-placeholder.us.auth0.com
VITE_AUTH0_CLIENTID=placeholderClientId
VITE_LOCAL_DOMAIN=http://localhost:5173
VITE_BACKEND_DOMAIN=http://localhost:3000
REACT_APP_BACKEND_URL=http://localhost:3000
VITE_ENVIRONMENT=development
VITE_PORT=5173
EOF
pnpm start -- --host 0.0.0.0 --port 5173   # http://localhost:5173
```

The app is login-gated: with placeholder Auth0 values it renders the public "You must be logged in to use this app." landing screen (no real login completes).

### Verify

```bash
pnpm typecheck
pnpm lint
pnpm test:hexagon:ai      # mocked (MSW); no backend needed
pnpm build
```

---

## Quick Commands

```bash
pnpm start              # Dev server
pnpm test:hexagon:ai    # Runs test once (AI/CI mode)
pnpm validate:ai        # Lint + format + typecheck
pnpm gauntlet:preview   # Auth0-free visual specimen (port 5273)
```

**Sandbox note:** `pnpm test:hexagon:ai` stubs CSS/SCSS in Vitest and is safe to run in Cursor’s default sandbox. `pnpm start` / `pnpm gauntlet:preview` (real Vite SCSS) still use `sass-embedded`’s native Dart worker — run those Shell commands with `required_permissions: ["all"]`.

**Visual redesign / gauntlet screenshots:** Use [`.gauntlet/README.md`](./.gauntlet/README.md) and the [visual-gauntlet skill](./.cursor/skills/visual-gauntlet/SKILL.md). Never Auth0 and never real backend calls. Main fans out a **capture specialist** (`required_permissions: ["all"]`) for PNGs, then a **critic** that only `Read`s blind image paths — critics must not run Vite/Playwright. Do not claim visual review without `.gauntlet/out/<specimen>/bar/` + `app/` PNGs. `GenerateImage` is not a substitute.

All scripts: [`documentation/SCRIPTS.md`](./documentation/SCRIPTS.md)
