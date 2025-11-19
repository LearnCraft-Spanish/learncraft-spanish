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
- Import types and schemas from domain
- Keep utilities focused on test infrastructure

### ❌ DON'T

- **NO imports by production code** (testing layer is test-only)
- **NO test logic in production code** (keep tests separate)

## Dependency Rules

**Testing layer dependencies:**

- ✅ **Import types and schemas from domain**
  - This section is for global test setup and utilities
  - Leave implementation-specific test setup to the colocated files
- ✅ **Can be imported to ALL layers** (domain, application, infrastructure, interface, composition)
  - Needed to set up colocated mocks and tests
- ✅ **Can be imported by colocated test and mock files** (`someItem.test.ts`, `someItem.mock.tsx`, etc)
- ❌ **Cannot be imported by production code** (`someItem.ts`)

## Testing Requirements

For detailed testing practices, patterns, and examples, see `documentation/TESTING_STANDARDS.md` as well as the readme found here.
