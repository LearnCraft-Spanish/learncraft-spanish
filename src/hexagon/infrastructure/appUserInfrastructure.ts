import type { AppUser, AppUserAbbreviation } from '@LearnCraft-Spanish/shared';
import type { AppUserPort } from '../application/ports/appUserPort';

import type { AuthPort } from '../application/ports/authPort';
import { createHttpClient } from '@infrastructure/http/client';
import {
  getAllAppStudentsEndpoint,
  getAppUserEndpoint,
} from '@LearnCraft-Spanish/shared';

export function createAppUserInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): AppUserPort {
  const httpClient = createHttpClient(apiUrl, auth);
  return {
    getAppUserByEmail: async (email: string) => {
      const appUser = await httpClient.get<AppUser>(
        getAppUserEndpoint.path,
        getAppUserEndpoint.requiredScopes,
        {
          params: {
            email: encodeURIComponent(email),
          },
        },
      );
      if (typeof appUser === 'string') {
        return null;
      }
      return appUser;
    },

    getAllAppStudents: async () => {
      const userList = await httpClient.get<AppUserAbbreviation[]>(
        getAllAppStudentsEndpoint.path,
        getAllAppStudentsEndpoint.requiredScopes,
      );
      return userList;
    },
  };
}
