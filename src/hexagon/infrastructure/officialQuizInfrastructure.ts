import type { AuthPort } from '@application/ports/authPort';
import type {
  ExampleWithVocabulary,
  OfficialQuizRecord,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  addExamplesToOfficialQuizEndpoint,
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
      vocabularyComplete,
    }: {
      courseCode: string;
      quizNumber: number;
      vocabularyComplete?: boolean;
    }) => {
      const params = new URLSearchParams();
      if (vocabularyComplete !== undefined) {
        params.append('vocabularyComplete', String(vocabularyComplete));
      }

      const pathWithParams =
        getOfficialQuizExamplesEndpoint.path
          .replace(':courseCode', courseCode)
          .replace(':quizNumber', quizNumber.toString()) +
        (params.toString() ? `?${params.toString()}` : '');

      const response = await httpClient.get<ExampleWithVocabulary[]>(
        pathWithParams,
        getOfficialQuizExamplesEndpoint.requiredScopes,
      );
      return response;
    },
    addExamplesToOfficialQuiz: async ({
      courseCode,
      quizNumber,
      exampleIds,
    }: {
      courseCode: string;
      quizNumber: number;
      exampleIds: number[];
    }) => {
      const path = addExamplesToOfficialQuizEndpoint.path
        .replace(':courseCode', courseCode)
        .replace(':quizNumber', quizNumber.toString());

      const response = await httpClient.post<number>(
        path,
        addExamplesToOfficialQuizEndpoint.requiredScopes,
        {
          exampleIds,
        },
      );
      return response;
    },
  };
}
