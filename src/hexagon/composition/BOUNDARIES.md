# Composition Layer Boundaries

## What is This?

The composition layer handles **static application bootstrap** - wiring together providers, contexts, and the root render. This is where the application is assembled from all the pieces.

## Responsibility

Static application bootstrap and wiring:

- Combining React providers
- Configuring global contexts (Auth, Theme, Audio, etc.)
- **Defining provider-accessing hooks** (context access only, NO business logic) - exported for `application/coordinators/` to use
- Instantiating root render
- **NO business logic, NO conditionals, NO effects** - just static composition and context access

See DECISIONS.md for why provider-accessing hooks exist and how they relate to coordinators.

## Structure

```
composition/
├── providers/  - React provider components
│   ├── Providers.tsx      - Main provider composition
│   ├── AudioProvider.tsx  - Audio context provider
│   └── ...
└── context/   - Context definitions and provider-accessing hooks
    ├── AudioContext.tsx   - Context + useAudioContext hook
    └── ...
```

## ⚠️ Critical Rules

### ✅ DO

- Compose providers statically
- Define provider-accessing hooks (simple context access, no business logic)
- Use explicit return types for all hooks
- Export root component(s)

### ❌ DON'T

- **NO business logic** (application layer/coordinators handle that)
- **NO business logic in provider-accessing hooks** (context access only)
- **NO conditional rendering** (keep it static)
- **NO useEffect or useMemo** (no dynamic behavior)
- **NO side effects** (just provider composition)

## Provider-Accessing Hook Rules

**Allowed:**

- ✅ Access React context using `use()` or `useContext()`
- ✅ Check if context exists (null check)
- ✅ Throw error if context is missing
- ✅ Return context value directly (no transformations)

**Forbidden:**

- ❌ NO calculations, transformations, or business logic
- ❌ NO useMemo, useEffect, or other hooks
- ❌ NO conditional logic beyond null check
- ❌ NO side effects

## Dependency Rules

**Composition depends on:**

- ✅ `interface/` - To compose pages and components
- ✅ React and routing libraries
- ❌ Does not import from `domain/`, `infrastructure/`, or `application/` directly

**Composition is used by:**

- ✅ `application/coordinators/` - Coordinators import provider-accessing hooks from composition (exception to dependency rule - see ARCHITECTURE.md)
- ✅ Root entry point - App bootstrap

