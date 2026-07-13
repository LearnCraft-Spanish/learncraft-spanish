import type { AuthPort } from '@application/ports/authPort';
import type { WeeklyRecordsPort } from '@application/ports/weeklyRecordsPort';
import type { BaseWeek } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  getWeeksByStartDateEndpoint,
  updateWeeksEndpoint,
} from '@learncraft-spanish/shared';

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
    updateWeeks: async (weeks) => {
      const response = await httpClient.put<BaseWeek[]>(
        updateWeeksEndpoint.path,
        updateWeeksEndpoint.requiredScopes,
        { weeks },
      );

      return updateWeeksEndpoint.response.parse(response);
    },
  };
}
