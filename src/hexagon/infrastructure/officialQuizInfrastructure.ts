import type { AuthPort } from '@application/ports/authPort';
import type {
  ExampleWithVocabulary,
  OfficialQuizRecord,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  getOfficialQuizExamplesEndpoint,
  listOfficialQuizzesEndpoint,
} from '@learncraft-spanish/shared';
export function createOfficialQuizInfrastructure(
  apiUrl: string,
  auth: AuthPort,
) {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getOfficialQuizRecords: async () => {
      const response = await httpClient.get<OfficialQuizRecord[]>(
        listOfficialQuizzesEndpoint.path,
        listOfficialQuizzesEndpoint.requiredScopes,
      );
      return response;
    },
    getOfficialQuizExamples: async ({
      courseCode,
      quizNumber,
    }: {
      courseCode: string;
      quizNumber: number;
    }) => {
      const response = await httpClient.get<ExampleWithVocabulary[]>(
        getOfficialQuizExamplesEndpoint.path
          .replace(':courseCode', courseCode)
          .replace(':quizNumber', quizNumber.toString()),
        getOfficialQuizExamplesEndpoint.requiredScopes,
      );
      return response;
    },
  };
}
