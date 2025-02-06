import { vi } from 'vitest';
import { getUserDataFromName } from '../data/serverlike/userTable';

export interface MockAuth {
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessToken: () => Promise<string | undefined>;
  login: () => void;
  logout: () => Promise<void>;
}

export interface MockAuthOptions {
  isAuthenticated?: boolean;
  isLoading?: boolean;
  userName?:
    | 'admin-empty-role'
    | 'empty-role'
    | 'none-role'
    | 'limited'
    | 'student-admin'
    | 'student-lcsp'
    | 'student-ser-estar'
    | 'student-no-flashcards'
    | null;
}

const createMockAuth = ({
  isAuthenticated = true,
  isLoading = false,
  userName = 'student-admin', // Default userName is "student-admin"
}: MockAuthOptions = {}): MockAuth => {
  function getStudentEmail() {
    const studentEmail = getUserDataFromName(userName)?.emailAddress;
    if (!studentEmail) {
      return undefined;
    }
    return studentEmail;
  }

  const login = vi.fn();
  const logout = vi.fn();

  return {
    isAuthenticated,
    isLoading,
    getAccessToken: async () => {
      const token = getStudentEmail();
      return token;
    },
    login,
    logout,
  };
};

export default createMockAuth;
