# Testing Layer Boundaries

## What is This?

The testing layer contains **test utilities and setup** for testing across all layers of the hexagonal architecture. This layer provides the infrastructure for writing tests.

**⚠️ Important:** This layer is **test-only** code. It should never be imported by production code.

## Responsibility

Test utilities and infrastructure:

- Factory functions for creating test data
- Mock utility functions
- Test setup and configuration
- Test providers and wrappers

## ⚠️ Critical Rules

### ✅ DO

- Export utilities for reuse
- Import from any layer to understand what to mock
- Keep utilities focused on test infrastructure

### ❌ DON'T

- **NO imports by production code** (testing layer is test-only)
- **NO test logic in production code** (keep tests separate)
- **NO mocks in testing layer** (mocks are colocated with implementations)

## Dependency Rules

**Testing layer dependencies:**

- ✅ **Can import from ALL layers** (domain, application, infrastructure, interface, composition)
  - Needed to understand types and interfaces for creating utilities
  - Needed to create factories for domain/application types
- ✅ **Can import from external testing libraries** (Vitest, React Testing Library, etc.)
- ✅ **Can import from shared schemas** (`@learncraft-spanish/shared`) for factory creation
- ❌ **Cannot be imported by production code** (domain, application, infrastructure, interface, composition)
  - Testing layer is **test-only**
  - Production code must never depend on test utilities

**Boundary enforcement:**

```
Production Layers (domain, application, infrastructure, interface, composition)
  ❌ Cannot import from testing/

Testing Layer
  ✅ Can import from all production layers
  ✅ Can import from testing libraries
```

## Testing Requirements

For detailed testing practices, patterns, and examples, see `documentation/TESTING_STANDARDS.md` as well as the readme found here.
