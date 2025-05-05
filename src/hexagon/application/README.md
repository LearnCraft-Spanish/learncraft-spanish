# Application Layer

This layer contains the application-specific business logic and orchestrates the flow of data between the domain and infrastructure layers.

## Structure

The application layer is organized into three main categories:

### 1. Use-Case Hooks

Located in `useCases/`, these hooks implement specific business use cases by composing unit hooks and coordinators. They:

- Represent complete user interactions or business processes
- Compose multiple unit hooks and coordinators
- Handle the orchestration of complex workflows
- Are typically tied to specific UI components or features

Example:

```typescript
export function useLessonCreation() {
  const { saveLesson } = useLessonStorage();
  const { validateLesson } = useLessonValidation();

  return {
    createLesson: async (lesson: Lesson) => {
      const validationResult = await validateLesson(lesson);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }
      return saveLesson(lesson);
    },
  };
}
```

### 2. Unit Hooks

Located in `units/`, these are independent, composable hooks that:

- Handle specific, focused functionality
- Are reusable across different use cases
- Don't maintain shared state
- Can be composed into more complex use cases

Example:

```typescript
export function useTableData<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      // Sorting logic
    });
  }, [data, sortConfig]);

  return { sortedData, setSortConfig };
}
```

### 3. Coordinators

Located in `coordinators/`, these manage shared state and coordination between multiple use cases:

- Handle cross-cutting concerns
- Maintain application-wide state
- Coordinate between multiple use cases
- Provide a single source of truth for shared data

Example:

```typescript
export function useLessonCoordinator() {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonHistory, setLessonHistory] = useState<Lesson[]>([]);

  return {
    currentLesson,
    setCurrentLesson,
    lessonHistory,
    addToHistory: (lesson: Lesson) => {
      setLessonHistory((prev) => [...prev, lesson]);
    },
  };
}
```

## Guidelines

1. **Separation of Concerns**

   - Use-case hooks should focus on business processes
   - Unit hooks should handle specific functionality
   - Coordinators should manage shared state

2. **Composition**

   - Use-case hooks should compose unit hooks and coordinators
   - Unit hooks should be independent and reusable
   - Coordinators should be used sparingly and only for truly shared state

3. **Testing**

   - Unit hooks should be thoroughly tested in isolation
   - Use-case hooks should be tested with mocked unit hooks
   - Coordinators should be tested for state management

4. **Dependencies**

   - Use-case hooks can depend on unit hooks and coordinators
   - Unit hooks should not depend on use-case hooks or coordinators
   - Coordinators should not depend on use-case hooks

5. **State Management**
   - Local state should be managed in unit hooks
   - Shared state should be managed in coordinators
   - Use-case hooks should coordinate state updates

## Best Practices

- Keep hooks focused and single-responsibility
- Use TypeScript for type safety
- Document complex business logic
- Include tests for all hooks
- Follow the dependency rule (dependencies point inward)
- Use dependency injection for infrastructure dependencies
