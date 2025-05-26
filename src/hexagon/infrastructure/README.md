# Infrastructure Layer

The infrastructure layer implements ports defined in the application layer. It contains the concrete implementations of interfaces that interact with external systems, services, and libraries.

## Key Principles

### 1. NO HARDCODED PATHS 🚫

**NEVER hardcode API paths in infrastructure implementations. This will lead to immediate firing.**

Always use endpoint definitions from the shared package. For example:

```typescript
// CORRECT ✅
const path = SharedEndpoints.getById.path.replace(':id', id);

// INCORRECT ❌ - DO NOT DO THIS!
const path = '/api/resource/:id'.replace(':id', id);
```

### 2. Dependency Inversion

The infrastructure layer depends on abstractions (ports) defined in the application layer, not the other way around. This ensures that the core business logic remains independent of external implementation details.

### 3. Adapters Pattern

Implementations in this layer should follow the adapters pattern, which transforms external interfaces into ones expected by the application.

## Structure

- `http/` - HTTP client implementations
- `vocabulary/` - Implementation of vocabulary-related ports

## Testing

All infrastructure implementations should be thoroughly tested, with mocks for external dependencies to ensure tests remain fast and reliable.
