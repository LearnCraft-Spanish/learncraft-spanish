# LearnCraft Spanish

A modern web application for learning Spanish, built with React, TypeScript, and hexagonal architecture.

---

## 🎯 Overview

**LearnCraft Spanish** helps English speakers become fluent in Spanish through interactive vocabulary practice, customizable quizzes, spaced repetition flashcards, and comprehensive course progression tracking.

### Key Features

- 📚 **Vocabulary Management** - Browse and learn Spanish vocabulary with audio pronunciations
- 🎯 **Interactive Quizzes** - Text-based and audio quizzes with multiple difficulty modes
- 🃏 **Flashcard System** - Spaced repetition algorithm for effective memorization
- 📊 **Progress Tracking** - Monitor learning progress through courses and lessons
- 👥 **Multi-Role Support** - Student, Coach, and Admin roles with tailored features
- 🔊 **Audio Integration** - Native speaker pronunciations for all vocabulary

---

## 🏗️ Architecture

This project uses **hexagonal architecture** (ports and adapters pattern) to maintain clean separation of concerns and testability.

### Layer Structure

```
src/hexagon/
├── domain/           # Pure business logic (no dependencies)
├── application/      # Use cases, queries, orchestration
├── infrastructure/   # External APIs, third-party services
├── interface/        # React components and pages
├── composition/      # App bootstrap and providers
└── testing/          # Test utilities, factories, mocks
```

**Key Principle**: Dependencies flow inward only (Interface → Application → Domain).

📖 **Learn More**: See [`src/hexagon/ARCHITECTURE.md`](./src/hexagon/ARCHITECTURE.md) for complete architecture documentation.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 16 (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** >= 7 (install with `npm install -g pnpm`)
- **Git**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd learncraft-spanish

# Install dependencies
pnpm install:local

# Set up environment variables
cp .env.development .env
# Edit .env with your Auth0 and API credentials

# Start development server
pnpm start
```

The app will be available at `http://localhost:5173`.

📖 **Need Help?** See [`documentation/ONBOARDING.md`](./documentation/ONBOARDING.md) for detailed setup instructions.

---

## 💻 Development

### Essential Commands

| Command                   | Description                          |
| ------------------------- | ------------------------------------ |
| `pnpm start`              | Start development server             |
| `pnpm test:hexagon`       | Run hexagonal architecture tests     |
| `pnpm test:hexagon:watch` | Run tests in watch mode              |
| `pnpm lint:fix`           | Lint and auto-fix code               |
| `pnpm format`             | Format code with Prettier            |
| `pnpm typecheck`          | Run TypeScript type checking         |
| `pnpm validate`           | Run lint + format + typecheck        |
| `pnpm build`              | Build for production                 |

📖 **See [`documentation/SCRIPTS.md`](./documentation/SCRIPTS.md) for complete reference of all scripts.**

### Testing

We use **Vitest** with separate configurations for legacy and hexagonal code:

```bash
# Run hexagon tests (modern architecture)
pnpm test:hexagon

# Run specific test file
pnpm test:hexagon src/hexagon/application/useCases/useOfficialQuizzes/index.test.ts

# Watch mode for active development
pnpm test:hexagon:watch

# Run with coverage
pnpm test:hexagon -- --coverage
```

📖 **Learn More**: See [`documentation/TESTING_STANDARDS.md`](./documentation/TESTING_STANDARDS.md) for testing guidelines.

---

## 📚 Documentation

### For Developers

| Document                                                          | Purpose                                  |
| ----------------------------------------------------------------- | ---------------------------------------- |
| [`ONBOARDING.md`](./documentation/ONBOARDING.md)                  | Getting started guide                    |
| [`ARCHITECTURE.md`](./src/hexagon/ARCHITECTURE.md)                | Hexagonal architecture details           |
| [`FEATURE_WORKFLOW.md`](./documentation/FEATURE_WORKFLOW.md)      | Step-by-step guide to building features  |
| [`COMMON_PATTERNS.md`](./documentation/COMMON_PATTERNS.md)        | Code patterns and conventions            |
| [`DATA_FLOW.md`](./documentation/DATA_FLOW.md)                    | State management and data flow           |
| [`DOMAIN_GLOSSARY.md`](./documentation/DOMAIN_GLOSSARY.md)        | Business terminology reference           |
| [`TESTING_STANDARDS.md`](./documentation/TESTING_STANDARDS.md)    | Testing requirements and best practices  |
| [`TROUBLESHOOTING.md`](./documentation/TROUBLESHOOTING.md)        | Common issues and solutions              |
| [`MIGRATION_GUIDE.md`](./documentation/MIGRATION_GUIDE.md)        | Migrating legacy code to hexagon         |

### For Contributors

| Document                                                          | Purpose                                  |
| ----------------------------------------------------------------- | ---------------------------------------- |
| [`PR_STANDARDS.md`](./documentation/PR_STANDARDS.md)              | Pull request guidelines and checklist    |
| [`PR_REVIEW_GUIDE.md`](./documentation/PR_REVIEW_GUIDE.md)        | Detailed step-by-step review instructions |
| [`ENGINEERING_DOCTRINE.md`](./documentation/ENGINEERING_DOCTRINE.md) | Core engineering principles           |
| [`INTERNAL_PROD_CHECKLIST.md`](./documentation/INTERNAL_PROD_CHECKLIST.md) | Production release process       |

### For AI Assistants

| Document                                | Purpose                                  |
| --------------------------------------- | ---------------------------------------- |
| [`CLAUDE.md`](./CLAUDE.md)              | Quick reference for AI-assisted coding   |

---

## 🏛️ Tech Stack

### Core Technologies

- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TanStack Query (React Query)** - Server state management
- **React Router** - Client-side routing
- **Auth0** - Authentication and authorization

### Testing & Quality

- **Vitest** - Unit and integration testing
- **Testing Library** - React component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Stryker** - Mutation testing (CI only)

### Infrastructure

- **Netlify** - Hosting and deployment
- **Sentry** - Error tracking and monitoring
- **pnpm** - Fast, efficient package manager

---

## 🌳 Project Structure

```
learncraft-spanish/
├── src/
│   ├── hexagon/              # Modern hexagonal architecture
│   │   ├── domain/           # Pure business logic
│   │   ├── application/      # Use cases, queries, coordinators
│   │   ├── infrastructure/   # HTTP clients, API adapters
│   │   ├── interface/        # React components and pages
│   │   ├── composition/      # App bootstrap and providers
│   │   └── testing/          # Test utilities and factories
│   ├── components/           # Legacy components (being migrated)
│   ├── hooks/                # Legacy hooks (being migrated)
│   └── routes/               # Legacy routing
├── documentation/            # Comprehensive project documentation
├── tests/                    # Test setup and configuration
├── mocks/                    # Shared mock data
└── public/                   # Static assets
```

---

## 🔄 Migration Status

This codebase is **actively migrating** from a legacy structure to hexagonal architecture.

- ✅ **New features**: Built exclusively in `src/hexagon/`
- 🔄 **Active migration**: Legacy code being incrementally refactored
- ❌ **Legacy code**: Exists in `src/components/`, `src/hooks/`, etc.

When working with legacy code, consider migrating it to the hexagonal structure. See [`documentation/MIGRATION_GUIDE.md`](./documentation/MIGRATION_GUIDE.md).

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Read the documentation** - Especially [`ONBOARDING.md`](./documentation/ONBOARDING.md) and [`ARCHITECTURE.md`](./src/hexagon/ARCHITECTURE.md)
2. **Create a feature branch** - `git checkout -b feature/your-feature-name`
3. **Follow our standards** - See [`PR_STANDARDS.md`](./documentation/PR_STANDARDS.md)
4. **Write tests** - All new code must have tests
5. **Submit a PR** - Include the PR checklist in your description

### Code Quality Requirements

- ✅ All tests passing
- ✅ No linting errors (`pnpm lint`)
- ✅ No TypeScript errors (`pnpm typecheck`)
- ✅ Code formatted (`pnpm format`)
- ✅ Follows hexagonal architecture patterns
- ✅ Has explicit return types for all hooks
- ✅ Includes tests and mocks

---

## 📋 Standards & Best Practices

### Architecture Principles

1. **Explicit dependency direction** - Dependencies flow inward only
2. **Explicit boundaries** - Each layer has defined responsibilities
3. **Testability** - All modules are independently testable
4. **Maintainability** - Code is clear, documented, and DRY

### Code Conventions

- **Naming**: camelCase for variables/functions, PascalCase for types/components
- **File naming**: `myComponent.tsx`, `myHook.ts`, `myHook.test.ts`, `myHook.mock.ts`
- **Return types**: Always explicit for hooks (no inference, no `typeof`)
- **Imports**: Use path aliases (`@domain/`, `@application/`, etc.)
- **Testing**: Colocated tests with 100% coverage for domain and application layers

📖 **Learn More**: See [`documentation/COMMON_PATTERNS.md`](./documentation/COMMON_PATTERNS.md).

---

## 🐛 Troubleshooting

### Common Issues

**Problem: `pnpm: command not found`**
```bash
npm install -g pnpm
```

**Problem: Port already in use**
```bash
lsof -ti:5173 | xargs kill -9  # macOS/Linux
```

**Problem: Module not found after install**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install:local
```

📖 **More Help**: See [`documentation/TROUBLESHOOTING.md`](./documentation/TROUBLESHOOTING.md) for comprehensive troubleshooting.

---

## 📈 Metrics & CI/CD

### Continuous Integration

- **GitHub Actions** - Automated testing and builds
- **PR Reviews** - Claude AI for automated code review
- **Mutation Testing** - Stryker for test quality (CI only)

### Deployment

- **Development** → Auto-deploy from `development` branch
- **Staging** → Auto-deploy from `staging` branch  
- **Production** → Manual deploy from `main` branch

---

## 📞 Getting Help

### Resources

1. **Documentation** - Check the `documentation/` folder first
2. **Code Examples** - Look at existing hexagon code for patterns
3. **Team** - Ask questions in Slack or during standup
4. **Git History** - Review commit messages for context

### Reporting Issues

When reporting bugs or asking for help:

1. **Describe what you're trying to do**
2. **Show what's happening** (include error messages)
3. **List what you've tried**
4. **Provide code snippets** (if relevant)
5. **Include steps to reproduce**

---

## 📄 License

ISC

---

## 🙏 Acknowledgments

Built with ❤️ by the LearnCraft Spanish team.

Special thanks to all contributors who help improve language learning for our students!

---

**Ready to contribute?** Start with [`documentation/ONBOARDING.md`](./documentation/ONBOARDING.md) and [`documentation/FEATURE_WORKFLOW.md`](./documentation/FEATURE_WORKFLOW.md)!
