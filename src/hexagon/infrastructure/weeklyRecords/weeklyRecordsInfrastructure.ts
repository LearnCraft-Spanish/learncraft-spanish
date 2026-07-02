import type { AuthPort } from '@application/ports/authPort';
import type { WeeklyRecordsPort } from '@application/ports/weeklyRecordsPort';
import { createHttpClient } from '@infrastructure/http/client';
import { getWeeksByStartDateEndpoint } from '@learncraft-spanish/shared';

export function createWeeklyRecordsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): WeeklyRecordsPort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getWeeksByStartDate: async (startDate) => {
      const response = await httpClient.get<unknown>(
        getWeeksByStartDateEndpoint.path,
        getWeeksByStartDateEndpoint.requiredScopes,
        {
          params: {
            start_date: startDate,
          },
        },
      );

      return getWeeksByStartDateEndpoint.response.parse(response);
    },
  };
}
