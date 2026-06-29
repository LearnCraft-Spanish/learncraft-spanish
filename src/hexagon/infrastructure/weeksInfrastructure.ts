import type { AuthPort } from '@application/ports/authPort';
import type { WeeksPort } from '@application/ports/weeksPort';
import type { FurnishedWeek } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import { getMembershipWeeksEndpoint } from '@learncraft-spanish/shared';

export function createWeeksInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): WeeksPort {
  const httpClient = createHttpClient(apiUrl, auth);
  return {
    getMembershipWeeks: (membershipId: number) =>
      httpClient.get<FurnishedWeek[]>(
        getMembershipWeeksEndpoint.path.replace(
          ':membershipId',
          String(membershipId),
        ),
        getMembershipWeeksEndpoint.requiredScopes,
      ),
  };
}
