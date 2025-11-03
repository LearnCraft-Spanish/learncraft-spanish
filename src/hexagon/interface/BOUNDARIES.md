# Interface Layer Boundaries

## What is This?

The interface layer contains **all React UI components and rendering logic**. This is the outermost user-facing layer that renders the application state and handles user interactions.

## Responsibility

React UI components and rendering:

- React components (presentational and container)
- Pages that compose components
- Route definitions and navigation
- UI-specific hooks (modals, popups, theme - strictly visual)
- Event handlers that call application layer hooks
- Styling (SCSS files)
- Accessibility concerns
- User interaction handling

## Structure

```
interface/
├── components/  - Reusable UI components
├── pages/       - Route-level page components
├── hooks/       - UI-specific hooks (visual only, no business logic)
└── styles/      - Shared stylesheets
```

## ⚠️ Critical Rules

### ✅ DO

- Use React components for rendering
- Inject application use-case hooks via props or direct import
- Handle UI events and call application hooks
- Compose smaller components into pages
- Implement UI-specific state (modals, popups, theme) sparingly
- Keep components focused and single-responsibility
- Write 100% test coverage for components and pages
- Use composition layer providers via React context

### ❌ DON'T

- **NO business logic** (use application hooks instead)
- **NO direct infrastructure imports** (go through application layer)
- **NO domain logic** (use application layer)
- **NO API calls** (use application use-cases)
- **NO complex orchestration** (application layer handles that)
- **NO classes or OOP** (functional components only)
- **NO direct state management libraries** (use application coordinators)
- **NO duplicate business logic** (if you need it, add to application layer)

## Dependency Rules

**Interface depends ONLY on application use-cases:**

- ✅ Can import from `application/useCases/` (hooks)
- ✅ Can use React and React Router
- ✅ Can use composition layer providers via context
- ❌ Cannot import from `application/units/` or `application/coordinators/` directly (use use-cases)
- ❌ Cannot import from `domain/` or `infrastructure/`
- ❌ Cannot be imported by `domain/` or `application/`

## Examples of What Belongs Here

```typescript
// ✅ Presentational component
export function VocabularyCard({ vocabulary, onSelect }: Props) {
  return (
    <div onClick={() => onSelect(vocabulary.id)}>
      <h3>{vocabulary.word}</h3>
      <p>{vocabulary.translation}</p>
    </div>
  );
}

// ✅ Page component using use-case hook
export default function VocabularyPage() {
  const { vocabulary, loading, error } = useCustomVocabulary();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {vocabulary.map(v => (
        <VocabularyCard key={v.id} vocabulary={v} />
      ))}
    </div>
  );
}

// ✅ UI-specific hook (strictly visual)
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

// ✅ Event handler calling application hook
export function QuizButton() {
  const { startQuiz } = useCustomAudioQuiz();
  
  return (
    <button onClick={() => startQuiz()}>
      Start Quiz
    </button>
  );
}
```

## Examples of What Does NOT Belong Here

```typescript
// ❌ Business logic
export function VocabularyCard({ vocabulary }: Props) {
  // ❌ NO! Filtering is business logic
  const activeVocab = vocabulary.filter(v => v.active);
  
  // ❌ NO! This calculation belongs in application/domain
  const difficulty = calculateDifficulty(vocabulary);
  
  return <div>...</div>;
}

// ❌ Direct infrastructure import
import { useVocabularyInfrastructure } from '@infrastructure/vocabulary';
export function VocabularyPage() {
  // ❌ NO! Use application use-case instead
  const { vocabulary } = useVocabularyInfrastructure();
}

// ❌ Complex orchestration
export function QuizPage() {
  // ❌ NO! Orchestration belongs in application/useCases
  const vocab = useVocabulary();
  const examples = useExamples();
  const filtered = useMemo(() => {
    return combineAndFilter(vocab, examples);
  }, [vocab, examples]);
}

// ❌ API calls
export function VocabularyPage() {
  useEffect(() => {
    // ❌ NO! Use application use-case hook
    fetch('/api/vocabulary').then(...);
  }, []);
}
```

## UI-Specific Hooks

Interface-level hooks are allowed for **strictly visual concerns**:

- Modals and popups
- Theme toggles
- UI animations
- Focus management
- Tooltip positioning

**These hooks must NEVER:**
- Duplicate application/domain logic
- Mutate business state
- Call infrastructure directly
- Perform business calculations

If you find yourself needing business logic in an interface hook, it belongs in `application/` instead.

## Testing Requirements

- **100% test coverage** for components and pages
- Colocated test files: `*.test.tsx`
- Test with mocked application hooks
- Test user interactions and rendering
- Use `defaultResult` from hook mocks for simple tests
- Use `override` functions for dynamic behavior tests

## Reading Order

1. `application/useCases/` - Understand available hooks
2. `interface/components/` - See reusable UI components
3. `interface/pages/` - See complete pages
4. `composition/` - See how it's all wired together

## Where to Add Code?

- New reusable UI component → `components/`
- New page/route → `pages/`
- New UI-specific hook (visual only) → `hooks/` or inline in component
- New styles → `styles/` or component-level SCSS files
- New accessibility helpers → Component utilities

## Relationship to Application Layer

```
Interface Layer:              Application Layer:
─────────────────             ──────────────────
<VocabularyPage>    →         useCustomVocabulary()
  (renders UI)                  (business logic)
```

Interface components call application use-case hooks to get data and trigger actions. All business logic stays in the application layer.

