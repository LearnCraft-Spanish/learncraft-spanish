# 📜 Scripts Reference Guide

_Complete guide to all npm/pnpm scripts in LearnCraft Spanish_

---

## Quick Reference

| Script | Use Case |
|--------|----------|
| `pnpm start` | Start development server |
| `pnpm test:hexagon:watch` | Test while developing |
| `pnpm validate` | Pre-commit check (lint + format + typecheck) |
| `pnpm build` | Build for production |

---

## Development Scripts

### `pnpm start`

**What it does:** Starts the Vite development server with hot module replacement (HMR).

**When to use:**
- Daily development work
- Testing features locally
- Debugging in browser

**Details:**
- Runs on `http://localhost:5173` by default
- Auto-reloads on file changes
- Includes React DevTools support
- Uses `.env` file for environment variables

**Example:**
```bash
pnpm start
# Server running at http://localhost:5173
```

---

### `pnpm build`

**What it does:** Creates optimized production build in `dist/` directory.

**When to use:**
- Before deploying to production
- Testing production build locally
- Checking bundle size

**Details:**
- Runs TypeScript type checking
- Minifies JavaScript and CSS
- Generates source maps
- Optimizes assets
- Output: `dist/` directory

**Example:**
```bash
pnpm build
# Output: dist/
```

---

### `pnpm preview`

**What it does:** Serves the production build locally for testing.

**When to use:**
- Testing production build before deploying
- Verifying build output works correctly

**Details:**
- Must run `pnpm build` first
- Serves from `dist/` directory
- Does NOT include HMR

**Example:**
```bash
pnpm build
pnpm preview
# Preview running at http://localhost:4173
```

---

## Testing Scripts

### `pnpm test`

**What it does:** Runs legacy tests (outside hexagon) with coverage report.

**When to use:**
- Testing legacy code
- Running all non-hexagon tests
- CI/CD pipelines

**Details:**
- Uses default `vitest.config.ts`
- Runs once and exits
- Generates coverage report
- **Note:** For new code, use `test:hexagon` instead

**Example:**
```bash
pnpm test
# Runs all legacy tests
```

---

### `pnpm test:hexagon`

**What it does:** Runs hexagonal architecture tests with coverage report.

**When to use:**
- Testing hexagon code
- CI/CD pipelines
- Pre-commit checks

**Details:**
- Uses `vitest.config-hexagon.ts`
- Includes proper mock setup
- Generates coverage report
- Runs once and exits

**Example:**
```bash
pnpm test:hexagon
# Runs all hexagon tests with coverage
```

---

### `pnpm test:hexagon:watch`

**What it does:** Runs hexagon tests in watch mode (re-runs on file changes).

**When to use:**
- Active development
- Test-driven development (TDD)
- Writing new features

**Details:**
- Uses `vitest.config-hexagon.ts`
- Auto-reruns tests when files change
- Shows only changed/failed tests
- Interactive UI

**Example:**
```bash
pnpm test:hexagon:watch
# Watch mode active - edit code to trigger tests
```

---

### `pnpm mutate` / `pnpm mutate:hexagon`

**What it does:** Runs mutation testing to verify test quality.

**When to use:**
- **CI/CD only** - NOT for local development
- Verifying test suite effectiveness
- Measuring test quality

**Details:**
- `mutate`: Tests legacy code
- `mutate:hexagon`: Tests hexagon code
- **VERY SLOW** (can take hours)
- Uses Stryker Mutator
- Generates mutation testing report

**Warning:** ⚠️ Only run in CI or when you have time to spare!

**Example:**
```bash
# Don't run locally unless you have hours to spare
pnpm mutate:hexagon
# Running mutation tests... (this will take a while)
```

---

## Code Quality Scripts

### `pnpm lint`

**What it does:** Runs ESLint to check for code quality issues.

**When to use:**
- Checking for linting errors
- CI/CD pipelines
- Before committing (use `lint:fix` instead)

**Details:**
- Checks all `.js`, `.jsx`, `.ts`, `.tsx` files
- Reports errors and warnings
- Does NOT auto-fix issues

**Example:**
```bash
pnpm lint
# ✖ 3 problems (2 errors, 1 warning)
```

---

### `pnpm lint:fix`

**What it does:** Runs ESLint and automatically fixes fixable issues.

**When to use:**
- **Use this by default** instead of `lint`
- Before committing code
- Cleaning up code style

**Details:**
- Auto-fixes formatting issues
- Auto-fixes simple rule violations
- Some issues may require manual fixes

**Example:**
```bash
pnpm lint:fix
# ✔ Fixed 5 issues automatically
```

---

### `pnpm format`

**What it does:** Formats all code with Prettier.

**When to use:**
- Ensuring consistent code formatting
- Before committing
- After merge conflicts

**Details:**
- Formats `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.md` files
- Uses `.prettierrc.json` config
- Overwrites files

**Example:**
```bash
pnpm format
# Formatted 42 files
```

---

### `pnpm format:check`

**What it does:** Checks if code is formatted (does NOT modify files).

**When to use:**
- CI/CD pipelines
- Verifying code is formatted before push

**Details:**
- Returns exit code 1 if formatting needed
- Does NOT modify files

**Example:**
```bash
pnpm format:check
# ✖ 3 files need formatting
```

---

### `pnpm typecheck`

**What it does:** Runs TypeScript compiler to check for type errors.

**When to use:**
- Checking for TypeScript errors
- Before committing
- CI/CD pipelines

**Details:**
- Uses `tsconfig.json`
- Does NOT emit files (`--noEmit`)
- Checks entire codebase

**Example:**
```bash
pnpm typecheck
# ✔ No TypeScript errors found
```

---

### `pnpm validate`

**What it does:** Runs `lint:fix`, `format`, and `typecheck` in sequence.

**When to use:**
- **Before every commit** (recommended)
- Before creating a PR
- Final check before pushing

**Details:**
- Fixes linting issues
- Formats code
- Checks types
- All-in-one quality check

**Example:**
```bash
pnpm validate
# Running lint:fix... ✓
# Running format... ✓
# Running typecheck... ✓
# All checks passed!
```

---

## Dependency Management Scripts

### `pnpm install:local`

**What it does:** Installs dependencies for local development (non-frozen lockfile).

**When to use:**
- Initial project setup
- Adding new dependencies
- Updating dependency versions

**Details:**
- Deletes existing lockfile
- Creates new lockfile in `lockfiles/local/`
- Allows version resolution changes
- **Use this for local development**

**Example:**
```bash
pnpm install:local
# Installing dependencies...
```

---

### `pnpm install:ci`

**What it does:** Installs dependencies with frozen lockfile (CI mode).

**When to use:**
- CI/CD pipelines
- Ensuring reproducible installs
- When you want exact versions from lockfile

**Details:**
- Uses frozen lockfile from `lockfiles/ci/`
- Fails if lockfile is out of sync
- Ensures consistent installs

**Example:**
```bash
pnpm install:ci
# Installing from frozen lockfile...
```

---

### `pnpm install:ci:regenerate`

**What it does:** Regenerates the CI lockfile.

**When to use:**
- After adding/updating dependencies
- When CI lockfile is out of sync
- Updating the canonical lockfile

**Details:**
- Deletes `lockfiles/ci/`
- Creates new CI lockfile
- Runs regular install after

**Example:**
```bash
pnpm install:ci:regenerate
# Regenerating CI lockfile...
```

---

### `pnpm update-shared`

**What it does:** Updates `@learncraft-spanish/shared` package to latest version.

**When to use:**
- When shared package is updated
- Getting latest domain types
- Syncing with backend contracts

**Details:**
- Fetches latest version of shared package
- Updates CI lockfile
- Re-runs install

**Example:**
```bash
pnpm update-shared
# Updating @learncraft-spanish/shared to latest...
# Updated to v0.10.9
```

---

## Utility Scripts

### `pnpm predeploy`

**What it does:** Runs before deployment (automatically).

**When to use:**
- **Automatic** - runs before deploy
- You typically don't call this directly

**Details:**
- Runs `pnpm build`
- Used by deployment systems
- Lifecycle hook

---

### `pnpm scss`

**What it does:** Watches and compiles SCSS files for legacy coaching styles.

**When to use:**
- Working on legacy coaching components
- Modifying SCSS styles

**Details:**
- Watches `src/components/Coaching/styles/`
- Auto-compiles on changes
- **Note:** New code should use CSS-in-JS or Tailwind

**Example:**
```bash
pnpm scss
# Watching for SCSS changes...
```

---

### `pnpm refresh-mockdata`

**What it does:** Updates cached mock data from API.

**When to use:**
- Refreshing test fixtures
- Updating mock data after API changes

**Details:**
- Runs `update-cache.ts` script
- Fetches fresh data from API
- Updates mock files

**Example:**
```bash
pnpm refresh-mockdata
# Refreshing mock data cache...
```

---

## Metrics Scripts

### `pnpm deployment-frequency`

**What it does:** Calculates deployment frequency metrics.

**When to use:**
- Analyzing team velocity
- DORA metrics reporting

**Details:**
- Analyzes git history
- Calculates deployments per time period
- Outputs to console

**Example:**
```bash
pnpm deployment-frequency
# Deployment frequency: 3.2 per week
```

---

### `pnpm lead-time`

**What it does:** Calculates lead time from commit to production.

**When to use:**
- Analyzing delivery speed
- DORA metrics reporting

**Details:**
- Analyzes git history
- Calculates time from commit to production
- Outputs to console

**Example:**
```bash
pnpm lead-time
# Average lead time: 2.5 days
```

---

## Common Workflows

### Daily Development

```bash
# 1. Start dev server
pnpm start

# 2. Run tests in watch mode (separate terminal)
pnpm test:hexagon:watch

# 3. Before committing
pnpm validate
```

---

### Before Creating a PR

```bash
# Run full validation
pnpm validate

# Run all hexagon tests
pnpm test:hexagon

# Check everything passes
```

---

### Adding a New Dependency

```bash
# 1. Add the dependency
pnpm add <package-name>

# 2. Regenerate CI lockfile
pnpm install:ci:regenerate

# 3. Commit both package.json and lockfiles
git add package.json lockfiles/
git commit -m "chore: add <package-name>"
```

---

### After Pulling Latest Code

```bash
# 1. Install any new dependencies
pnpm install:local

# 2. Verify everything works
pnpm validate

# 3. Run tests
pnpm test:hexagon
```

---

### Debugging Build Issues

```bash
# 1. Clean build
rm -rf dist/

# 2. Build fresh
pnpm build

# 3. Test production build
pnpm preview
```

---

## Troubleshooting

### Script fails with "command not found"

**Problem:** pnpm or Node.js not installed/configured.

**Solution:**
```bash
# Check versions
node --version  # Should be >= 16
pnpm --version  # Should be >= 7

# If missing, install
npm install -g pnpm
```

---

### Tests fail with module errors

**Problem:** Dependencies not installed or out of sync.

**Solution:**
```bash
# Clean install
rm -rf node_modules
pnpm install:local
```

---

### Build fails with memory errors

**Problem:** Not enough memory for build process.

**Solution:**
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 pnpm build
```

---

### Linter errors won't auto-fix

**Problem:** Some issues require manual fixes.

**Solution:**
1. Read the error message carefully
2. Fix the issue manually
3. Run `pnpm lint:fix` again

---

## Script Aliases

For convenience, you can add these to your shell config:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias dev="pnpm start"
alias test="pnpm test:hexagon:watch"
alias check="pnpm validate"
```

---

## Related Documentation

- [`ONBOARDING.md`](./ONBOARDING.md) - Setup and getting started
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Common issues and solutions
- [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) - Testing guidelines
- [`README.md`](../README.md) - Project overview

---

**Remember:** When in doubt, `pnpm validate` is your friend! Run it before every commit.
