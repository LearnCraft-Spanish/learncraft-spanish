# Domain Layer Boundaries

## What is This?

The domain layer contains **pure, stateless business logic** with **zero dependencies** (except `@learncraft-spanish/shared`). This is the innermost layer of our hexagonal architecture - it knows nothing about React, infrastructure, or any other layer.

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
- Implement business logic without side effects
- Use immutable data structures
- Document complex business rules clearly
- Write 100% test coverage (`*.test.ts` colocated)
- Define domain-specific types that extend or compose shared types (when needed)

### ❌ DON'T

- **NO imports from other hexagon layers** (application, infrastructure, interface, composition, testing)
- **NO React** (no hooks, no components, no React types)
- **NO runtime state** (no `useState`, no `useEffect`, no `useMemo`)
- **NO side effects** (no API calls, no localStorage, no mutations)
- **NO framework dependencies** (React, Express, etc.)
- **NO infrastructure** (no HTTP clients, no databases)
- **NO classes or OOP** (functions only, no `this`)
- **NO external dependencies** except:
  - `@learncraft-spanish/shared` (core domain types and schemas)
  - Pure utility libraries (e.g., date-fns, lodash for pure functions, zod)

## Dependency Rule

**Domain dependencies:**

- ✅ **MUST import from `@learncraft-spanish/shared`** - This is the source of truth for core domain types and schemas
- ✅ May import from external pure utility libraries (date-fns, zod, etc.)
- ❌ No imports from other hexagon layers (application, infrastructure, interface, composition, testing)
- ✅ May define domain-specific types/functions that other layers import FROM domain

**Note:**

- Core business entity types (Vocabulary, Lesson, Course, etc.) and their Zod schemas live in `@learncraft-spanish/shared` (cross-platform shared domain)
- `src/hexagon/domain/` contains **frontend SPA-specific** domain functions that operate on those shared types
- This is the frontend's domain layer, not the shared/organization-wide domain

## Testing Requirements

- **100% test coverage** required
- Tests must be colocated (`*.test.ts` next to source files)
- Tests should be pure unit tests (no mocks needed, no setup required)
- Test all edge cases and business rule variations

## Reading Order

When exploring the codebase, start here:

1. `@learncraft-spanish/shared` - Understand core business types and schemas (the organization's shared meaning)
2. `src/hexagon/domain/` - Understand domain functions that operate on shared types
3. Then move outward to `application/` which uses domain functions and shared types

## Where to Add Code?

### Core Domain Types & Schemas

- **New core business entity types** → `@learncraft-spanish/shared`
- **New Zod schemas for business entities** → `@learncraft-spanish/shared`
- **New shared business meaning** → `@learncraft-spanish/shared`

### Domain Functions & Logic

- **New business rules** → Pure functions in `src/hexagon/domain/`
- **New data transformations** → New transformation files in `src/hexagon/domain/`
- **New domain-specific types** that extend/compose shared types → `src/hexagon/domain/`
- **New enrichment logic** → Enrichment function files in `src/hexagon/domain/`

**Key Distinction:**

- If it's a core business concept used across the organization (frontend + backend) → `@learncraft-spanish/shared`
- If it's **frontend SPA-specific** domain logic/functions that operate on shared types → `src/hexagon/domain/`

**This domain layer is for frontend SPA concerns only.** The shared domain (`@learncraft-spanish/shared`) is the cross-platform source of truth for business meaning.
