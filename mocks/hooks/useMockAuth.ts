import { vi } from "vitest";

const createMockAuth = () => {
  let isAuthenticated = true;
  let isLoading = false;
  let token: string | undefined;

  const loginWithRedirect = vi.fn(); // Mock to track interactions
  const logout = vi.fn(); // Mock to track interactions

  const mockAuth = {
    isAuthenticated,
    isLoading,
    getAccessTokenSilently: async () => token,

    loginWithRedirect, // Now we can track and assert on interactions
    logout,

    setAuthState: (authStatus: boolean) => (isAuthenticated = authStatus),
    setLoadingState: (loadingStatus: boolean) => (isLoading = loadingStatus),
    setToken: (mockToken: string | undefined) => (token = mockToken),
    resetMocks: () => {
      isAuthenticated = false;
      token = undefined;
      loginWithRedirect.mockReset(); // Reset the mocks
      logout.mockReset();
    },
  };

  return mockAuth;
};

export default createMockAuth;
