# Decisions: Ports

## Why Ports Exist as a Separate Concept

**Context**: The application layer needs to call external services (APIs, auth, storage), but importing infrastructure directly would create an outward dependency that violates the architecture.

**Decision**: Ports are pure TypeScript interfaces defined in the application layer that describe what the application needs from the outside world. Infrastructure implements these interfaces. Adapters bridge the two. The application never knows about concrete implementations.

**Consequences**: Dependency inversion — the application layer defines the contract, infrastructure conforms to it. This enables easy mocking in tests (mock the port, not the HTTP client), makes infrastructure swappable without changing application code, and keeps the application layer testable in isolation. The cost is one more level of abstraction (port + adapter + infrastructure instead of just calling the API).
