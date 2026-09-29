import type { AuthPort, AuthUser } from '@application/ports/authPort';

import { emailForRole, readPreviewRole, type PreviewRole } from './previewRole';

export const GAUNTLET_STUB = true;

function rolesFor(role: PreviewRole): string[] {
  switch (role) {
    case 'admin':
      return ['Admin', 'Coach', 'Student'];
    case 'coach':
      return ['Coach', 'Student'];
    case 'limited':
      return ['Limited'];
    case 'free':
      return [];
    case 'student':
    default:
      return ['Student'];
  }
}

/**
 * Auth0-free AuthPort for the gauntlet preview.
 * No Vitest `vi` — plain functions only.
 */
export function useAuthAdapter(): AuthPort {
  const role = readPreviewRole();
  const authUser: AuthUser = {
    email: emailForRole(role),
    roles: rolesFor(role),
  };

  return {
    getAccessToken: async () => authUser.email,
    login: () => {
      throw new Error('[gauntlet] AuthPort.login is disabled in preview');
    },
    logout: () => {
      throw new Error('[gauntlet] AuthPort.logout is disabled in preview');
    },
    authUser,
    isAdmin: role === 'admin',
    isCoach: role === 'admin' || role === 'coach',
    isStudent: role === 'student' || role === 'admin' || role === 'coach',
    isLimited: role === 'limited',
    isAuthenticated: true,
    isLoading: false,
  };
}

export default useAuthAdapter;
