import type { CookiePort } from '@application/ports/cookiePort';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

// In-memory cookie jar for testing
const cookies = new Map<string, string>();

const defaultMockAdapter: CookiePort = {
  getCookie: vi.fn<(name: string) => string | null>(
    (name: string) => cookies.get(name) ?? null,
  ),
  setCookie: vi.fn<
    (name: string, value: string, expirationDate: Date, path?: string) => void
  >((name: string, value: string) => {
    cookies.set(name, value);
  }),
  deleteCookie: vi.fn<(name: string, path?: string) => void>((name: string) => {
    cookies.delete(name);
  }),
};

const {
  mock: mockCookieAdapter,
  override: overrideMockCookieAdapter,
  reset: baseResetMockCookieAdapter,
} = createOverrideableMock<CookiePort>(defaultMockAdapter);

// Also empties the in-memory cookie jar
export const resetMockCookieAdapter = (): void => {
  cookies.clear();
  baseResetMockCookieAdapter();
};

export { mockCookieAdapter, overrideMockCookieAdapter };
export default mockCookieAdapter;
