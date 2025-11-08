# Domain Layer Boundaries

## What is This?

The domain layer contains **pure, stateless business logic** with **zero dependencies on other hexagon layers**. This is the innermost layer of our hexagonal architecture - it knows nothing about React, infrastructure, or any other application layer. External npm packages (e.g. uuid, zod) are allowed.

**⚠️ Important:** This domain layer (`src/hexagon/domain/`) is **frontend SPA-specific**. It contains domain logic and transformations specific to the frontend application's needs.

## Domain Knowledge Organization

**Important:** Most of our encoded business meaning lives in `@learncraft-spanish/shared`:

- **`@learncraft-spanish/shared`** = Core domain types, Zod schemas, and business meaning
  - This is the organization's **shared sense of business concepts** (cross-platform)
  - Rich types with Zod validation schemas
  - Represents the canonical definition of business entities
  - Used across **frontend and backend** (shared codebase)

- **`src/hexagon/domain/`** = **Frontend SPA-specific** domain functions and logic
  - Pure business logic functions **for frontend concerns**
  - Data transformations using shared types (frontend-specific transformations)
  - Business rules that work with shared schemas (frontend UI/interaction rules)
  - Algorithm implementations (frontend-specific logic)
  - **This is NOT the shared domain** - it's frontend-specific domain logic

## Responsibility

Pure business logic and data transformations:

- Business rules expressed as pure functions
- Data transformation and enrichment (using types from `@learncraft-spanish/shared`)
- Domain-specific logic that operates on shared types
- Mathematical calculations
- Algorithm implementations
- No runtime state, no side effects

## ⚠️ Critical Rules

### ✅ DO

- Write pure functions only (same input = same output)
- Import and use types/schemas from `@learncraft-spanish/shared`
- Use external pure utility libraries (uuid, zod, etc.)

### ❌ DON'T

- **NO imports from other hexagon layers** (application, infrastructure, interface, composition, testing)
- **NO React** (no hooks, no components, no React types)
- **NO runtime state or side effects** (no `useState`, no API calls, no localStorage)
- **NO framework dependencies** (React, Express, etc.)
- **NO classes or OOP** (functions only, no `this`)

## Dependency Rules

**Domain depends on:**

- ✅ `@learncraft-spanish/shared` (core domain types and schemas)
- ✅ External pure utility libraries (date-fns, zod, etc.)
- ❌ No imports from other hexagon layers
- ✅ Can be imported by all other layers

**Note:**

- Core business entity types (Vocabulary, Lesson, Course, etc.) and their Zod schemas live in `@learncraft-spanish/shared` (cross-platform shared domain)
- `src/hexagon/domain/` contains **frontend SPA-specific** domain functions that operate on those shared types
- This is the frontend's domain layer, not the shared/organization-wide domain
