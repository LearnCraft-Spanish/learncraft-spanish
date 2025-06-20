import type { AppUser, AppUserAbbreviation } from '@LearnCraft-Spanish/shared';
import type { AppUserPort } from '../application/ports/appUserPort';

import type { AuthPort } from '../application/ports/authPort';
import {
  getAllAppStudentsEndpoint,
  getAppUserEndpoint,
} from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from './http/client';

export function createAppUserInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): AppUserPort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);
  return {
    getAppUserByEmail: async (email: string): Promise<AppUser> => {
      const appUser = await httpClient.get<AppUser>(getAppUserEndpoint.path, {
        params: {
          email: encodeURIComponent(email),
        },
      });
      return appUser;
    },

    getAllAppStudents: async (): Promise<AppUserAbbreviation[]> => {
      const userList = await httpClient.get<AppUserAbbreviation[]>(
        getAllAppStudentsEndpoint.path,
      );
      return userList;
    },
  };
}
