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
