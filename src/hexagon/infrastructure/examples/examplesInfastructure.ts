import type { ExampleRecord } from '@LearnCraft-Spanish/shared';
import type { ExamplesPort } from 'src/hexagon/application/ports/examplePort';
import type { AuthPort } from '../../application/ports/authPort';
import examplesEndpoints from 'src/hexagon/domain/examples';
import { createAuthenticatedHttpClient } from '../http/client';

export function createExamplesInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): ExamplesPort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getExamplesByFilters: async (data: exam) => {
      // make tags params
      let tagParams = '';
      data.tags.forEach((tag) => {
        if (tagParams.length > 0) {
          tagParams = `${tagParams};${tag}`;
        } else {
          tagParams = tag;
        }
      });

      const response = await httpClient.get<ExampleRecord[]>(
        examplesEndpoints.getExamplesByFilters.path,
        {
          params: {
            tags: tagParams,
            course: data.course,
            toLesson: data.toLesson,
            fromLesson: data.fromLesson,
          },
        },
      );
      return response;
    },
  };
}
