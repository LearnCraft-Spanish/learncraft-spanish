import { mock } from "node:test";
import { vi } from "vitest";
import { getUserDataFromName } from "../data/serverlike/studentTable";

export interface MockAuth {
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessToken: () => Promise<string>;
  login: () => void;
  logout: () => Promise<void>;
}

interface MockAuthOptions {
  isAuthenticated?: boolean;
  isLoading?: boolean;
  userName?:
    | "admin-empty-role"
    | "empty-role"
    | "none-role"
    | "limited"
    | "student-admin"
    | "student-lcsp"
    | "student-ser-estar";
}

const createMockAuth = ({
  isAuthenticated = true,
  isLoading = false,
  userName = "student-admin",
}: MockAuthOptions = {}): MockAuth => {
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
  };

  return mockAuth;
};

export default createMockAuth;
