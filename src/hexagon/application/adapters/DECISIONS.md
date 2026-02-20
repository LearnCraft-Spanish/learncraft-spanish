# Decisions: Adapters

## Why Adapters Exist as a Separate Layer

**Context**: Hexagonal architecture requires dependency injection — the application layer defines ports (interfaces), and concrete implementations are injected at runtime. Classical DI uses constructors or containers. React has no idiomatic equivalent. Something needs to perform dependency injection in a way that is semantic to React.

**Decision**: Adapters are React hooks that perform dependency injection. They resolve concrete infrastructure implementations and return them as port-conforming interfaces. This is how the application layer receives its dependencies without knowing about infrastructure directly.

**Consequences**: Adapters are the DI mechanism for a React codebase. They add a layer of indirection, but most are one-liners. Infrastructure stays free of React dependencies (testable outside React, portable). This is a documented exception to the dependency direction rule (adapters importing from infrastructure).

## Why Infrastructure Is Not a React Hook

**Context**: Since application-layer code is hook-based, infrastructure could also be implemented as hooks. This would eliminate the need for the adapter layer entirely.

**Decision**: Infrastructure implementations are plain functions or factory functions — no React hooks, no `useState`, no `useEffect`. Adapters wrap them as hooks when needed.

**Consequences**: Infrastructure is independently testable without `renderHook`. It can be reused in non-React contexts (CLIs, server-side, shared libraries). The adapter layer exists specifically to be the React/non-React boundary. This enforces Doctrine principle 4b (portability).

## How the Adapter Pattern Works

**Context**: Adapters need a consistent, minimal pattern that developers can follow.

**Decision**: An adapter gets dependencies, calls an infrastructure factory, and returns the result. The infrastructure is the real adapter (adapting external services). The adapter in `application/adapters/` exists for the boundaries:

```typescript
export function useVocabularyAdapter(): VocabularyPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createVocabularyInfrastructure(apiUrl, auth);
}
```

The adapter: (1) gets dependencies (config, auth), (2) calls infrastructure factory with those dependencies, (3) returns the implementation which matches the port.

**Consequences**: Adapters are trivially thin. Most are one-liners. If an adapter has branching logic or transformations, something is wrong — that logic belongs in application or domain.
