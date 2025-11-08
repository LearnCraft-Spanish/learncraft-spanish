# Ports Boundaries

## What is This?

Ports define **interfaces for external dependencies** that infrastructure must implement. They enable dependency inversion and make the application layer independent of concrete infrastructure implementations.

## Responsibility

Type definitions for external dependencies:

- Define interfaces that infrastructure must implement
- Specify required behavior without implementation
- Enable dependency inversion
- Allow for easy mocking in tests
- Document expected contracts

## ⚠️ Critical Rules

### ✅ DO

- Define pure TypeScript interfaces/types
- Keep ports focused and minimal
- Use domain types from `@learncraft-spanish/shared` and `hexagon/domain` in port definitions
- Match infrastructure capabilities realistically

### ❌ DON'T

- **NO implementation details** (pure types only)
- **NO default implementations** (that's adapters/infrastructure)
- **NO business logic** (pure interface definitions)
- **NO React hooks or components** (just types)
- **NO classes** (TypeScript interfaces/types only)
- **NO imports from infrastructure** (would break dependency rule)
- **NO imports from other hexagon layers** (except shared types)

## Dependency Rules

**Ports can depend on:**

- ✅ `@learncraft-spanish/shared` - Use shared domain types in port definitions
- ✅ `hexagon/domain` — Ensure outside dependencies are adapted to our fronted types for fronetnd-specific concerns
- ❌ Cannot import from `infrastructure/` (that's what we're abstracting)
- ❌ Cannot import from other `application/` subdirectories
- ❌ Cannot be imported by `domain/`
- ✅ Can be imported by `application/adapters/`, `application/useCases/`, etc.
