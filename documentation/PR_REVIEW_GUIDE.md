# PR Review Guide

_In-depth steps for conducting thorough pull request reviews._

Expands on the checklist in [`PR_STANDARDS.md`](./PR_STANDARDS.md). For code patterns, see [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md). For testing rules, see [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md).

---

## 1. Initial Assessment

### 1.1 PR Description

- [ ] Clear title following convention (`feat:`, `fix:`, `refactor:`)
- [ ] Explains what changed and why
- [ ] How to test
- [ ] Breaking changes called out
- [ ] Screenshots for UI changes

**Red flags**: Vague title, empty description, UI changes without screenshots.

### 1.2 PR Size

- [ ] Focused on a single concern
- [ ] Preferably < 500 lines (exceptions: test updates, import changes)
- [ ] No unrelated changes mixed in

**Red flags**: >1000 lines without justification, mixing reformatting with features, debugging code left in.

### 1.3 CI Status

- [ ] All checks passing (build, tests, lint, typecheck)

---

## 2. Testing Review

### 2.1 Coverage

- [ ] New files have colocated `.test.ts` files
- [ ] Tests cover both happy path and error cases
- [ ] Critical paths tested

**Red flags**: New files without tests, only happy-path tests, tests that don't assert meaningful behavior.

### 2.2 Test Quality

- [ ] Test names describe behavior being verified
- [ ] Tests are deterministic (no timing dependencies)
- [ ] Mocks are properly reset between tests
- [ ] No skipped tests without explanation

**Red flags**: Tests named "test 1", hardcoded timeouts, tests passing regardless of implementation.

### 2.3 Mock Files

- [ ] Every data-returning hook has a `.mock.ts` file
- [ ] Mocks use `createOverrideableMock` pattern
- [ ] Default implementation provides sensible values

See [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) for mock rules.

---

## 3. Code Quality

### 3.1 Naming

- [ ] Files: camelCase for hooks, PascalCase for components
- [ ] Variables/functions: descriptive camelCase
- [ ] Constants: SCREAMING_SNAKE_CASE
- [ ] Types: PascalCase

See [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) for full conventions.

### 3.2 TypeScript

- [ ] No `any` types (each must be justified or removed)
- [ ] All hooks have explicit return types (no inference, no `ReturnType<>`)
- [ ] No `@ts-ignore`
- [ ] Proper null handling with optional chaining

### 3.3 Complexity

- [ ] Functions do one thing
- [ ] Maximum ~3 levels of nesting
- [ ] No duplicated code blocks
- [ ] Clear logic flow

### 3.4 Error Handling

- [ ] Async operations have error handling
- [ ] UI shows loading and error states
- [ ] No empty catch blocks or swallowed errors

---

## 4. Architecture Review

**CRITICAL: `BOUNDARIES.md` files are authoritative, NOT the linter.** Passing lint does not mean the architecture is correct.

### 4.1 Layer Boundaries

- [ ] Code is in the correct layer for its responsibility
- [ ] Dependencies flow inward only
- [ ] No circular dependencies

**For each changed file, verify against the relevant `BOUNDARIES.md`:**
- `src/hexagon/domain/BOUNDARIES.md`
- `src/hexagon/application/BOUNDARIES.md`
- `src/hexagon/infrastructure/BOUNDARIES.md`
- `src/hexagon/interface/BOUNDARIES.md`
- Subdirectory `BOUNDARIES.md` files

**What the linter catches**: Import direction violations, importing from wrong layers.

**What the linter CAN'T catch** (you must review manually):
- Business logic placed in components instead of domain
- Orchestration logic in components instead of use cases
- Branching/transformation logic in infrastructure adapters
- Semantic boundary violations that technically pass import rules

### 4.2 Use Case Pattern

- [ ] Pages call exactly one use case hook
- [ ] Use cases have explicit return type interfaces
- [ ] Business logic is in domain functions, not in use cases
- [ ] Use cases compose units/queries/coordinators

### 4.3 Data Flow

- [ ] TanStack Query for all server data
- [ ] Mutations invalidate related queries
- [ ] State at the right level (local vs context vs query)

See [`DATA_FLOW.md`](./DATA_FLOW.md) for patterns.

---

## 5. Documentation

- [ ] Exported functions have JSDoc
- [ ] Complex logic has comments explaining _why_
- [ ] No commented-out code
- [ ] No outdated comments
- [ ] `DOMAIN_GLOSSARY.md` updated if new concepts introduced

---

## 6. Security

- [ ] No hardcoded secrets or API keys
- [ ] User input validated
- [ ] Protected routes require authentication
- [ ] No `eval`, `innerHTML`, or `dangerouslySetInnerHTML` without justification

---

## 7. Performance

- [ ] Expensive computations memoized
- [ ] Appropriate `staleTime` on queries
- [ ] Large lists use virtualization
- [ ] No unnecessary re-renders from unstable references

---

## 8. Giving Feedback

Use severity prefixes:
- **Blocking**: Must fix before merge
- **Suggestion**: Nice to have, not blocking
- **Question**: Asking for clarification

Be specific, explain the impact, offer alternatives, and acknowledge good work.

### Approve When

All checklist items satisfied, tests comprehensive and passing, architecture boundaries respected.

### Request Changes When

Blocking issues, missing tests, architecture violations, security concerns.
