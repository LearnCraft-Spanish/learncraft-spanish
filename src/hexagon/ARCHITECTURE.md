# 🧱 Hexagonal React Architecture

A strict, test-first frontend architecture for building modular, maintainable React applications with clear boundaries between domain, behavior, infrastructure, and UI.

---

## ✅ Summary of Key Practices

- `domain/` defines pure business logic — no IO, no React, no runtime state
- `application/` contains all runtime behavior — use-cases, coordinators, units, and port definitions
- `infrastructure/` implements ports with minimal, non-branching logic — never behavior
- `interface/` renders UI and adapts ambient state into use-case injection
- `composition/` bootstraps the app statically — no conditionals or effects

> ✅ All behavior flows through use-cases. All logic is tested. Everything else is structure.

---

## 🧾 Directory Breakdown

### `domain/`

Pure, stateless logic and type definitions. No runtime state, React, or infrastructure.

- Entities, types, enums, schema validators
- Business logic expressed as pure functions
- No imports from any other layer

### `application/`

Runtime behavior and orchestration — no rendering, no external dependencies invoked directly.

- `use-cases/`: Named logic flows, often exposed as hooks, invoked by interface components
- `units/`: Reusable logic blocks used by use-cases. May be reactive but never orchestrate
- `coordinators/`: Global shared state or lifecycle management invoked by multiple use-cases
- `ports/`: Type definitions for the expected shape of external dependencies
- `adapters/`: Wrappers over infrastructure to match application-defined ports (no logic)

### `infrastructure/`

Implements ports for IO and third-party effects. Never contains testable logic.

- Auth clients, HTTP clients, query implementations
- Must match application-defined ports
- Export adapter hooks directly, possibly thinly wrapped

### `interface/`

All rendering logic and route-specific UI. Receives injected hooks from application.

- `components/`: Stateless UI units, receive props only
- `pages/`: Composed from components, with use-case injection for route-level logic
- `routes/`: Declarative mapping of routes to pages, with param injection if needed

Interface-level state and interactions (e.g. modals, popups, theme toggles) may be implemented as inline hooks within `pages/` or `components/`, unless reused across pages. If needed, create a dedicated folder like `interactions/`, but only for **strictly visual concerns** — no domain or business logic allowed.

> ⚠️ UI-specific hooks must never mutate or replicate application or domain logic. Use sparingly to avoid use-case port bloat.

### `composition/`

Static application bootstrap.

- Combines providers and global wrappers
- Configures routing
- Instantiates root render
- Must not contain logic or side effects

---

## 🧭 Layer Roles Cheat Sheet

| Layer             | Responsibility                                  |
| ----------------- | ----------------------------------------------- |
| `domain/`         | Stateless business logic and definitions        |
| `application/`    | Runtime logic, use-cases, and state composition |
| `infrastructure/` | External IO, API bindings, 3rd-party effects    |
| `interface/`      | Rendering + UI behavior                         |
| `composition/`    | Static bootstrapping + root render              |

---

## 📊 Test Coverage Standards

| Layer                       | Coverage | Colocated Files          |
| --------------------------- | -------- | ------------------------ |
| `domain/`                   | ✅ 100%  | `*.test.ts`              |
| `application/use-cases/`    | ✅ 100%  | `*.test.ts`, `*.stub.ts` |
| `application/units/`        | ✅ 100%  | `*.test.ts`              |
| `application/coordinators/` | ✅ 100%  | `*.test.ts`, `*.stub.ts` |
| `application/adapters/`     | ❌ N/A   | `*.mock.ts`              |
| `application/ports/`        | ❌ N/A   | Types only               |
| `interface/components/`     | ✅ 100%  | `*.test.tsx`             |
| `interface/pages/`          | ✅ 100%  | `*.test.tsx`             |
| `interface/routes/`         | ✅ 100%  | `*.test.tsx` (if needed) |
| `infrastructure/`           | ❌ N/A   | No logic = no tests      |
| `composition/`              | ❌ N/A   | No logic = no tests      |

---

## 🧩 File Naming Standards

| File Type      | Usage                                       |
| -------------- | ------------------------------------------- |
| `*.test.ts[x]` | Unit tests (colocated, 100% mutation)       |
| `*.mock.ts`    | Mock adapter or IO layer behavior           |
| `*.stub.ts`    | Stubbed return values for hook/unit testing |

> ✅ Every testable hook should have a stub or mock. Keep them colocated for discoverability.

---

## 🔒 Import Rules and Dependency Boundaries

Port adapters (e.g. `useAuth`) are mocked using factory-based configuration. Mocks must remain cleanly separated and must not pollute the application layer.

---

## 🔒 Import & Export Rules

To ensure proper hexagonal separation, the following **import rules** must be enforced:

| Into                        | Allowed Imports                                              |
| --------------------------- | ------------------------------------------------------------ |
| `domain/`                   | Nothing                                                      |
| `application/use-cases/`    | `domain/`, `application/units/`, `application/coordinators/` |
| `application/coordinators/` | `domain/`, `application/adapters/`                           |
| `application/units/`        | `domain/` only                                               |
| `interface/`                | `application/use-cases/` only (via props)                    |
| `composition/`              | `interface/` only                                            |
| `infrastructure/`           | External deps only                                           |
| `application/adapters/`     | `infrastructure/`, `application/ports/`                      |

### Export Rules

| Layer                       | Allowed Exports                             |
| --------------------------- | ------------------------------------------- |
| `domain/`                   | Entities, types, enums, schema validators   |
| `application/use-cases/`    | Use-case hooks (typed)                      |
| `application/units/`        | Helper logic/hooks used by use-cases        |
| `application/coordinators/` | Global shared state hooks                   |
| `application/adapters/`     | Hooks conforming to application ports       |
| `application/ports/`        | Port type definitions                       |
| `interface/`                | React components only                       |
| `infrastructure/`           | Bound IO implementations, nothing app-aware |
| `composition/`              | Root component(s) only                      |

> ✅ No layer may import upward. Only `composition/` may reference everything to wire the app together.

---

## 🛠️ Mock Injection and Test Composition

Mocks are handled via **factory-based helpers**, defined and composed globally for maximum flexibility with minimal boilerplate.

### Mock Strategy:

- Port adapters are globally mocked using `vi.mock(...)`
- A **default happy-path return** is defined for each mock
- Tests can override behavior using `setupMockX({...})`
- All mocks are colocated with their adapters for traceability

### Example

```ts
// setupTests.ts
vi.mock('src/hooks/useAuth');

// test file
setupMockAuth({ isAuthenticated: false });
```

### Benefits

- ✅ Zero-boilerplate test setup
- ✅ Fully isolated test behavior
- ✅ Configurable per-test without global mutation
- ✅ Works seamlessly with MSW, TanStack Query, and Auth0

> Always compose mocks for global use, but override locally when needed. Do not leak adapter details into test logic.
