import { vi } from "vitest";

export const createMockAuth = () => {
  let isAuthenticated = true;
  let isLoading = false;
  let token: string | null = null;

  const loginWithRedirect = vi.fn(); // Mock to track interactions
  const logout = vi.fn(); // Mock to track interactions

  const mockAuth = {
    isAuthenticated: () => isAuthenticated,
    isLoading: () => isLoading,
    getAccessTokenSilently: async () => token,

    loginWithRedirect, // Now we can track and assert on interactions
    logout,

    setAuthState: (authStatus: boolean) => (isAuthenticated = authStatus),
    setLoadingState: (loadingStatus: boolean) => (isLoading = loadingStatus),
    setToken: (mockToken: string | null) => (token = mockToken),
    resetMocks: () => {
      isAuthenticated = false;
      token = null;
      loginWithRedirect.mockReset(); // Reset the mocks
      logout.mockReset();
    },
  };

  return mockAuth;
};
