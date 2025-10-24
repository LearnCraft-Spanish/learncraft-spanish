# 🧪 Testing Standards (v1.0)

_For LearnCraft Spanish Software Development_

---

## 🟢 Goals

- Ensure code changes are safe and testable.
- Improve test coverage progressively without blocking velocity.
- Reflect our architectural boundaries in our testing strategy.
- Foster trust in the system through meaningful, maintainable tests.

---

## ✅ Baseline Testing Rules (All Code)

1. **All changes must pass all existing tests.**  
   No exceptions. If tests are failing, fix them before merging.

2. **When you modify or create a file, you must do one of the following:**
   - **New features:** Add at least one meaningful unit or integration test that covers the new logic.
   - **Bug fixes:** Add a regression test that would have caught the issue.
   - **Refactoring:** Ensure no test coverage is lost (or ideally improved). Rerun affected tests.
   - **Legacy files with no tests:** If you're adding/modifying logic, write at least two success tests, and one failure test covering the file. Write at least 1 test covering the touched functionality

3. **If it’s not testable, something’s wrong.**  
   Revisit the original file, then discuss with your team. The hexagonal pattern should encourage testable separation between logic and IO.

---

## 🧱 Testing in Hexagonal Architecture

| Layer              | What to Test                                                                                 | What to Mock                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Domain**         | Fully unit tested. Pure logic should be testable directly. No tests for definitions          | None                                                                                               |
| **Application**    | Units are unit tested, useCases are unit and integration tested                              | Adapters, anything that is maniuplating external data (namely units, sometimes coordinator hooks?) |
| **Ports**          | None                                                                                         | Mocked at the adapter level inside application layer                                               |
| **Interface**      | Unit tests for units, Integration tests for compositional components (pages, 'parent' units) | none. should use mocks established in application layer                                            |
| **Infrastructure** | None                                                                                         | All utilized mocks should be made in the adapters that call them (application level) them          |
| **Composition**    | None                                                                                         | None. all data hooks consumed must be mocked                                                       |

---

## 🧪 Mocking Rules

1. **All exported data-returning hooks must have a mock.**
   - If a hook:
     - Can be used in another file
     - Returns data (from API or tanstack)
   - Then it must:
     - Have unit tests
     - Provide a mock (e.g. `./useThing.mock.ts`)

2. **Mocks must be predictable and reusable.**
   - Define default ("happy path") values and allow overrides.
   - Utalize createOverrideableMock defined in testing/utils/createOverrideableMock.ts

3. **Don't mock the domain.**
   - Never mock core business logic — test it directly with unit tests.

4. **UI/component-level tests must use external dependency mocks**
   - Components that use data-fetching hooks should use those hooks' mocks in tests.

5. **Integration tests may use real implementations up to the boundary.**
   - Example: A service test may call real domain logic but mock the API adapter.

---

## Using Mocks

1. All Mocks will be created using createOverrideableMock function, located at:
   `@testing/utils/createOverrideableMock.ts`
1. The Mock should return the defaultMockImplementation, overrideMock function, and resetMock functions.

- **All Mocks used in a test file must be initialized using the below pattern**
  - Mock the component using either the defaultMockImplementation imported from the mock's file, or one defined locally in the test file

```
vi.mock('@path/to/file' () => {
   overrideMock(defaultMockImplementation)
})
```

- **Modified Global Mocks must be cleaned up with the following pattern**
  - Resets to the default mock implementation, imported from the mock file

```

  afterAll(() => {
   resetComponentToBeMocked();
  });

```

- All Mocks set using vi.mock in a test file are automatically cleaned up by vitest

## 🧹 Test Environment & Cleanup

**Philosophy: "Leave the testing environment the way you found it"**

We follow the principle of cleaning up after ourselves rather than assuming nothing about the test environment. This enables tests to be more efficient while maintaining isolation.

1. **Mock Cleanup is Required**
   - If you mock anything in a test file, you **must** clean it up at the end (e.g., in `afterEach` or `afterAll`).
   - Unmock or reset all mocked functions/modules to their original state.

2. **Assume Default Mocks from Setup**
   - If something is mocked in the `setupTests` file, assume it is using the **default mock values** (happy path).
   - You can rely on these defaults without redeclaring them in every test.

3. **Override and Restore**
   - If you override a mock (e.g., to test an error state), you **must** reset the mock to its base implementation at the end of the test file.
   - Use `afterEach(() => { mockFn.mockRestore() })` or similar cleanup patterns.

4. **Why This Matters**
   - Prevents test pollution and unexpected failures.
   - Allows tests to run in any order without side effects.
   - Makes test files more readable by reducing redundant setup.

---

## 📈 Progressive Improvement

- **No required % coverage**, but **coverage should never decrease**.
- **Each pull request should improve test coverage and/or reliability**, even slightly.
- If modifying a file with no tests, **add at least 4 tests.** 2 success and 1 failure for the file, 1 covering the new changes

---

## 🧰 Recommended Practices

- Write fast, deterministic unit tests for core logic.
- Use integration tests to verify module collaboration.
- Keep tests isolated with mocks to reflect hexagonal boundaries.
- Use clear naming and structure:
  - colocated test files (e.g. `file.test.ts`)
  - colocated mock files (e.g. `file.mock.ts`)
- Prefer clarity over coverage — good tests are readable, relevant, and reliable. (NO FLAKEY TESTS)

---

## 🧯 Exceptions

- Pure config, constants, or comment-only changes don’t require new tests. (UNLESS THEY CHANGE EXPECTED BEHAVIORS)
- Experimental code may be committed to the development branch without test coverage if:
  - It is **clearly marked** (e.g., `EXPERIMENTAL_` or TODO)
  - A test plan or coverage task is tracked separately before merge
