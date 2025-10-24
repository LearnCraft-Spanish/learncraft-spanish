/**
 * Example usage of overrideAuthAndAppUser function
 * This shows how to replace the existing pattern of calling both
 * overrideMockAuthAdapter and overrideMockActiveStudent separately.
 */

import {
  getAppUserFromName,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { overrideAuthAndAppUser } from './overrideAuthAndAppUser';

// Example: Student, own user
export function setupStudentUser() {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAdmin: false,
      isCoach: false,
      isStudent: true,
    },
    {
      isOwnUser: true,
    },
  );
}

// Example: admin, not own user
export function setupAdminUser() {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
      isAuthenticated: true,
      isAdmin: true,
      isCoach: false,
      isStudent: false,
      isLimited: false,
    },
    {
      appUser: getAppUserFromName('student-lcsp')!,
      isOwnUser: false,
    },
  );
}

// Example: Setup limited user
export function setupLimitedUser() {
  overrideAuthAndAppUser({
    authUser: getAuthUserFromEmail('limited@fake.not')!,
    isAuthenticated: true,
    isAdmin: false,
    isCoach: false,
    isStudent: false,
    isLimited: true,
  });
}

// Example: Setup logged out user
export function setupLoggedOutUser() {
  overrideAuthAndAppUser({
    authUser: undefined,
    isAuthenticated: false,
    isLoading: false,
  });
}

// Example: Setup loading state
export function setupLoadingUser() {
  overrideAuthAndAppUser({
    authUser: undefined,
    isLoading: true,
  });
}
