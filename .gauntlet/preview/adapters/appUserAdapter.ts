import type { AppUserPort } from '@application/ports/appUserPort';
import type { AppUserAbbreviation } from '@learncraft-spanish/shared';

import { previewFixtureUsers, previewUserForRole } from './fixtures';
import { readPreviewRole } from './previewRole';

/**
 * Network-free AppUserPort for the gauntlet preview.
 * No Vitest `vi` — plain async functions only.
 */
export function useAppUserAdapter(): AppUserPort {
  return {
    getMyData: async () => previewUserForRole(readPreviewRole()),

    getAppUserByEmail: async (email: string) => {
      return (
        previewFixtureUsers().find((user) => user.emailAddress === email) ??
        null
      );
    },

    getAllAppStudents: async (): Promise<AppUserAbbreviation[]> => {
      return previewFixtureUsers().map(({ name, emailAddress }) => ({
        name,
        emailAddress,
      }));
    },
  };
}

export default useAppUserAdapter;
