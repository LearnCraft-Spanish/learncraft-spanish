import { vi } from "vitest";

import { getUserDataFromName } from "../data/serverlike/studentTable";

const mockUserData = getUserDataFromName("student-admin");

export const createMockAuth = () => {
  let isAuthenticated = true;
  let isLoading = false;
  let token: string | undefined = mockUserData?.emailAddress;

  const loginWithRedirect = vi.fn(); // Mock to track interactions
  const logout = vi.fn(); // Mock to track interactions

  const setToken = (name:
    | "admin-empty-role"
    | "empty-role"
    | "none-role"
    | "limited"
    | "student-admin"
    | "student-lcsp"
    | "student-ser-estar",) => {
    token = getUserDataFromName(name)?.emailAddress;
  }

  const mockAuth = {
    isAuthenticated,
    isLoading,
    getAccessTokenSilently: async () => token,

    loginWithRedirect, // Now we can track and assert on interactions
    logout,

    setAuthState: (authStatus: boolean) => (isAuthenticated = authStatus),
    setLoadingState: (loadingStatus: boolean) => (isLoading = loadingStatus),
    setToken,
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
