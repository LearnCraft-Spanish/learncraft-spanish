import type { AuthPort, AuthUser } from '@application/ports/authPort';

type PreviewRole = 'student' | 'coach' | 'admin' | 'limited';

function rolesFor(role: PreviewRole): string[] {
  switch (role) {
    case 'admin':
      return ['Admin', 'Coach', 'Student'];
    case 'coach':
      return ['Coach', 'Student'];
    case 'limited':
      return ['Limited'];
    case 'student':
    default:
      return ['Student'];
  }
}

function readRole(): PreviewRole {
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get('role') ?? 'student').toLowerCase();
  if (
    raw === 'admin' ||
    raw === 'coach' ||
    raw === 'limited' ||
    raw === 'student'
  ) {
    return raw;
  }
  return 'student';
}

/**
 * Auth0-free AuthPort for the gauntlet preview.
 * No Vitest `vi` — plain functions only.
 */
export function useAuthAdapter(): AuthPort {
  const role = readRole();
  const authUser: AuthUser = {
    email: `gauntlet-${role}@fake.not`,
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
