# Infrastructure Layer Boundaries

## What is This?

The infrastructure layer implements **external IO and third-party integrations**. It contains concrete implementations of ports defined in the application layer. This layer handles all side effects and external communication.

## Responsibility

External IO, API bindings, and third-party effects:

- HTTP client implementations
- API endpoint calls
- Authentication clients
- Database queries
- LocalStorage/SessionStorage access
- Third-party library integrations
- Side effects and external state

## ⚠️ Critical Rules

### ✅ DO

- Implement ports defined in `application/ports/`
- Use shared endpoint definitions (NEVER hardcode paths)
- Export hooks that match application port interfaces
- Keep implementations minimal and non-branching
- Handle errors appropriately
- Use proper HTTP client abstractions

### ❌ DON'T

- **NO hardcoded API paths** (use shared endpoint definitions)
- **NO business logic** (just data fetching/transformation)
- **NO complex orchestration** (that's application layer)
- **NO React components or rendering**
- **NO domain logic** (pure IO only)
- **NO testable logic** (if you need tests, logic belongs in application)
- **NO classes or OOP** (functions/hooks only)
- **NO framework types in domain/application** (but React is OK here for hooks)
- **NO mixing of external concerns** (one infrastructure file = one external system)

## Dependency Rules

**Infrastructure depends on:**

- ✅ External dependencies (HTTP clients, auth libraries, etc.)
- ✅ Application ports (to implement them)
- ✅ Shared endpoint definitions
- ❌ Cannot import from `domain/` or `application/` (except ports)
- ❌ Cannot be imported by `domain/`
- ❌ Can be imported by `application/adapters/` (wrapped)

## Examples of What Belongs Here

```typescript
// ✅ HTTP implementation matching a port
export function useVocabularyInfrastructure() {
  const queryClient = useQueryClient();

  const getVocabulary = async (): Promise<Vocabulary[]> => {
    const path = SharedEndpoints.vocabulary.list.path;
    const response = await httpClient.get(path);
    return response.data;
  };

  const createVocabulary = async (data: Vocabulary): Promise<Vocabulary> => {
    const path = SharedEndpoints.vocabulary.create.path;
    const response = await httpClient.post(path, data);
    return response.data;
  };

  return { getVocabulary, createVocabulary };
}

// ✅ Auth client implementation
export function useAuthInfrastructure() {
  return {
    login: async (credentials: Credentials) => {
      const path = SharedEndpoints.auth.login.path;
      return await httpClient.post(path, credentials);
    },
    logout: async () => {
      const path = SharedEndpoints.auth.logout.path;
      return await httpClient.post(path);
    },
  };
}

// ✅ LocalStorage implementation
export function useCookieInfrastructure() {
  return {
    get: (key: string) => document.cookie.split('; ').find(...),
    set: (key: string, value: string) => {
      document.cookie = `${key}=${value}`;
    },
  };
}
```

## Examples of What Does NOT Belong Here

```typescript
// ❌ Hardcoded paths (NEVER DO THIS!)
export function useVocabularyInfrastructure() {
  return {
    getVocabulary: async () => {
      // ❌ NO! Use SharedEndpoints instead
      return await httpClient.get('/api/vocabulary');
    }
  };
}

// ❌ Business logic
export function useVocabularyInfrastructure() {
  return {
    getVocabulary: async () => {
      const data = await httpClient.get(path);
      // ❌ NO! Filtering is business logic - belongs in application
      return data.filter(v => v.active && v.frequency > 10);
    }
  };
}

// ❌ Complex orchestration
export function useQuizInfrastructure() {
  return {
    // ❌ NO! Orchestration belongs in application/useCases
    createQuiz: async (config) => {
      const vocab = await getVocabulary();
      const examples = await getExamples();
      const filtered = filterByLevel(vocab, examples);
      return combine(filtered);
    }
  };
}

// ❌ Mixing external concerns (one file = one external system)
export function useVocabularyInfrastructure() {
  // ❌ NO! Mixing HTTP API calls with localStorage
  return {
    getVocabulary: async () => {
      return await httpClient.get(path);
    },
    // ❌ NO! This belongs in a separate cookie/storage infrastructure file
    getCachedVocabulary: () => {
      return localStorage.getItem('vocab');
    },
  };
}

// ❌ Mixing auth with API calls
export function useVocabularyInfrastructure() {
  // ❌ NO! Auth belongs in separate authInfrastructure file
  const token = authClient.getToken();
  return {
    getVocabulary: async () => {
      return await httpClient.get(path, { headers: { Authorization: token } });
    },
  };
}

// ❌ React components
export function VocabularyList() {
  return <div>...</div>;
}
```

## ⚠️ CRITICAL Rules

### 1. No Hardcoded Paths

**NEVER hardcode API paths in infrastructure. This will lead to immediate firing.**

Always use endpoint definitions from the shared package:

```typescript
// ✅ CORRECT
const path = SharedEndpoints.vocabulary.getById.path.replace(':id', id);

// ❌ INCORRECT - DO NOT DO THIS!
const path = '/api/vocabulary/:id'.replace(':id', id);
```

### 2. No Mixing External Concerns

**Each infrastructure file must handle ONLY ONE external concern.**

- ✅ One file = one external system (HTTP API, localStorage, cookies, auth, etc.)
- ❌ Do NOT mix HTTP calls with localStorage in the same file
- ❌ Do NOT mix auth with API calls in the same file
- ❌ Do NOT mix different external services in the same file

```typescript
// ✅ CORRECT: Separate files for separate concerns
// vocabularyInfrastructure.ts - HTTP API only
export function useVocabularyInfrastructure() {
  return {
    getVocabulary: async () => httpClient.get(path),
    createVocabulary: async (data) => httpClient.post(path, data),
  };
}

// cookieInfrastructure.ts - Cookies only
export function useCookieInfrastructure() {
  return {
    get: (key) => document.cookie.split('; ').find(...),
    set: (key, value) => { document.cookie = `${key}=${value}`; },
  };
}

// ❌ INCORRECT: Mixing concerns
export function useVocabularyInfrastructure() {
  return {
    // HTTP API
    getVocabulary: async () => httpClient.get(path),
    // ❌ NO! Cookies belong in separate file
    getCookie: (key) => document.cookie.split('; ').find(...),
  };
}
```

**Why this matters:**

- Clear separation of concerns
- Easier to test and mock
- Easier to swap implementations
- Prevents accidental coupling
- Makes dependencies explicit

## Testing

- Infrastructure implementations typically don't need unit tests (they're just IO)
- Integration tests may be appropriate for complex infrastructure
- Mocks are defined in `application/adapters/*.mock.ts`
- If you find yourself writing complex tests for infrastructure, the logic probably belongs in `application/` instead

## Reading Order

1. `application/ports/` - Understand what needs to be implemented
2. `infrastructure/` - See concrete implementations
3. `application/adapters/` - See how infrastructure is wrapped

## Where to Add Code?

- New API client → New infrastructure file matching port
- New auth implementation → `auth/` directory
- New HTTP utilities → `http/` directory
- New storage implementations → Storage files
- New third-party integrations → New infrastructure files

## Relationship to Application Layer

```
Application Layer defines:          Infrastructure Layer implements:
─────────────────────────           ───────────────────────────────
ports/VocabularyPort.ts    →       vocabularyInfrastructure.ts
  (interface)                         (concrete HTTP calls)
```

The application layer's `adapters/` directory wraps infrastructure implementations to match the ports, providing a clean separation.
