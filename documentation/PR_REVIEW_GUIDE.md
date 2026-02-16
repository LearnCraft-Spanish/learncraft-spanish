# 🔍 Detailed PR Review Guide

_In-depth steps for conducting thorough pull request reviews_

This guide expands on the PR checklist in [`PR_STANDARDS.md`](./PR_STANDARDS.md) with detailed sub-steps for each review area.

---

## Table of Contents

1. [Initial Assessment](#1-initial-assessment)
2. [Testing Review](#2-testing-review)
3. [Code Quality Review](#3-code-quality-review)
4. [Architecture Review](#4-architecture-review)
5. [Documentation Review](#5-documentation-review)
6. [Security Review](#6-security-review)
7. [Performance Review](#7-performance-review)
8. [Final Checks](#8-final-checks)

---

## 1. Initial Assessment

### 1.1 Review PR Description

**What to look for:**

- [ ] **Clear title**: Descriptive and follows convention (e.g., "feat:", "fix:", "refactor:")
- [ ] **What changed**: Specific description of what was modified
- [ ] **Why it changed**: Business context and reasoning
- [ ] **How to test**: Clear steps to verify the changes
- [ ] **Breaking changes**: Any backwards-incompatible changes are called out
- [ ] **Screenshots/videos**: For UI changes, visual evidence of before/after

**Sub-steps:**

1. Read the title - Does it accurately summarize the change?
2. Read the description - Do you understand what changed and why?
3. Check for linked issues/tickets - Is there traceability?
4. Review any attached media - Do screenshots match the description?

**Red flags:**

- ❌ Vague title like "Updates" or "Fixes"
- ❌ Empty or minimal description
- ❌ No explanation of breaking changes
- ❌ UI changes without screenshots

---

### 1.2 Assess PR Size

**What to look for:**

- [ ] **PR is focused**: Addresses a single concern/feature
- [ ] **Size is reasonable**: Preferably < 500 lines changed
- [ ] **If large**: Has explanation and logical structure
- [ ] **No scope creep**: Doesn't include unrelated changes

**Sub-steps:**

1. Check the "Files changed" count and total line changes
2. Scan the file list - Are all changes related?
3. If large (>500 lines), check for:
   - Clear organization (can be reviewed in logical chunks)
   - Justification in PR description
   - Consider requesting to split into smaller PRs

**Red flags:**

- ❌ >1000 lines without clear justification
- ❌ Mixes multiple unrelated features
- ❌ Includes reformatting/refactoring mixed with feature work
- ❌ Contains debugging code, commented-out code, or console.logs

---

### 1.3 Check CI Status

**What to look for:**

- [ ] **All checks passing**: Green checkmarks on all CI jobs
- [ ] **Build succeeds**: No compilation errors
- [ ] **Tests pass**: All test suites complete successfully
- [ ] **Linting passes**: No ESLint errors
- [ ] **Type checking passes**: No TypeScript errors

**Sub-steps:**

1. View the "Checks" tab in GitHub
2. Verify each check has passed
3. If any are failing, determine if it's:
   - Related to the PR changes (author needs to fix)
   - Flaky test (may need to re-run)
   - Unrelated infrastructure issue

**Red flags:**

- ❌ Any failing checks
- ❌ Checks skipped or disabled
- ❌ Warnings being ignored

---

## 2. Testing Review

### 2.1 Verify Test Coverage

**What to look for:**

- [ ] **New code has tests**: All new functions/components have corresponding tests
- [ ] **Test files colocated**: `*.test.ts` or `*.test.tsx` next to source files
- [ ] **Appropriate test types**: Unit tests for logic, integration tests for workflows
- [ ] **Coverage maintained or improved**: No decrease in overall coverage

**Sub-steps:**

1. For each new file, check if there's a matching `.test.ts` file
2. Open test files and verify they test the new functionality
3. Check coverage report (if available) for the changed files
4. Verify critical paths are tested

**Red flags:**

- ❌ New files without tests
- ❌ Tests only for happy path, no error cases
- ❌ Mocking everything instead of testing logic
- ❌ Tests that don't actually assert meaningful behavior

**Examples of good tests:**

```typescript
// ✅ GOOD: Tests behavior, not implementation
it('should return error when tag name is empty', () => {
  expect(validateTagName('')).toBe('Tag name cannot be empty');
});

// ✅ GOOD: Tests edge case
it('should handle vocabulary without any tags', () => {
  const vocab = { id: '1', tags: [] };
  expect(filterByTag(vocab, 'Transportation')).toBe(false);
});

// ✅ GOOD: Integration test for use case
it('should create tag and invalidate queries', async () => {
  const { result } = renderHook(() => useTagManager());
  await act(() => result.current.createTag({ name: 'Test' }));
  expect(queryClient.invalidateQueries).toHaveBeenCalledWith(['tags']);
});
```

---

### 2.2 Review Test Quality

**What to look for:**

- [ ] **Tests are clear**: Easy to understand what's being tested
- [ ] **Tests are deterministic**: Same input always produces same output
- [ ] **No flaky tests**: Tests don't randomly fail
- [ ] **Appropriate assertions**: Tests verify correct behavior, not implementation details
- [ ] **Mocks are typed**: Using `createTypedMock` or similar patterns
- [ ] **Mocks are cleaned up**: Using `afterEach` or `beforeEach` to reset

**Sub-steps:**

1. Read each test case - Is it clear what's being tested?
2. Check assertions - Do they verify meaningful behavior?
3. Look for timing issues - Any `setTimeout` or hardcoded waits?
4. Verify mocks are properly reset between tests
5. Check for any skipped tests (`.skip`) without explanation

**Red flags:**

- ❌ Test names like "test 1", "test 2" (not descriptive)
- ❌ Tests that pass regardless of implementation
- ❌ Hardcoded timeouts or delays
- ❌ Tests that depend on external services
- ❌ Tests that depend on test execution order
- ❌ Untyped mocks using `vi.fn()` without types

**Examples of test smells:**

```typescript
// ❌ BAD: Not testing behavior
it('works', () => {
  expect(true).toBe(true);
});

// ❌ BAD: Testing implementation detail
it('should call useState', () => {
  const spy = vi.spyOn(React, 'useState');
  renderHook(() => useMyHook());
  expect(spy).toHaveBeenCalled();
});

// ❌ BAD: Flaky timing
it('should load data', async () => {
  renderHook(() => useData());
  await new Promise(resolve => setTimeout(resolve, 1000)); // Flaky!
  expect(data).toBeDefined();
});
```

---

### 2.3 Verify Mock Files

**What to look for:**

- [ ] **Data-returning hooks have mocks**: Every query/hook that returns data has a `.mock.ts`
- [ ] **Mocks use standard pattern**: Uses `createOverrideableMock`
- [ ] **Default implementation provided**: Mock has sensible default values
- [ ] **Mocks are exported properly**: Can be imported and used in tests

**Sub-steps:**

1. Identify all data-returning hooks in the PR
2. Check each one has a corresponding `.mock.ts` file
3. Open mock files and verify structure:
   ```typescript
   export const myHookMock = createOverrideableMock<typeof myHook>({
     defaultImplementation: () => ({
       // default return value
     }),
   });
   ```
4. Verify the mock is used in related tests

**Red flags:**

- ❌ Missing mock files for new data-fetching hooks
- ❌ Mocks that don't follow the standard pattern
- ❌ Incomplete mock implementations
- ❌ Mocks with hardcoded data that doesn't match real structure

---

## 3. Code Quality Review

### 3.1 Verify Naming Conventions

**What to look for:**

- [ ] **Files**: camelCase for files, PascalCase for components
- [ ] **Functions**: camelCase, descriptive names
- [ ] **Components**: PascalCase, descriptive names
- [ ] **Hooks**: Start with `use`, camelCase
- [ ] **Constants**: SCREAMING_SNAKE_CASE
- [ ] **Types/Interfaces**: PascalCase
- [ ] **Variables**: camelCase, descriptive

**Sub-steps:**

1. Scan filenames - Do they follow conventions?
2. Check function names - Are they descriptive and clear?
3. Review variable names - Do they communicate intent?
4. Verify hook names start with `use`
5. Check for abbreviations - Are they standard/clear?

**Red flags:**

- ❌ Vague names like `data`, `temp`, `handle`, `do`, `process`
- ❌ Single letter variables (except loop counters)
- ❌ Inconsistent naming patterns
- ❌ Hungarian notation (prefixes like `strName`, `arrItems`)

**Examples:**

```typescript
// ❌ BAD
const d = useData();
function handle() { }
const arr = [];

// ✅ GOOD
const vocabularyList = useVocabularyData();
function createFlashcard() { }
const activeStudents = [];
```

---

### 3.2 Check TypeScript Usage

**What to look for:**

- [ ] **No `any` types**: All values properly typed
- [ ] **Explicit return types**: All hooks/functions have explicit return types
- [ ] **No type assertions**: Avoid `as` casting unless absolutely necessary
- [ ] **Proper null handling**: Use optional chaining and nullish coalescing
- [ ] **No `@ts-ignore`**: Never bypass TypeScript errors

**Sub-steps:**

1. Search for `any` in the diff - Each instance should be justified or removed
2. Check all hook signatures - Do they have explicit return types?
3. Look for `as` type assertions - Are they necessary?
4. Check for `@ts-ignore` or `@ts-expect-error` - Are they explained?
5. Verify proper handling of optional values

**Red flags:**

- ❌ `any` types without justification
- ❌ Functions without return types (relying on inference)
- ❌ Type assertions to avoid fixing the real issue
- ❌ `@ts-ignore` to bypass errors
- ❌ Optional properties accessed without null checks

**Examples:**

```typescript
// ❌ BAD: Implicit return type
export function useMyHook() {
  return { data: [] };
}

// ✅ GOOD: Explicit return type
export interface MyHookResult {
  data: Data[];
}

export function useMyHook(): MyHookResult {
  return { data: [] };
}

// ❌ BAD: Using any
function process(item: any) {
  return item.value;
}

// ✅ GOOD: Proper typing
interface Item {
  value: string;
}

function process(item: Item): string {
  return item.value;
}
```

---

### 3.3 Review Code Complexity

**What to look for:**

- [ ] **Functions are focused**: Each function does one thing
- [ ] **Reasonable length**: Functions < 50 lines (guideline, not rule)
- [ ] **Low nesting**: Maximum 3 levels of nesting
- [ ] **No duplicate code**: DRY principle followed
- [ ] **Clear logic flow**: Easy to follow what's happening

**Sub-steps:**

1. Look for long functions (>50 lines) - Should they be split?
2. Check nesting depth - Is there complex nested logic?
3. Look for repeated patterns - Can they be extracted?
4. Review conditional logic - Is it clear and simple?
5. Check for complex boolean expressions - Can they be simplified?

**Red flags:**

- ❌ Functions doing multiple unrelated things
- ❌ Deeply nested conditionals (>3 levels)
- ❌ Repeated code blocks
- ❌ Complex boolean logic without explanation
- ❌ Giant switch statements

**Examples:**

```typescript
// ❌ BAD: Doing too much
function processUserData(user: User) {
  // validate user
  // fetch related data
  // transform data
  // update database
  // send notification
  // return result
}

// ✅ GOOD: Focused functions
function validateUser(user: User): ValidationResult { }
function fetchUserData(userId: string): Promise<UserData> { }
function transformData(data: UserData): TransformedData { }
```

---

### 3.4 Check Error Handling

**What to look for:**

- [ ] **Errors are caught**: Try-catch blocks where appropriate
- [ ] **User-friendly messages**: Error messages help users understand what happened
- [ ] **Errors are logged**: Proper error logging for debugging
- [ ] **Graceful degradation**: UI doesn't break on errors
- [ ] **Loading and error states**: UI shows appropriate states

**Sub-steps:**

1. Check async operations - Are errors caught?
2. Review error messages - Are they helpful?
3. Verify error logging - Using console.error or error tracking?
4. Check UI error states - Are they handled in components?
5. Look for silent failures - Are errors being swallowed?

**Red flags:**

- ❌ Unhandled promise rejections
- ❌ Empty catch blocks
- ❌ Generic error messages ("Error occurred")
- ❌ No error states in UI
- ❌ Errors that crash the app

---

## 4. Architecture Review

### 4.1 Check Layer Boundaries

**CRITICAL**: **BOUNDARIES.md files are authoritative, NOT the linter.**

**What to look for:**

- [ ] **Code in correct layer**: Logic is in the appropriate architectural layer
- [ ] **Dependencies flow inward**: No upward dependencies
- [ ] **No circular dependencies**: Modules don't depend on each other
- [ ] **Boundaries respected**: Each layer follows its BOUNDARIES.md rules

**Sub-steps:**

1. **Read the relevant BOUNDARIES.md files** for each layer being modified:
   - `src/hexagon/domain/BOUNDARIES.md`
   - `src/hexagon/application/BOUNDARIES.md`
   - `src/hexagon/infrastructure/BOUNDARIES.md`
   - `src/hexagon/interface/BOUNDARIES.md`
   - Subdirectory BOUNDARIES.md files

2. **For each changed file**, verify:
   - Is this code in the right layer for its responsibility?
   - Does it follow the DO's and DON'Ts in the BOUNDARIES.md?
   - Are imports coming from allowed layers only?

3. **Check semantic boundaries** (linter can't catch these):
   - Is business logic in domain/application, not UI?
   - Are external calls only in infrastructure?
   - Are components only rendering, not orchestrating?
   - Is composition layer only wiring, not containing logic?

4. **Verify the intent**, not just the mechanics:
   - Even if imports are technically allowed, do they violate the spirit of the boundaries?
   - Are there hidden dependencies through context or global state?

**Red flags:**

- ❌ Business logic in components
- ❌ API calls directly in use cases (should be through adapters)
- ❌ React hooks in domain layer
- ❌ Components in application layer
- ❌ Logic in infrastructure adapters
- ❌ Coordinators importing from interface layer (except context hooks)

**Why linter isn't enough:**

The linter checks patterns like:
- ✅ "Don't import from parent directories"
- ✅ "Don't import infrastructure from domain"

But it CAN'T check:
- ❌ "This function contains business logic and belongs in domain"
- ❌ "This component is doing orchestration, should be a use case"
- ❌ "This adapter has branching logic, violating single responsibility"
- ❌ "This exception to the dependency rule is not justified"

**Examples:**

```typescript
// ❌ BAD: Business logic in component (linter won't catch)
function FlashcardCard({ flashcard }) {
  const score = flashcard.attempts === 1 ? 100 : 
                flashcard.attempts === 2 ? 50 : 0;
  // This scoring logic belongs in domain layer!
}

// ✅ GOOD: Domain function called by component
function FlashcardCard({ flashcard }) {
  const score = calculateFlashcardScore(flashcard);
}

// ❌ BAD: Infrastructure has logic (linter won't catch)
export function useVocabularyInfrastructure() {
  return {
    getAll: async () => {
      const data = await httpClient.get('/vocabulary');
      // Complex filtering and transformation logic here
      // This logic belongs in application or domain!
      return processedData;
    }
  };
}

// ✅ GOOD: Infrastructure is thin wrapper
export function useVocabularyInfrastructure() {
  return {
    getAll: () => httpClient.get('/vocabulary'),
  };
}
```

---

### 4.2 Verify Use Case Pattern

**What to look for:**

- [ ] **One use case per page**: Pages call exactly one use case hook
- [ ] **Use cases return interfaces**: Explicit return type exported
- [ ] **Use cases orchestrate**: They coordinate units, queries, coordinators
- [ ] **No business logic in use cases**: Logic is in domain functions
- [ ] **Clear responsibility**: Use case has focused purpose

**Sub-steps:**

1. Find page components - Do they call exactly one use case?
2. Find use case hooks - Do they have explicit return interfaces?
3. Check use case implementation:
   - Does it compose multiple units/queries?
   - Is orchestration logic clear?
   - Is business logic delegated to domain?
4. Verify use case tests exist and are comprehensive

**Red flags:**

- ❌ Page components calling multiple use cases
- ❌ Use cases without explicit return types
- ❌ Business logic embedded in use case
- ❌ Use cases doing too much (>100 lines)
- ❌ Direct API calls in use cases

---

### 4.3 Check Data Flow

**What to look for:**

- [ ] **Queries for fetching**: Using TanStack Query for all data fetching
- [ ] **Mutations for changes**: Using mutations for create/update/delete
- [ ] **Proper invalidation**: Queries invalidated after mutations
- [ ] **Context for global state**: Using context for app-wide state
- [ ] **Local state appropriate**: useState only for component-specific state

**Sub-steps:**

1. Check data fetching - Is it using TanStack Query?
2. Check data mutations - Are they using useMutation?
3. Verify cache invalidation - Are queries invalidated after changes?
4. Review state management - Is state at the right level?
5. Check for prop drilling - Should context be used instead?

**Red flags:**

- ❌ `fetch` or `axios` called directly in components
- ❌ Missing query invalidation after mutations
- ❌ Duplicated state (same data in multiple places)
- ❌ Props passed through many layers
- ❌ Global state for component-specific concerns

---

## 5. Documentation Review

### 5.1 Check Code Documentation

**What to look for:**

- [ ] **JSDoc for public APIs**: Exported functions/hooks have documentation
- [ ] **Complex logic explained**: Non-obvious code has comments
- [ ] **Why, not what**: Comments explain reasoning, not mechanics
- [ ] **No outdated comments**: Comments match current code
- [ ] **README updates**: If adding major feature, README updated

**Sub-steps:**

1. Check exported functions - Do they have JSDoc comments?
2. Review complex algorithms - Are they explained?
3. Look for "magic numbers" - Are they explained or made into constants?
4. Check for TODO comments - Are they tracked?
5. Verify comments are accurate and current

**Red flags:**

- ❌ No JSDoc on public functions
- ❌ Complex code without explanation
- ❌ Comments that restate the code
- ❌ Outdated comments
- ❌ Commented-out code

**Examples:**

```typescript
// ❌ BAD: States the obvious
// Set count to 0
const count = 0;

// ✅ GOOD: Explains why
// Reset count to 0 because previous user session invalidated
const count = 0;

// ❌ BAD: No documentation
export function calculateScore(data) {
  return data.correct / data.total * 100;
}

// ✅ GOOD: Documented with JSDoc
/**
 * Calculates quiz score as a percentage
 * @param data Quiz result data
 * @returns Score from 0-100
 */
export function calculateScore(data: QuizResult): number {
  return (data.correct / data.total) * 100;
}
```

---

### 5.2 Verify Breaking Changes

**What to look for:**

- [ ] **Breaking changes documented**: Clearly called out in PR description
- [ ] **Migration path provided**: Instructions for updating existing code
- [ ] **Deprecation warnings**: If phasing out old API
- [ ] **Version bump appropriate**: Major version for breaking changes

**Sub-steps:**

1. Check for API changes - Any function signatures changed?
2. Check for removed exports - Anything deleted that was public?
3. Verify documentation of breaking changes
4. Check if migration guide provided
5. Verify affected areas identified

**Red flags:**

- ❌ Breaking changes not mentioned
- ❌ No migration instructions
- ❌ Silent breaking changes
- ❌ Removing functionality without deprecation period

---

## 6. Security Review

### 6.1 Check for Security Issues

**What to look for:**

- [ ] **No secrets committed**: No API keys, passwords, tokens
- [ ] **Input validation**: User input is validated before use
- [ ] **SQL injection prevention**: Parameterized queries (if applicable)
- [ ] **XSS prevention**: Proper escaping of user content
- [ ] **Authentication checks**: Protected routes require auth
- [ ] **Authorization checks**: Users can only access their data

**Sub-steps:**

1. Search for common secret patterns (keys, tokens, passwords)
2. Check user input handling - Is it validated/sanitized?
3. Review API calls - Are they authenticated?
4. Check data access - Is authorization verified?
5. Look for dangerous functions (eval, innerHTML, etc.)

**Red flags:**

- ❌ Hardcoded secrets or API keys
- ❌ Unvalidated user input
- ❌ Direct HTML injection
- ❌ Missing authentication checks
- ❌ Exposing sensitive data in logs

---

## 7. Performance Review

### 7.1 Check for Performance Issues

**What to look for:**

- [ ] **Unnecessary re-renders**: Proper use of useMemo/useCallback
- [ ] **Efficient queries**: Appropriate staleTime and cacheTime
- [ ] **No n+1 queries**: Batch requests where possible
- [ ] **Lazy loading**: Heavy components loaded on demand
- [ ] **Large lists virtualized**: Using virtualization for long lists

**Sub-steps:**

1. Check for expensive computations - Should they be memoized?
2. Review query configurations - Are staleTime/cacheTime appropriate?
3. Look for loops with async calls - Can they be batched?
4. Check component size - Should parts be lazy loaded?
5. Review list rendering - Are large lists virtualized?

**Red flags:**

- ❌ Expensive calculations in render
- ❌ Creating new objects/arrays in render
- ❌ Queries with staleTime: 0 (always refetch)
- ❌ Rendering 1000+ items without virtualization
- ❌ Large bundles loaded upfront

---

## 8. Final Checks

### 8.1 Verify Checklist Completion

**What to look for:**

- [ ] **Author checklist complete**: All items checked off
- [ ] **Tests passing**: Green checkmarks
- [ ] **No merge conflicts**: Branch is up to date
- [ ] **Reviewers assigned**: Appropriate people tagged
- [ ] **Labels applied**: Correct labels for categorization

**Sub-steps:**

1. Review PR checklist - Are all items addressed?
2. Check CI status - All green?
3. Verify branch status - No conflicts?
4. Check reviewers - Right people assigned?

---

### 8.2 Leave Constructive Feedback

**How to provide feedback:**

1. **Be specific**: Point to exact lines, explain the issue
2. **Distinguish severity**:
   - 🚫 **Blocking**: Must be fixed before merge
   - 💡 **Suggestion**: Nice to have, not blocking
   - ❓ **Question**: Asking for clarification
3. **Explain why**: Don't just say "this is wrong", explain the impact
4. **Offer solutions**: Suggest alternatives when pointing out problems
5. **Acknowledge good work**: Call out clever solutions

**Examples:**

```markdown
🚫 **Blocking**: This function is missing error handling. If the API call fails, 
the app will crash. Please add a try-catch block and show an error message to the user.

💡 **Suggestion**: Consider extracting this calculation to a separate function 
in the domain layer for better testability and reusability.

❓ **Question**: I see you're using localStorage here. Is there a reason we're 
not using the existing storage adapter?

✅ **Great work**: Love how you extracted this logic into a pure function with tests!
```

---

### 8.3 Approve or Request Changes

**When to approve:**

- ✅ All checklist items satisfied
- ✅ No blocking issues
- ✅ Tests comprehensive and passing
- ✅ Architecture boundaries respected
- ✅ Code quality meets standards
- ✅ Documentation adequate

**When to request changes:**

- ❌ Any blocking issues identified
- ❌ Tests missing or inadequate
- ❌ Architecture violations
- ❌ Security concerns
- ❌ Breaking changes without documentation

**When to comment (not block):**

- 💡 Suggestions for improvement (non-blocking)
- ❓ Questions for clarification
- ✅ Positive feedback

---

## Review Time Expectations

| PR Size       | Lines Changed | Review Time        |
| ------------- | ------------- | ------------------ |
| Small         | < 100         | 15-30 minutes      |
| Medium        | 100-300       | 30-60 minutes      |
| Large         | 300-500       | 1-2 hours          |
| Very Large    | > 500         | 2+ hours (consider splitting) |

**Note**: These are guidelines. Complex changes may take longer regardless of size.

---

## Related Documentation

- [`PR_STANDARDS.md`](./PR_STANDARDS.md) - PR checklists and standards
- [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - Hexagonal architecture
- [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) - Testing requirements
- [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) - Code patterns
- [`ENGINEERING_DOCTRINE.md`](./ENGINEERING_DOCTRINE.md) - Engineering principles

---

**Remember**: Code review is about maintaining quality and sharing knowledge, not finding fault. Be thorough, be constructive, and be kind.
