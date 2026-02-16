# 🚀 Developer Onboarding Guide

_Getting Started with LearnCraft Spanish Development_

Welcome to the LearnCraft Spanish frontend codebase! This guide will help you get up and running quickly.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 16 (we recommend using [nvm](https://github.com/nvm-sh/nvm) for version management)
- **pnpm** >= 7 (install with `npm install -g pnpm`)
- **Git** for version control
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd learncraft-spanish
```

### 2. Install Dependencies

```bash
# For local development
pnpm install:local

# OR for CI/testing
pnpm install:ci
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.development` or `.env.production`):

```bash
cp .env.development .env
```

Required environment variables:
- `VITE_AUTH0_DOMAIN` - Auth0 domain for authentication
- `VITE_AUTH0_CLIENT_ID` - Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Auth0 API audience
- `VITE_API_BASE_URL` - Backend API base URL
- Additional variables as needed for your environment

### 4. Start the Development Server

```bash
pnpm start
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

---

## Project Structure Overview

```
learncraft-spanish/
├── src/
│   ├── hexagon/              # Modern hexagonal architecture
│   │   ├── domain/           # Pure business logic
│   │   ├── application/      # Use cases, units, coordinators
│   │   ├── infrastructure/   # External service adapters
│   │   ├── interface/        # React components and pages
│   │   ├── composition/      # App bootstrap and providers
│   │   └── testing/          # Test utilities and factories
│   ├── components/           # Legacy components (being migrated)
│   ├── hooks/                # Legacy hooks (being migrated)
│   └── routes/               # Legacy routing
├── documentation/            # All project documentation
├── tests/                    # Test setup and configuration
└── mocks/                    # Shared mock data

```

---

## Essential Scripts

| Script                    | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `pnpm start`              | Start development server                        |
| `pnpm test`               | Run legacy tests                                |
| `pnpm test:hexagon`       | Run hexagonal architecture tests                |
| `pnpm test:hexagon:watch` | Run hexagon tests in watch mode                 |
| `pnpm lint:fix`           | Run ESLint and auto-fix issues (use by default) |
| `pnpm format`             | Format code with Prettier                       |
| `pnpm typecheck`          | Run TypeScript type checking                    |
| `pnpm validate`           | Run lint, format, and typecheck together        |
| `pnpm build`              | Build for production                            |

📖 **For detailed explanations of all scripts, see [`SCRIPTS.md`](./SCRIPTS.md).**

---

## Development Workflow

### Before You Start Coding

1. **Read the Documentation**
   - [`CLAUDE.md`](../CLAUDE.md) - Quick reference for AI assistants (also useful for humans!)
   - [`src/hexagon/ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - Hexagonal architecture guide
   - [`ENGINEERING_DOCTRINE.md`](./ENGINEERING_DOCTRINE.md) - Core engineering principles
   - [`PR_STANDARDS.md`](./PR_STANDARDS.md) - Pull request guidelines
   - [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) - Testing requirements

2. **Understand the Architecture**
   - We use **hexagonal architecture** for new code
   - Legacy code exists outside `src/hexagon/` and is being migrated
   - Dependencies flow inward: Interface → Application → Domain
   - See [`src/hexagon/ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) for details

3. **Set Up Your Editor**
   - Install recommended VS Code extensions (see `.vscode/extensions.json` if present)
   - Enable ESLint and Prettier in your editor
   - Configure auto-format on save

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write Code Following Our Patterns**
   - Put new code in `src/hexagon/` following hexagonal architecture
   - Write tests alongside your code (colocated `.test.ts` files)
   - Use explicit return types for all hooks
   - Follow the import rules (no upward dependencies)

3. **Test Your Changes**
   ```bash
   # Run relevant tests
   pnpm test:hexagon:watch
   
   # Validate everything before committing
   pnpm validate
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: describe your changes"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use the PR checklist from [`PR_STANDARDS.md`](./PR_STANDARDS.md)
   - Write a clear description of what changed and why
   - Request reviews from team members

---

## Understanding the Hexagonal Architecture

### Layer Responsibilities

| Layer              | What It Does                           | Example Files                                |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| **Domain**         | Pure business logic, no dependencies   | `src/hexagon/domain/*.ts`                    |
| **Application**    | Orchestration, use cases, state        | `src/hexagon/application/useCases/*.ts`      |
| **Infrastructure** | External APIs, third-party services    | `src/hexagon/infrastructure/http/*.ts`       |
| **Interface**      | React components and pages             | `src/hexagon/interface/components/*.tsx`     |
| **Composition**    | App bootstrap, providers, context      | `src/hexagon/composition/providers/*.tsx`    |
| **Testing**        | Test utilities, factories, mocks       | `src/hexagon/testing/factories/*.ts`         |

### Key Rules

1. **Dependencies flow inward only**: Interface → Application → Domain
2. **One use case per page**: Pages call exactly one use case hook
3. **Explicit return types**: All hooks must have explicit return types (no inference)
4. **Colocated tests**: Test files live next to the code they test
5. **Mock external dependencies**: Create `.mock.ts` files for data-fetching hooks

---

## Common Tasks

### Adding a New Feature

1. **Plan your layers**:
   - Domain: Pure functions for business logic
   - Application: Use case + units for orchestration
   - Interface: Components + page for UI
   - Infrastructure: API adapters if needed

2. **Start from the inside out**:
   - Write domain logic first (pure functions)
   - Create application use case
   - Build interface components
   - Wire everything together in composition

3. **Test as you go**:
   - Unit tests for domain functions
   - Integration tests for use cases
   - Component tests for UI

See [`FEATURE_WORKFLOW.md`](./FEATURE_WORKFLOW.md) for detailed steps.

### Debugging Issues

1. **Check browser console** for errors
2. **Use React DevTools** to inspect component state
3. **Use TanStack Query DevTools** to inspect queries
4. **Check network tab** for API calls
5. **Add breakpoints** in your editor
6. **Review logs** from the backend if needed

See [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) for common issues.

### Migrating Legacy Code

If you need to refactor legacy code into the hexagonal architecture:

1. **Identify the boundaries**: What's domain logic vs UI vs API calls?
2. **Extract pure functions** to domain layer
3. **Create use cases** in application layer
4. **Move components** to interface layer
5. **Update tests** to match new structure

See [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) for detailed guidance.

---

## Testing

### Running Tests

```bash
# Watch mode for active development
pnpm test:hexagon:watch

# Run all hexagon tests once
pnpm test:hexagon

# Run specific test file
pnpm test:hexagon src/hexagon/application/useCases/useOfficialQuizzes/index.test.ts

# Run with coverage
pnpm test:hexagon -- --coverage
```

### Writing Tests

1. **Colocate tests** with code: `myFile.ts` → `myFile.test.ts`
2. **Create mocks** for dependencies: `myHook.ts` → `myHook.mock.ts`
3. **Use typed mocks**: Import `createTypedMock` from `@testing/utils`
4. **Test behavior, not implementation**
5. **Clean up after yourself**: Use `afterEach` to reset mocks

See [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) for full details.

---

## Getting Help

### Documentation Resources

- [`CLAUDE.md`](../CLAUDE.md) - Quick reference guide
- [`src/hexagon/ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - Architecture details
- [`ENGINEERING_DOCTRINE.md`](./ENGINEERING_DOCTRINE.md) - Engineering principles
- [`PR_STANDARDS.md`](./PR_STANDARDS.md) - PR guidelines
- [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) - Testing standards
- [`DOMAIN_GLOSSARY.md`](./DOMAIN_GLOSSARY.md) - Business terminology
- [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) - Code patterns and conventions

### Need Help?

1. **Check the documentation** (you're here!)
2. **Review similar code** in the codebase
3. **Ask the team** in Slack or during standup
4. **Consult the Git history** to understand why things were done a certain way

---

## Next Steps

Now that you're set up:

1. ✅ Explore the codebase structure
2. ✅ Run the development server and play with the app
3. ✅ Run the tests to ensure everything works
4. ✅ Pick a small task or bug to familiarize yourself
5. ✅ Review the architecture documentation
6. ✅ Ask questions early and often!

Welcome to the team! 🎉
