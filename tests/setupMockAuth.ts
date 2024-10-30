import { vi } from 'vitest';
import type { MockAuthOptions } from '../mocks/hooks/useMockAuth';
import createMockAuth from '../mocks/hooks/useMockAuth';
import useAuth from '../src/hooks/useAuth';

// Utility function to configure the useAuth mock per test
export const setupMockAuth = (config: MockAuthOptions = {}) => {
  const mockAuth = createMockAuth(config);
  vi.mocked(useAuth).mockReset(); // Clear any previous calls
  vi.mocked(useAuth).mockReturnValue(mockAuth); // Override useAuth return value
};
