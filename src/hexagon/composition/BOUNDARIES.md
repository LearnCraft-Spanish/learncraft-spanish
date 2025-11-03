# Composition Layer Boundaries

## What is This?

The composition layer handles **static application bootstrap** - wiring together providers, contexts, and the root render. This is where the application is assembled from all the pieces.

## Responsibility

Static application bootstrap and wiring:

- Combining React providers
- Configuring global contexts (Auth, Theme, Audio, etc.)
- Setting up routing (if applicable)
- Instantiating root render
- Wiring dependencies together
- **NO logic, NO conditionals, NO effects** - just static composition

## Structure

```
composition/
├── providers/  - React provider components
│   ├── Providers.tsx      - Main provider composition
│   ├── AudioProvider.tsx  - Audio context provider
│   └── ...
└── context/   - Context definitions (if needed)
```

## ⚠️ Critical Rules

### ✅ DO

- Compose providers statically
- Wire contexts together
- Export root component(s)
- Use simple, declarative JSX composition
- Keep it minimal and focused

### ❌ DON'T

- **NO business logic** (application layer)
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
- ✅ `application/coordinators/` - For provider context
- ✅ React and routing libraries
- ❌ Should not be imported by other layers (except as entry point)
- ❌ Does not import from `domain/` or `infrastructure/` directly

## Examples of What Belongs Here

```typescript
// ✅ Simple provider composition
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider>
        <AudioProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </AudioProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

// ✅ Root component wiring
export function App() {
  return (
    <Providers>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
        </Routes>
      </Router>
    </Providers>
  );
}

// ✅ Simple context provider (no logic)
export function AudioProvider({ children }: { children: ReactNode }) {
  const audioContext = useAudioContext(); // From application layer
  return (
    <AudioContext.Provider value={audioContext}>
      {children}
    </AudioContext.Provider>
  );
}
```

## Examples of What Does NOT Belong Here

```typescript
// ❌ Business logic
export function Providers({ children }: Props) {
  // ❌ NO! Business logic belongs in application
  const { user } = useAuth();
  const permissions = calculatePermissions(user);
  
  return <PermissionProvider value={permissions}>...</PermissionProvider>;
}

// ❌ Conditional logic
export function Providers({ children }: Props) {
  // ❌ NO! Keep it static
  if (process.env.NODE_ENV === 'development') {
    return <DevProvider>{children}</DevProvider>;
  }
  return <ProdProvider>{children}</ProdProvider>;
}

// ❌ Side effects
export function Providers({ children }: Props) {
  // ❌ NO! Effects belong in application coordinators
  useEffect(() => {
    initializeAnalytics();
  }, []);
  
  return <>{children}</>;
}

// ❌ Complex state
export function Providers({ children }: Props) {
  // ❌ NO! State belongs in application coordinators
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  
  return <ThemeProvider value={theme}>...</ThemeProvider>;
}
```

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
- Root app composition → Main `Providers.tsx` or `App.tsx`
- Routing setup → Root component

## Relationship to Other Layers

```
Composition Layer wires together:
─────────────────────────────────
Providers (from application/coordinators/)
  ↓
Interface Pages (from interface/pages/)
  ↓
Application Use-Cases (injected via hooks)
  ↓
Domain Logic (used by application)
```

The composition layer is the **entry point** that assembles everything into a working application.

