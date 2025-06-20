import type { AppUserPort } from '../application/ports/appUserPort';
import type { AuthPort } from '../application/ports/authPort';

import { appUserEndpoints } from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from './http/client';

export function createAppUserInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): AppUserPort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);
  const getAppUserByEmail = async (email: string) => {
    const appUser = await httpClient.get(appUserEndpoints);

    return appUser;
  };

  const getAllAppUsers = async () => {
    const userList = httpClient.get;
    return userList;
  };
  return {
    getAppUserByEmail,
    getAllAppUsers,
  };
}
