# Infrastructure Layer Boundaries

## What is This?

The infrastructure layer implements **external IO and third-party integrations**. In hexagonal architecture, infrastructure is **the thinnest possible wrapper around an outside service** (with no business logic) to make it fit our clean, abstracted, application-defined ports.

## Responsibility

Thin wrappers around external services:

- HTTP client implementations
- API endpoint calls
- Authentication clients
- LocalStorage/SessionStorage access
- Third-party library integrations

## ⚠️ Critical Rules

### ✅ DO

- Implement ports defined in `application/ports/`
- Use shared endpoint definitions (NEVER hardcode paths)
- Keep implementations minimal - just enough to match the port interface

### ❌ DON'T

- **NO business logic** (if you need logic, it belongs in application layer)
- **NO hardcoded API paths** (use shared endpoint definitions)
- **NO React components or rendering**
- **NO classes or OOP** (functions/hooks only)

## Dependency Rules

**Infrastructure depends on:**

- ✅ External dependencies (HTTP clients, auth libraries, etc.)
- ✅ Application ports (to implement them)
- ✅ Shared endpoint definitions
- ❌ Cannot import from `domain/` or `application/` (except ports)
- ❌ Cannot be imported by `domain/`
- ✅ Can be imported by `application/adapters/` (wrapped)

