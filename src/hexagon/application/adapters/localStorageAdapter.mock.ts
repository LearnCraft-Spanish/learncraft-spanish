import type { LocalStoragePort } from '@application/ports/localStoragePort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

// In-memory storage for testing
const storage = new Map<string, any>();

// Create a default mock implementation matching the port exactly
const defaultMockAdapter: LocalStoragePort = {
  // eslint-disable-next-line custom/no-untyped-mocks -- Generic function type cannot be expressed in vi.fn type system
  getItem: vi.fn(<T>(key: string): T | null => storage.get(key) ?? null) as any,
  // eslint-disable-next-line custom/no-untyped-mocks -- Generic function type cannot be expressed in vi.fn type system
  setItem: vi.fn(<T>(key: string, value: T): void => {
    storage.set(key, value);
  }),
  removeItem: vi.fn<(key: string) => void>((key: string): void => {
    storage.delete(key);
  }),
};

// Create an overrideable mock with the default implementation
const {
  mock: mockLocalStorageAdapter,
  override: baseOverrideMockLocalStorageAdapter,
  reset: baseResetMockLocalStorageAdapter,
} = createOverrideableMock<LocalStoragePort>(defaultMockAdapter);

// Custom reset function that also clears the in-memory storage
export const resetMockLocalStorageAdapter = () => {
  storage.clear();
  baseResetMockLocalStorageAdapter();
};

// Export the override function
export const overrideMockLocalStorageAdapter =
  baseOverrideMockLocalStorageAdapter;

// Export the mock and default for global mocking
export { mockLocalStorageAdapter };
export default mockLocalStorageAdapter;
