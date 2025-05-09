import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

// Module-level state for the registry
const registry = new Set<string>();

type MockFactory = () => Record<string, MockInstance>;

/**
 * Sets up and applies a module mock using the provided factory function.
 * The mock is registered for cleanup via cleanupRegisteredMocks().
 *
 * @param path - The module path to mock: ALWAYS USE ALIAS FOR THE PATH
 * @param factory - A function that returns an object with mock implementations
 *
 * @example
 * describe('my test', () => {
 *   setupModuleMock('@application/units/useVocabulary', () => ({
 *     useVocabulary: mockImplementation,
 *     anotherExport: anotherMock
 *   }));
 *
 *   afterEach(() => {
 *     cleanupRegisteredMocks();
 *   });
 * });
 */
export function setupModuleMock(path: string, factory: MockFactory) {
  if (registry.has(path)) {
    // eslint-disable-next-line no-console
    console.warn(`[Vitest] Module already mocked: ${path}`);
  }

  vi.mock(path, factory);
  registry.add(path);
}

/**
 * Cleans up all registered mocks by unmocking them and clearing the registry.
 * This should be called in afterEach() or afterAll() test hooks.
 *
 * @example
 * describe('my test', () => {
 *   setupModuleMock('@application/units/useVocabulary', () => ({...}));
 *   setupModuleMock('@application/units/useSubcategories', () => ({...}));
 *
 *   afterEach(() => {
 *     cleanupRegisteredMocks();
 *   });
 * });
 */
export function cleanupRegisteredMocks() {
  for (const path of registry) {
    vi.unmock(path);
  }
  vi.resetModules(); // clear module cache so unmock takes effect
  registry.clear();
}
