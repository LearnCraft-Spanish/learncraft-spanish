import type { QueryFunctionContext } from '@tanstack/react-query';
import type * as StudentRecordsTypes from 'src/types/CoachingTypes';
import type * as types from 'src/types/interfaceDefinitions';
import { useCallback } from 'react';
import useAuth from './useAuth';

export function useBackendHelpers() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { getAccessToken } = useAuth();

  const getFactory = useCallback(
    async <T>(path: string, headers?: any): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
          ...headers,
        },
      });
      if (response.ok) {
        return await response.json().catch((error) => {
          console.error(
            `Error parsing JSON response from "${path}" Error:`,
            error,
          );
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
      }
    },
    [getAccessToken, backendUrl],
  );

  const postFactory = useCallback(
    async <T>(path: string, headers?: any): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      if (response.ok) {
        return await response.json().catch((error) => {
          console.error(
            `Error parsing JSON response from "${path}" Error:`,
            error,
          );
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        console.error(`Failed to post to ${path}: ${response.statusText}`);
        throw new Error(`Failed to post to ${path}`);
      }
    },
    [getAccessToken, backendUrl],
  );

  const deleteFactory = useCallback(
    async (path: string, headers?: any): Promise<number> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
          ...headers,
        },
      });

      if (response.ok) {
        return await response.json().catch((error) => {
          console.error(
            `Error parsing JSON response from "${path}" Error:`,
            error,
          );
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        console.error(`Failed to delete ${path}: ${response.statusText}`);
        throw new Error(`Failed to delete ${path}`);
      }
    },
    [getAccessToken, backendUrl],
  );

  interface DeleteFactoryOptions {
    path: string;
    headers?: Record<string, any>;
    body?: Record<string, any>;
  }
  const newDeleteFactory = useCallback(
    async <T>({
      path,
      headers = [],
      body = [],
    }: DeleteFactoryOptions): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        return await response.json().catch((error) => {
          console.error(
            `Error parsing JSON response from "${path}" Error:`,
            error,
          );
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        console.error(`Failed to delete ${path}: ${response.statusText}`);
        throw new Error(`Failed to delete ${path}`);
      }
    },
    [getAccessToken, backendUrl],
  );

  // We are going to want to update THIS FILE to send data via body of requests instead of headers
  // (see current post factory)
  // I have created an updated post factory just for these new routes so that this merge only concerns itself
  // with the PMFData changes
  interface PostFactoryOptions {
    path: string;
    headers?: Record<string, any>;
    body?: Record<string, any>;
  }
  const newPostFactory = useCallback(
    async <T>({
      path,
      headers = [],
      body = [],
    }: PostFactoryOptions): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        return await response.json().catch((error) => {
          console.error(
            `Error parsing JSON response from "${path}" Error:`,
            error,
          );
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        console.error(`Failed to post to ${path}: ${response.statusText}`);
        throw new Error(`Failed to post to ${path}`);
      }
    },
    [getAccessToken, backendUrl],
  );

  const newPutFactory = useCallback(
    async <T>({
      path,
      headers = [],
      body = [],
    }: PostFactoryOptions): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        return await response.json().catch((error) => {
          console.error(
            `Error parsing JSON response from "${path}" Error:`,
            error,
          );
          throw new Error(`Failed to parse JSON response from ${path}`);
        });
      } else {
        console.error(`Failed to put to ${path}: ${response.statusText}`);
        throw new Error(`Failed to put to ${path}`);
      }
    },
    [getAccessToken, backendUrl],
  );

  return {
    getFactory,
    postFactory,
    deleteFactory,

    newDeleteFactory,
    newPostFactory,
    newPutFactory,
  };
}

export function useBackend() {
  const {
    getFactory,
    postFactory,
    deleteFactory,
    newDeleteFactory,
    newPostFactory,
    newPutFactory,
  } = useBackendHelpers();

  /*      GET Requests      */
  const { getAccessToken } = useAuth();

  const getProgramsFromBackend = useCallback((): Promise<
    types.ProgramUnparsed[]
  > => {
    return getFactory<types.ProgramUnparsed[]>('public/programs');
  }, [getFactory]);

  const getLessonsFromBackend = useCallback((): Promise<types.Lesson[]> => {
    return getFactory<types.Lesson[]>('public/lessons');
  }, [getFactory]);

  const getVocabFromBackend = useCallback((): Promise<types.Vocabulary[]> => {
    return getFactory<types.Vocabulary[]>('public/vocabulary');
  }, [getFactory]);

  const getVerbsFromBackend = useCallback((): Promise<types.Verb[]> => {
    return getFactory<types.Verb[]>('admin/verbs');
  }, [getFactory]);

  const getSubcategoriesFromBackend = useCallback((): Promise<
    types.Subcategory[]
  > => {
    return getFactory<types.Subcategory[]>('admin/subcategories');
  }, [getFactory]);

  const getSpellingsFromBackend = useCallback((): Promise<types.Spelling[]> => {
    return getFactory<types.Spelling[]>('public/spellings');
  }, [getFactory]);

  // UNUSED -- CONSIDER DELETING
  const getExamplesFromBackend = useCallback((): Promise<types.Flashcard[]> => {
    return getFactory<types.Flashcard[]>('public/examples');
  }, [getFactory]);

  const getVerifiedExamplesFromBackend = useCallback((): Promise<
    types.Flashcard[]
  > => {
    return getFactory<types.Flashcard[]>('public/verified-examples');
  }, [getFactory]);

  const getAudioExamplesFromBackend = useCallback((): Promise<
    types.Flashcard[]
  > => {
    return getFactory<types.Flashcard[]>('public/audio-examples');
  }, [getFactory]);

  const getLcspQuizzesFromBackend = useCallback((): Promise<types.Quiz[]> => {
    return getFactory<types.Quiz[]>('public/quizzes');
  }, [getFactory]);

  const getMyExamplesFromBackend =
    useCallback((): Promise<types.StudentFlashcardData> => {
      return getFactory<types.StudentFlashcardData>('my-examples');
    }, [getFactory]);

  const getQuizExamplesFromBackend = useCallback(
    (quizId: number): Promise<types.Flashcard[]> => {
      return getFactory<types.Flashcard[]>(`public/quizExamples/${quizId}`);
    },
    [getFactory],
  );

  const getAllUsersFromBackend = useCallback((): Promise<
    types.FlashcardStudent[]
  > => {
    return getFactory<types.FlashcardStudent[]>('all-students');
  }, [getFactory]);

  const getUserDataFromBackend = useCallback((): Promise<types.UserData> => {
    return getFactory<types.UserData>('my-data');
  }, [getFactory]);

  const getActiveExamplesFromBackend = useCallback(
    (studentId: number): Promise<types.StudentFlashcardData> => {
      return getFactory<types.StudentFlashcardData>(`${studentId}/examples`);
    },
    [getFactory],
  );

  const getUnverifiedExamplesFromBackend = useCallback((): Promise<
    types.Flashcard[]
  > => {
    return getFactory<types.Flashcard[]>('unverified-examples');
  }, [getFactory]);

  const getRecentlyEditedExamples = useCallback((): Promise<
    types.Flashcard[]
  > => {
    return getFactory<types.Flashcard[]>('recently-edited-examples');
  }, [getFactory]);

  const getSingleExample = useCallback(
    (exampleId: number): Promise<types.Flashcard> => {
      return getFactory<types.Flashcard>(`single-example/${exampleId}`);
    },
    [getFactory],
  );

  /*      Coaching API      */

  const getCoachList = useCallback((): Promise<StudentRecordsTypes.Coach[]> => {
    return getFactory<StudentRecordsTypes.Coach[]>('coaching/coaches');
  }, [getFactory]);

  const getCourseList = useCallback((): Promise<
    StudentRecordsTypes.Course[]
  > => {
    return getFactory('coaching/courses');
  }, [getFactory]);

  const getLessonList = useCallback((): Promise<
    StudentRecordsTypes.Lesson[]
  > => {
    return getFactory<StudentRecordsTypes.Lesson[]>('coaching/lessons').then(
      (lessons) => {
        // sort lessons by lessonName
        const sortedLessons = lessons.sort((a, b) =>
          a.lessonName.localeCompare(b.lessonName),
        );
        return sortedLessons;
      },
    );
  }, [getFactory]);

  const getActiveStudents = useCallback(
    ({
      queryKey,
    }: QueryFunctionContext<
      [string, { startDate: string | undefined; endDate: string | undefined }]
    >): Promise<StudentRecordsTypes.Student[]> => {
      const [, { startDate, endDate }] = queryKey;

      if (!startDate || !endDate) {
        return Promise.resolve([]);
      }
      return getFactory(`coaching/active-students/${startDate}.${endDate}`);
    },
    [getFactory],
  );

  const getActiveMemberships = useCallback(
    ({
      queryKey,
    }: QueryFunctionContext<
      [string, { startDate: string | undefined; endDate: string | undefined }]
    >): Promise<StudentRecordsTypes.Membership[]> => {
      const [, { startDate, endDate }] = queryKey;

      if (!startDate || !endDate) {
        return Promise.resolve([]);
      }
      return getFactory(`coaching/active-memberships/${startDate}.${endDate}`);
    },
    [getFactory],
  );

  // const getMemberships = useCallback((): Promise<
  //   StudentRecordsTypes.Membership[]
  // > => {
  //   return getFactory('coaching/memberships');
  // }, [getFactory]);

  // const getWeeks = useCallback((): Promise<StudentRecordsTypes.Week[]> => {
  //   return getFactory('coaching/weeks');
  // }, [getFactory]);

  // const getGroupAttendees = useCallback((): Promise<
  //   StudentRecordsTypes.GroupAttendees[]
  // > => {
  //   return getFactory('coaching/group-attendees');
  // }, [getFactory]);

  // const getGroupSessions = useCallback((): Promise<
  //   StudentRecordsTypes.GroupSession[]
  // > => {
  //   return getFactory('coaching/group-sessions');
  // }, [getFactory]);

  // const getAssignments = useCallback((): Promise<
  //   StudentRecordsTypes.Assignment[]
  // > => {
  //   return getFactory('coaching/assignments');
  // }, [getFactory]);

  // const getPrivateCalls = useCallback((): Promise<
  //   StudentRecordsTypes.Call[]
  // > => {
  //   return getFactory('coaching/private-calls');
  // }, [getFactory]);
  /*      POST Requests      */

  const createMyStudentExample = useCallback(
    (exampleId: number): Promise<number[]> => {
      return postFactory<number[]>('create-my-student-example', {
        exampleid: exampleId,
      });
    },
    [postFactory],
  );

  const createStudentExample = useCallback(
    (studentId: number, exampleId: number): Promise<number[]> => {
      return postFactory<number[]>('create-student-example', {
        studentid: studentId,
        exampleid: exampleId,
      });
    },
    [postFactory],
  );

  const updateMyStudentExample = useCallback(
    (updateId: number, newInterval: number): Promise<number> => {
      return postFactory<number>('update-my-student-example', {
        updateid: updateId,
        newinterval: newInterval,
      });
    },
    [postFactory],
  );

  const updateStudentExample = useCallback(
    (updateId: number, newInterval: number): Promise<number> => {
      return postFactory<number>('update-student-example', {
        updateid: updateId,
        newinterval: newInterval,
      });
    },
    [postFactory],
  );

  // Complex queryies have to be sent as POST since GET doesn't allow body
  const getExampleSetBySpanishText = useCallback(
    (spanishText: string[]): Promise<types.Flashcard[]> => {
      return newPostFactory<types.Flashcard[]>({
        path: 'example-set/by-spanish-text',
        headers: [],
        body: {
          spanishtext: spanishText,
        },
      });
    },
    [newPostFactory],
  );

  /*      DELETE Requests      */

  const deleteMyStudentExample = useCallback(
    (recordId: number): Promise<number> => {
      return deleteFactory('delete-my-student-example', { deleteid: recordId });
    },
    [deleteFactory],
  );

  const deleteStudentExample = useCallback(
    (recordId: number): Promise<number> => {
      return deleteFactory('delete-student-example', { deleteid: recordId });
    },
    [deleteFactory],
  );

  const removeVocabFromExample = useCallback(
    (exampleId: number, vocabIdList: number[]): Promise<number> => {
      return newDeleteFactory({
        path: 'remove-vocab-from-example',
        body: { exampleId, vocabIdList },
      });
    },
    [newDeleteFactory],
  );

  const getPMFDataForUser = useCallback(
    (userId: number): Promise<types.PMFData> => {
      return getFactory(`pmf/${userId}`);
    },
    [getFactory],
  );

  const createPMFDataForUser = useCallback(
    (studentId: number, hasTakenSurvey: boolean): Promise<number> => {
      return newPostFactory({
        path: 'pmf/create',
        body: { studentId, hasTakenSurvey },
      });
    },
    [newPostFactory],
  );
  const updatePMFDataForUser = useCallback(
    ({
      studentId,
      recordId,
      hasTakenSurvey,
    }: {
      studentId: number;
      recordId: number;
      hasTakenSurvey: boolean;
    }): Promise<number> => {
      return newPostFactory({
        path: 'pmf/update',
        body: {
          studentId,
          recordId,
          hasTakenSurvey,
        },
      });
    },
    [newPostFactory],
  );

  const createUnverifiedExample = useCallback(
    (example: types.NewFlashcard): Promise<number> => {
      return newPostFactory<number>({
        path: 'add-unverified-example',
        body: {
          example,
        },
      });
    },
    [newPostFactory],
  );

  const createMultipleUnverifiedExamples = useCallback(
    (examples: types.NewFlashcard[]): Promise<number[]> => {
      return newPostFactory<number[]>({
        path: 'add-multiple-unverified-examples',
        body: {
          examples,
        },
      });
    },
    [newPostFactory],
  );

  const updateExample = useCallback(
    (example: Partial<types.Flashcard>): Promise<number> => {
      return newPostFactory<number>({
        path: 'update-example',
        body: {
          example,
        },
      });
    },
    [newPostFactory],
  );

  const addVocabularyToExample = useCallback(
    (exampleId: number, vocabIdList: number[]): Promise<number> => {
      return newPostFactory<number>({
        path: 'add-vocab-to-example',
        body: {
          exampleId,
          vocabIdList,
        },
      });
    },
    [newPostFactory],
  );

  const createMultipleStudentExamples = useCallback(
    (studentId: number, exampleIdList: number[]): Promise<number[]> => {
      return newPostFactory<number[]>({
        path: 'create-multiple-student-examples',
        body: { studentId, exampleIdList },
      });
    },
    [newPostFactory],
  );

  const createMultipleQuizExamples = useCallback(
    (quizId: number, exampleIdList: number[]): Promise<number[]> => {
      return newPostFactory<number[]>({
        path: 'create-multiple-quiz-examples',
        body: { quizId, exampleIdList },
      });
    },
    [newPostFactory],
  );

  const createVocabulary = useCallback(
    (vocabulary: Omit<types.Vocabulary, 'recordId'>): Promise<number> => {
      return newPostFactory({
        path: 'admin/vocabulary',
        body: vocabulary,
      });
    },
    [newPostFactory],
  );

  const updateVocabulary = useCallback(
    (vocabulary: types.Vocabulary): Promise<number> => {
      return newPostFactory({
        path: `admin/vocabulary/${vocabulary.recordId}`,
        body: vocabulary,
      });
    },
    [newPostFactory],
  );

  const deleteVocabulary = useCallback(
    (recordId: number): Promise<number> => {
      return newDeleteFactory({
        path: `admin/vocabulary/${recordId}`,
      });
    },
    [newDeleteFactory],
  );

  const createSpelling = useCallback(
    (spelling: Omit<types.Spelling, 'recordId'>): Promise<number> => {
      return newPostFactory({
        path: 'admin/spellings',
        body: spelling,
      });
    },
    [newPostFactory],
  );

  const deleteSpelling = useCallback(
    (spelling: types.Spelling): Promise<number> => {
      return newDeleteFactory({
        path: 'admin/spellings',
        body: spelling,
      });
    },
    [newDeleteFactory],
  );

  const createSubcategory = useCallback(
    (
      subcategory: Omit<types.Subcategory, 'recordId'>,
    ): Promise<types.Subcategory> => {
      return newPostFactory({
        path: 'admin/subcategories',
        body: subcategory,
      });
    },
    [newPostFactory],
  );

  const updateSubcategory = useCallback(
    (subcategory: types.Subcategory): Promise<types.Subcategory> => {
      return newPutFactory({
        path: `admin/subcategories/${subcategory.recordId}`,
        body: subcategory,
      });
    },
    [newPutFactory],
  );

  const deleteSubcategory = useCallback(
    (recordId: number): Promise<number> => {
      return newDeleteFactory({
        path: `admin/subcategories/${recordId}`,
      });
    },
    [newDeleteFactory],
  );

  const createVerb = useCallback(
    (verb: Omit<types.Verb, 'recordId'>): Promise<types.Verb> => {
      return newPostFactory({
        path: 'admin/verbs',
        body: verb,
      });
    },
    [newPostFactory],
  );

  const updateVerb = useCallback(
    (verb: types.Verb): Promise<types.Verb> => {
      return newPutFactory({
        path: `admin/verbs/${verb.recordId}`,
        body: verb,
      });
    },
    [newPutFactory],
  );

  const deleteVerb = useCallback(
    (recordId: number): Promise<number> => {
      return newDeleteFactory({
        path: `admin/verbs/${recordId}`,
      });
    },
    [newDeleteFactory],
  );

  return {
    getAccessToken,
    // GET Requests
    getActiveExamplesFromBackend,
    getActiveMemberships,
    getActiveStudents,
    getAllUsersFromBackend,
    getAudioExamplesFromBackend,
    getCoachList,
    getCourseList,
    getExamplesFromBackend,

    getLcspQuizzesFromBackend,
    getLessonList,
    getLessonsFromBackend,
    getMyExamplesFromBackend,

    getPMFDataForUser,
    getProgramsFromBackend,
    getQuizExamplesFromBackend,
    getSingleExample,
    getExampleSetBySpanishText,
    getSpellingsFromBackend,
    getUnverifiedExamplesFromBackend,
    getRecentlyEditedExamples,
    getUserDataFromBackend,
    getVerifiedExamplesFromBackend,
    getVocabFromBackend,
    getVerbsFromBackend,
    getSubcategoriesFromBackend,

    // POST Requests
    addVocabularyToExample,
    createMyStudentExample,
    createPMFDataForUser,
    createSpelling,
    createStudentExample,
    createUnverifiedExample,
    createMultipleUnverifiedExamples,
    createMultipleStudentExamples,
    createMultipleQuizExamples,
    createVocabulary,
    updateExample,
    updateMyStudentExample,
    updatePMFDataForUser,
    updateStudentExample,
    updateVocabulary,

    // DELETE Requests
    deleteMyStudentExample,
    deleteSpelling,
    deleteStudentExample,
    deleteVocabulary,
    removeVocabFromExample,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    createVerb,
    updateVerb,
    deleteVerb,
  };
}
