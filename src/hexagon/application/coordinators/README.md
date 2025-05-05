# Coordinators

This directory contains global shared state and lifecycle management logic used by multiple use-cases.

## Purpose

Coordinators handle application-wide concerns that:

- Manage shared state between use-cases
- Handle global lifecycle events
- Coordinate complex interactions
- Provide cross-cutting functionality

## Usage

```typescript
// Example coordinator
export function useAppCoordinator() {
  const [globalState, setGlobalState] = useState<GlobalState>(initialState);

  // Provide methods for use-cases to interact with global state
  return {
    globalState,
    updateGlobalState: (newState: Partial<GlobalState>) => {
      setGlobalState((prev) => ({ ...prev, ...newState }));
    },
  };
}
```

## Guidelines

- Keep coordinators focused on coordination only
- Never implement business logic
- Use TypeScript for type safety
- Document state shape and update patterns
- Include tests for all coordinator logic
- Keep state updates atomic and predictable
