# Decisions: Testing Infrastructure

## Why Two Separate Test Configurations

**Context**: Hexagon code follows strict layer boundaries; legacy code does not. Hexagon tests need adapter mocks injected globally; legacy tests use MSW and a different mock setup. The two worlds have different include/exclude patterns, different timeouts, and different coverage targets.

**Decision**: Maintain `vitest.config.ts` (legacy, excludes hexagon) and `vitest.config-hexagon.ts` (hexagon only). Each points to its own setup file.

**Consequences**: Tests can't accidentally cross boundaries. Hexagon coverage is measured independently. Developers must specify `--config vitest.config-hexagon.ts` when running hexagon tests. Two Stryker configs (`stryker.config.json`, `stryker.config-hexagon.json`) mirror this split for mutation testing.

## Why Two Separate Setup Files

**Context**: `tests/setupTests.ts` starts the MSW server and mocks a subset of adapters for legacy integration-style tests. `src/hexagon/testing/setupTests.ts` mocks *all* adapters, coordinators, and units globally so hexagon tests operate with full boundary isolation.

**Decision**: Each config points to its own setup file. Hexagon setup mocks every adapter at the module level and resets them after each test. Legacy setup starts MSW and mocks only the adapters that legacy tests use.

**Consequences**: Hexagon tests get deterministic isolation — no network calls, no implicit state leakage. Legacy tests retain their MSW-based approach without being forced into the hexagon mock pattern. As migration progresses, `tests/setupTests.ts` will shrink.

## "Leave the Environment As You Found It" (vs "Assume Nothing")

**Context**: Two opposing philosophies exist for test isolation. "Assume nothing" says every test constructs its entire world from scratch — no shared state, no implicit setup. "Leave it as you found it" says there is a known, documented global state, tests build on top of it, and cleanup restores it after each test. "Assume nothing" is safer in theory but creates enormous boilerplate when every test must set up every adapter, every coordinator, every query. In a codebase with 10+ globally-mocked modules, that boilerplate drowns out the actual assertions.

**Decision**: "Leave the environment as you found it." The global `setupTests.ts` establishes happy-path defaults for all mocked modules. Tests trust that baseline exists. Tests that need different behavior call `override()` for just the fields they care about. The global `afterEach` resets all mocks, clears the QueryClient, and cleans up the DOM — restoring the known-good state for the next test.

**Consequences**: Tests are concise — they only specify what's different from the happy path. A query test can be 15 lines because it only overrides the one adapter method it's testing. Combined with typed mocks, Zod factories, and the override/reset pattern, the result is a TDD environment with minimal ceremony: the red-green-refactor loop is almost entirely about behavior, not infrastructure.

## Why vi.mock (Hoisted) With Factory Defaults — Not vi.doMock (Inline)

**Context**: Vitest offers two mocking mechanisms. `vi.mock` is hoisted — it runs before imports, replacing the module for the entire file. `vi.doMock` is inline — it runs where it's placed, allowing per-test module replacement. `vi.doMock` sounds more flexible, but it requires dynamic `import()` after each mock call, makes test order significant, and can't mock modules that are statically imported by the code under test.

**Decision**: Use `vi.mock` globally (in `setupTests.ts` and at the top of test files) to replace adapter/coordinator modules with factory mocks that return happy-path defaults. Per-test customization is handled by the `override()` function on the mock object — not by re-mocking the module.

**Consequences**: Module replacement happens once, deterministically, before any code runs. Individual tests call `override()` to change return values without touching the module mock. `reset()` in `afterEach` restores defaults. This gives the flexibility of per-test behavior without the fragility of per-test module replacement.

## Why createOverrideableMock / createTypedMock (vs plain vi.fn)

**Context**: Plain `vi.fn()` produces untyped mocks. In a codebase with strict port/adapter boundaries, an untyped mock silently allows the wrong shape to leak through, defeating the purpose of the boundary. Additionally, each test that needs non-default behavior was manually calling `mockImplementation`, leading to boilerplate and inconsistent reset behavior. Every layer — adapters, coordinators, queries, units, use cases — needs mocks, so the pattern must be dead-simple to create and consistent across all of them.

**Decision**: Two complementary utilities:
- `createTypedMock<T>()` — typed wrapper around `vi.fn()` that enforces the function signature at the type level.
- `createOverrideableMock(defaultImpl)` — returns `{ mock, override, reset }`. Define the happy-path default once, destructure the three exports, done. The same 3-line destructure works whether the mock has 3 fields or 30. Individual tests call `override()` for specific scenarios, and `reset()` restores the default (called globally in `afterEach`).

**Consequences**: Creating a new mock at any layer is minimal boilerplate: define the default shape, call `createOverrideableMock`, export the destructured result. Type errors surface at mock creation time rather than as mysterious runtime failures. The override/reset pattern standardizes how tests customize mocks and guarantees cleanup. Every `.mock.ts` file follows the same shape, making the pattern learnable and reproducible across 40+ mock files.

## Why Zod-Based Factories (vs hardcoded fixtures)

**Context**: Domain schemas are defined with Zod. Hardcoded JSON fixtures (`tests/mockDbData.json`) drift out of sync with schema changes — a field rename or new required field silently breaks test data without a type error. Factory functions tied to the Zod schemas stay in sync automatically.

**Decision**: Use `createZodFactory(schema)` and `createZodListFactory(schema)` from `@anatine/zod-mock` to generate test data from domain Zod schemas. Factories accept `overrides` so tests can specify the fields they care about while getting valid defaults for everything else.

**Consequences**: Schema changes immediately surface as factory compilation errors. Test data is realistic and complete by default. Tests only specify the fields relevant to their assertions, reducing noise. The legacy JSON fixtures in `tests/` remain for legacy tests but are not extended.
