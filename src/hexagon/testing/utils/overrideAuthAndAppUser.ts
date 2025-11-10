import type { AppUser } from '@learncraft-spanish/shared';
import type { TestUserEmail } from 'mocks/data/serverlike/userTable';
import type { AuthUser } from 'src/hexagon/application/ports/authPort';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockActiveStudent } from '@application/coordinators/hooks/useActiveStudent.mock';
import {
  getAppUserFromEmail,
  testUserEmailsSchema,
} from 'mocks/data/serverlike/userTable';

/**
 * Combined override function for both AuthUser and AppUser mocks.
 * This function simplifies test setup by allowing you to override both
 * authentication and application user data in a single call.
 *
 * @example
 * // Override both auth and app user
 * overrideAuthAndAppUser(
 *   {
 *     authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
 *     isAuthenticated: true,
 *     isStudent: true,
 *   },
 *   {
 *     appUser: getAppUserFromName('student-lcsp')!,
 *     isOwnUser: true,
 *   }
 * );
 *
 * @example
 * // Override only auth user (no app user)
 * overrideAuthAndAppUser({
 *   isAuthenticated: false,
 *   isLoading: false,
 * });
 *
 * @example
 * // Override auth user with specific roles
 * overrideAuthAndAppUser({
 *   authUser: getAuthUserFromEmail('admin-empty-role@fake.not')!,
 *   isAuthenticated: true,
 *   isAdmin: true,
 *   isCoach: false,
 *   isStudent: false,
 * });
 */
export function overrideAuthAndAppUser(
  authOverrides: {
    authUser: AuthUser | undefined;
    isAuthenticated?: boolean;
    isLoading?: boolean;
    isAdmin?: boolean;
    isCoach?: boolean;
    isStudent?: boolean;
    isLimited?: boolean;
  },
  appUserOverrides?: {
    appUser?: AppUser | null;
    isLoading?: boolean;
    error?: Error | null;
    isOwnUser?: boolean;
  },
) {
  // check if the auth user and app user emails are in the test user emails
  if (
    authOverrides.authUser?.email &&
    !testUserEmailsSchema.safeParse(authOverrides.authUser.email).success
  ) {
    throw new Error(
      `Email ${authOverrides.authUser.email} not found in test user emails`,
    );
  }
  if (
    appUserOverrides?.appUser &&
    appUserOverrides.appUser?.emailAddress &&
    !testUserEmailsSchema.safeParse(appUserOverrides.appUser.emailAddress)
      .success
  ) {
    throw new Error(
      `App user email ${appUserOverrides.appUser.emailAddress} not found in test user emails`,
    );
  }

  // Override auth adapter with auth user data and boolean flags
  overrideMockAuthAdapter({
    ...authOverrides,
  });

  // Override active student with app user data and state flags (if provided)
  if (authOverrides.authUser && appUserOverrides?.appUser === undefined) {
    overrideMockActiveStudent({
      appUser: getAppUserFromEmail(
        authOverrides.authUser?.email as TestUserEmail,
      ),
      ...appUserOverrides,
    });
  } else {
    overrideMockActiveStudent({
      ...appUserOverrides,
    });
  }
}
