# Decisions: Infrastructure Layer

## How Infrastructure Relates to Ports and Adapters

**Context**: In classical hexagonal architecture, infrastructure directly implements ports. In this codebase, three pieces work together: ports (interfaces), infrastructure (implementations), and adapters (boundary enforcers).

**Decision**: The relationship is:

```
Application Layer defines:          Infrastructure Layer implements:
─────────────────────────           ───────────────────────────────
ports/VocabularyPort.ts    →       vocabularyInfrastructure.ts
  (interface)                         (thin wrapper around HTTP)
```

The application layer's `adapters/` directory wraps infrastructure implementations into React hooks that match the ports. See `application/adapters/DECISIONS.md` for why that indirection exists.

**Consequences**: Infrastructure stays pure (no React). Adapters handle the React/non-React boundary. Ports define the contract that both sides agree on.

## Infrastructure May Import Domain

**Context**: `domain/BOUNDARIES.md` says domain can be imported by all other layers. An earlier version of this layer's BOUNDARIES.md forbade `domain/` imports, which contradicted both that rule and inward dependency flow. The ESLint `boundaries/element-types` rule already allowed `infrastructure → domain`.

**Decision**: Infrastructure may import domain types, schemas, and pure functions when mapping or validating external data (for example hashing a storage key or parsing a persisted record). Business orchestration still does not belong here.

**Consequences**: Thin IO wrappers can use domain contracts at the persistence boundary without copying hashing or validation into adapters. Adapters stay as React/port seams.
