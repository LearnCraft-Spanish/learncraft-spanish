# Coordinators Boundaries

## What is This?

Coordinators manage **global shared state and cross-cutting concerns** that are used by multiple use-cases across the application. They provide a single source of truth for application-wide state and lifecycle management.

## Responsibility

Shared state and cross-cutting coordination:

- Manage application-wide shared state
- Coordinate between multiple use-cases
- Handle global lifecycle events
- Provide cross-cutting functionality
- Maintain consistent state across features
- Provide React context for state sharing

## Structure

```
coordinators/
├── hooks/       - Coordinator hooks (useActiveStudent, etc.)
├── providers/   - React context providers
└── contexts/    - Context type definitions
```

## ⚠️ Critical Rules

### ✅ DO

- Manage truly shared state (used across multiple features)
- Provide React context for state sharing
- Keep state updates atomic and predictable
- **Use EXPLICIT return types for ALL hooks** - Export interfaces, never use inferred types or `typeof`
- Write 100% test coverage (`*.test.ts`, `*.stub.ts`)
- Use TypeScript for type safety
- Document state shape and update patterns

### ❌ DON'T

- **NO business logic** (coordination only, logic belongs in use-cases/units)
- **NO feature-specific state** (that belongs in use-cases)
- **NO local component state** (that belongs in interface)
- **NO orchestration** (that's use-cases' job)
- **NO rendering logic** (no JSX, no components in hooks)
- **NO classes or OOP** (functions/hooks only)
- **NO direct infrastructure imports** (use adapters)

## Dependency Rules

**Coordinators can depend on:**

- ✅ `application/adapters/` - Infrastructure wrappers
- ✅ `application/queries/` - Data fetching (for shared data)
- ✅ `domain/` - Pure business logic
- ✅ React context APIs
- ❌ Cannot import from `application/useCases/` (avoid circular dependencies)
- ❌ Cannot import from `application/units/` directly (use sparingly)
- ❌ Cannot be imported by `domain/`
- ❌ Should not be imported by `interface/` directly (go through use-cases)

## Examples of What Belongs Here

```typescript
// ✅ Shared application state (used across features)
export function useActiveStudent(): UseActiveStudentReturnType {
  const context = use(ActiveStudentContext);
  const { getAppUserByEmail } = useAppUserAdapter();

  // Shared state management
  return {
    appUser: context.studentSelectionState.appUser,
    changeActiveStudent: async (email: string) => {
      // ... shared state update logic
    },
  };
}

// ✅ Cross-cutting concerns
export function useSelectedCourseAndLessons(): UseSelectedCourseAndLessonsReturnType {
  const context = use(SelectedCourseAndLessonsContext);

  // Shared across multiple use-cases (quiz creation, vocabulary, etc.)
  return {
    course: context.course,
    fromLesson: context.fromLesson,
    toLesson: context.toLesson,
    setCourse: context.setCourse,
    // ... shared coordination
  };
}

// ✅ Global filter state (used by multiple features)
export function useExampleFilterCoordinator() {
  const context = use(ExampleFilterContext);

  // Shared filter state used across quiz and example features
  return {
    filterState: context.filterState,
    updateFilterState: context.updateFilterState,
    // ... coordination methods
  };
}
```

## Examples of What Does NOT Belong Here

```typescript
// ❌ Feature-specific state (belongs in useCases/)
export function useVerbCreationState() {
  // This is specific to verb creation feature - belongs in use-case
  const [formData, setFormData] = useState(null);
  return { formData, setFormData };
}

// ❌ Business logic (belongs in useCases/ or units/)
export function useSelectedLesson() {
  const [lesson, setLesson] = useState(null);

  // ❌ NO! Validation logic belongs in use-case or unit
  const validateLesson = (lesson) => {
    if (!lesson.title) throw new Error('Title required');
  };
}

// ❌ Orchestration (belongs in useCases/)
export function useQuizCreation() {
  // Orchestrating quiz creation - belongs in use-case
  const vocab = useVocabulary();
  const examples = useExamples();
  // ...
}

// ❌ Local component state (belongs in interface/)
export function useModalState() {
  // If only used in one component, belongs in interface layer
  const [isOpen, setIsOpen] = useState(false);
  return { isOpen, setIsOpen };
}

// ❌ Rendering logic
export function CoordinatorProvider({ children }) {
  return <div>{children}</div>; // NO! Just context provider
}
```

## Provider Pattern

Coordinators use React context providers:

```typescript
// Context definition
export const ActiveStudentContext = createContext<ActiveStudentContextType | null>(null);

// Provider component
export function ActiveStudentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  return (
    <ActiveStudentContext.Provider value={{ state, setState }}>
      {children}
    </ActiveStudentContext.Provider>
  );
}

// Hook to use coordinator
export function useActiveStudent() {
  const context = use(ActiveStudentContext);
  if (!context) {
    throw new Error('useActiveStudent must be used within ActiveStudentProvider');
  }
  return context;
}
```

## Testing Requirements

- **100% test coverage** required
- Test state management and updates
- Test context provider behavior
- Colocated test files: `*.test.ts`, `*.stub.ts`
- Use typed mocks (`createTypedMock<T>()`, not `vi.fn()`)

## Reading Order

1. `coordinators/hooks/` - See coordinator hooks
2. `coordinators/contexts/` - See context definitions
3. `coordinators/providers/` - See provider components
4. `useCases/` - See how coordinators are used

## Where to Add Code?

- New shared state across features → New coordinator hook + provider
- New cross-cutting concern → New coordinator
- New global lifecycle management → New coordinator
- New application-wide filter/selection → New coordinator

## Key Distinctions

**Coordinators vs Use Cases:**

- Coordinators = Shared state, cross-cutting
- Use cases = Feature workflows, orchestration

**Coordinators vs Units:**

- Coordinators = Shared, application-wide
- Units = Local, reusable building blocks

**Coordinators vs Interface State:**

- Coordinators = Shared across features
- Interface state = Component-specific UI state

## When to Use Coordinators

Use coordinators when:

- ✅ State is needed by multiple use-cases
- ✅ State represents global application state
- ✅ State needs to persist across route changes
- ✅ State coordinates between features

Don't use coordinators for:

- ❌ Feature-specific state (use use-case)
- ❌ Component-specific UI state (use interface)
- ❌ Local transformations (use unit)
