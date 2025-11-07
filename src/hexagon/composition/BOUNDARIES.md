# Composition Layer Boundaries

## What is This?

The composition layer handles **static application bootstrap** - wiring together providers, contexts, and the root render. This is where the application is assembled from all the pieces.

## Responsibility

Static application bootstrap and wiring:

- Combining React providers
- Configuring global contexts (Auth, Theme, Audio, etc.)
- **Defining provider-accessing hooks** (context access only, NO business logic)
- Setting up routing (if applicable)
- Instantiating root render
- Wiring dependencies together
- **NO business logic, NO conditionals, NO effects** - just static composition and context access

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
- Wire contexts together
- **Define provider-accessing hooks** (simple context access, no business logic)
- **Use EXPLICIT return types for ALL hooks** - Export interfaces, never use inferred types or `typeof`
- Export root component(s)
- Use simple, declarative JSX composition
- Keep it minimal and focused

### ❌ DON'T

- **NO business logic** (application layer/coordinators handle that)
- **NO business logic in provider-accessing hooks** (context access only)
- **NO conditional rendering** (keep it static)
- **NO useEffect or useMemo** (no dynamic behavior)
- **NO complex state management** (use application coordinators)
- **NO side effects** (just provider composition)
- **NO testable logic** (no tests needed - it's just wiring)
- **NO classes or OOP** (functional components only)
- **NO direct infrastructure imports** (go through application)

## Dependency Rules

**Composition depends on:**

- ✅ `interface/` - To compose pages and components
- ✅ React and routing libraries
- ❌ Should not be imported by other layers (except as entry point)
- ❌ Does not import from `domain/`, `infrastructure/`, or `application/` directly

**Composition is used by:**

- ✅ `application/coordinators/` - Coordinators use provider-accessing hooks from composition
- ✅ `interface/` - Components use providers via React context
- ✅ Root entry point - App bootstrap

## Provider-Accessing Hooks: Strict Definition

**Provider-accessing hooks** are defined in `composition/context/` and provide the **ONLY** way to access composition-layer context. They are **pure context accessors** with zero business logic.

### What Provider-Accessing Hooks CAN Do

```typescript
// ✅ ONLY allowed: Context access and error handling
export function useAudioContext(): AudioEngine {
  const context = use(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within AudioProvider');
  }
  return context; // Direct return - NO modifications, NO logic
}
```

**Allowed operations:**

- ✅ Access React context using `use()` or `useContext()`
- ✅ Check if context exists (null check)
- ✅ Throw error if context is missing (with helpful message)
- ✅ Return context value directly (no transformations)

### What Provider-Accessing Hooks CANNOT Do

```typescript
// ❌ NO business logic calculations
export function useAudioContext() {
  const context = use(AudioContext);
  // ❌ NO! Business logic belongs in application/coordinators
  const isPlaying = context.playingAudioRef.current?.paused === false;
  const duration = context.playingAudioRef.current?.duration ?? 0;
  return { ...context, isPlaying, duration }; // NO!
}

// ❌ NO transformations or enrichment
export function useAudioContext() {
  const context = use(AudioContext);
  // ❌ NO! Transformations belong in application/coordinators
  return {
    ...context,
    formattedDuration: formatDuration(context.duration), // NO!
  };
}

// ❌ NO conditional logic
export function useAudioContext() {
  const context = use(AudioContext);
  // ❌ NO! Conditionals belong in application/coordinators
  if (context.playingAudioRef.current) {
    return { ...context, hasAudio: true }; // NO!
  }
  return { ...context, hasAudio: false }; // NO!
}

// ❌ NO side effects
export function useAudioContext() {
  const context = use(AudioContext);
  // ❌ NO! Effects belong in application/coordinators
  useEffect(() => {
    trackAudioUsage(context); // NO!
  }, [context]);
  return context;
}
```

### Where Business Logic Goes

**Business logic using composition context belongs in `application/coordinators/`:**

```typescript
// ✅ CORRECT: Coordinator uses composition hook and adds business logic
// application/coordinators/hooks/useAudioCoordinator.ts
import { useAudioContext } from '@composition/context/AudioContext';

export function useAudioCoordinator() {
  const audioEngine = useAudioContext(); // Just context access

  // ✅ Business logic here in coordinator
  const isPlaying = useMemo(() => {
    return audioEngine.playingAudioRef.current?.paused === false;
  }, [audioEngine]);

  const currentTrack = useMemo(() => {
    return getCurrentTrack(audioEngine); // Business logic
  }, [audioEngine]);

  return {
    audioEngine,
    isPlaying, // Business logic result
    currentTrack, // Business logic result
  };
}
```

### Provider-Accessing Hook Template

Every provider-accessing hook should follow this exact pattern:

```typescript
// composition/context/SomeContext.tsx
import { createContext, use } from 'react';

export interface SomeContextType {
  // Define context shape
}

export const SomeContext = createContext<SomeContextType | null>(null);

// ✅ Provider-accessing hook - ONLY this pattern (EXPLICIT return type)
export function useSomeContext(): SomeContextType {
  const context = use(SomeContext);
  if (!context) {
    throw new Error('useSomeContext must be used within SomeProvider');
  }
  return context; // Direct return - NO other code
}
```

**Rule:** If your hook has more than 4 lines (context access + null check + error throw + return), it's doing too much.

## Static Composition Principle

The composition layer should be **purely static** - no conditionals, no effects, no logic. It's just wiring:

```typescript
// ✅ Good: Static composition
export function Providers({ children }: Props) {
  return (
    <ProviderA>
      <ProviderB>
        <ProviderC>
          {children}
        </ProviderC>
      </ProviderB>
    </ProviderA>
  );
}

// ❌ Bad: Dynamic composition
export function Providers({ children }: Props) {
  const isAuthenticated = useAuth().isAuthenticated;

  if (isAuthenticated) {
    return <AuthenticatedProviders>{children}</AuthenticatedProviders>;
  }
  return <PublicProviders>{children}</PublicProviders>;
}
```

If you need conditional logic, put it in the application layer coordinators and access it via context.

## Testing

- Composition layer typically doesn't need tests (it's just wiring)
- Integration tests may verify provider composition works
- If you find yourself writing complex tests, the logic probably belongs elsewhere

## Reading Order

1. `interface/pages/` - Understand what pages exist
2. `application/coordinators/` - Understand what providers are needed
3. `composition/providers/` - See how it's all wired together
4. Main entry point - See root composition

## Where to Add Code?

- New global provider → `providers/`
- New context definition → `context/` (if not in application layer)
- **New provider-accessing hook** → `context/` (same file as context definition)
- Root app composition → Main `Providers.tsx` or `App.tsx`
- Routing setup → Root component

### Provider-Accessing Hook Checklist

When creating a provider-accessing hook, ensure:

- ✅ Hook is in `composition/context/` (same file as context definition)
- ✅ Hook only accesses context (no business logic)
- ✅ Hook only checks for null context
- ✅ Hook only throws error if context missing
- ✅ Hook only returns context directly (no transformations)
- ✅ Hook is 4 lines or less (context access + null check + error + return)
- ❌ NO calculations, transformations, or business logic
- ❌ NO useMemo, useEffect, or other hooks
- ❌ NO conditional logic beyond null check
- ❌ NO side effects

## Relationship to Other Layers

```
Composition Layer:
─────────────────────────────────
Providers (defined here)
  ↓
Provider-Accessing Hooks (defined here, exported)
  ↓
Used by application/coordinators (coordinators import hooks)
  ↓
Used by interface (components use providers via context)
  ↓
Application Use-Cases (injected via hooks)
  ↓
Domain Logic (used by application)
```

**Flow:**

1. Composition defines providers and provider-accessing hooks
2. Coordinators import provider-accessing hooks from composition
3. Coordinators add business logic on top of context access
4. Interface components use providers via React context
5. Use-cases orchestrate everything

The composition layer is the **entry point** that assembles everything into a working application.
