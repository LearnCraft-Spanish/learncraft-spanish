import { mock } from "node:test";
import { vi } from "vitest";
import { getUserDataFromName } from "../data/serverlike/studentTable";

export interface MockAuth {
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessToken: () => Promise<string>;
  login: () => void;
  logout: () => Promise<void>;
  setAuthState: (authStatus: boolean) => void;
  setLoadingState: (loadingStatus: boolean) => void;
  setStudent: (
    student:
      | "admin-empty-role"
      | "empty-role"
      | "none-role"
      | "limited"
      | "student-admin"
      | "student-lcsp"
      | "student-ser-estar"
  ) => void;
  resetMocks: () => void;
}

const createMockAuth = (): MockAuth => {
  let isAuthenticated = true;
  console.log("isAuthenticated", isAuthenticated);
  let isLoading = false;
  let userName:
    | "admin-empty-role"
    | "empty-role"
    | "none-role"
    | "limited"
    | "student-admin"
    | "student-lcsp"
    | "student-ser-estar" = "student-admin";

  function getStudentEmail() {
    const studentEmail = getUserDataFromName(userName)?.emailAddress;
    if (!studentEmail) {
      throw new Error("No student email found");
    }
    return studentEmail;
  }

  const login = vi.fn();
  const logout = vi.fn();

  const mockAuth = {
    isAuthenticated,
    isLoading,
    getAccessToken: async () => {
      const token = getStudentEmail();
      return token;
    },
    login,
    logout,
    setAuthState: (authStatus: boolean) => {
      console.log("Setting auth status to", authStatus);
      isAuthenticated = authStatus;
      mockAuth.isAuthenticated = authStatus;
      console.log("isAuthenticated", isAuthenticated);
      console.log("mockAuth.isAuthenticated", mockAuth.isAuthenticated);
    },
    setLoadingState: (loadingStatus: boolean) => {
      isLoading = loadingStatus;
      mockAuth.isLoading = loadingStatus;
    },
    setStudent: (
      student:
        | "admin-empty-role"
        | "empty-role"
        | "none-role"
        | "limited"
        | "student-admin"
        | "student-lcsp"
        | "student-ser-estar"
    ) => (userName = student),
    resetMocks: () => {
      isAuthenticated = false;
      isLoading = false;
      userName = "student-admin"; // Reset userName
      login.mockReset();
      logout.mockReset();
    },
  };

  return mockAuth;
};

export default createMockAuth;
