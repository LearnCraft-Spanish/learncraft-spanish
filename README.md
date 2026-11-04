# LearnCraft Spanish

A web application for learning Spanish, built with React, TypeScript, and hexagonal architecture.

---

## Overview

**LearnCraft Spanish** helps English speakers learn Spanish through interactive vocabulary practice, customizable quizzes, spaced repetition flashcards, and course progression tracking. Supports Student, Coach, and Admin roles.

**Tech stack**: React 19, TypeScript, Vite, TanStack Query, Auth0, Vitest, ESLint, Prettier, Netlify.

---

## Quick Start

```bash
git clone <repository-url>
cd learncraft-spanish
doppler login && doppler setup # env vars come from Doppler; see documentation/SECRETS.md
pnpm setup:npm-auth            # GitHub Packages token into ~/.npmrc
pnpm install:local
pnpm start                     # http://localhost:5173
```

**Prerequisites**: Node.js >= 24, pnpm >= 7, Git, Doppler CLI.

---

## Documentation

Start with [`documentation/ONBOARDING.md`](./documentation/ONBOARDING.md) — it walks through setup, engineering principles, architecture, and all project documentation in the right order.

For AI agents: [`CLAUDE.md`](./CLAUDE.md).

---

## License

ISC
