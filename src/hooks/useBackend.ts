import { useCallback } from 'react';
import type * as types from 'src/types/interfaceDefinitions';
import type * as StudentRecordsTypes from 'src/types/CoachingTypes';
import useAuth from './useAuth';

export function useBackend() {
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
          console.error(`Error parsing JSON from ${path}:`, error);
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
      }
    },
    [getAccessToken, backendUrl],
  );

  /*      GET Requests      */

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

  const getAllUsersFromBackend = useCallback((): Promise<types.UserData[]> => {
    return getFactory<types.UserData[]>('all-students');
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
    return getFactory('coaching/lessons');
  }, [getFactory]);

  const getActiveStudents = useCallback((): Promise<
    StudentRecordsTypes.Student[]
  > => {
    return getFactory('coaching/active-students');
  }, [getFactory]);

  const getActiveMemberships = useCallback((): Promise<
    StudentRecordsTypes.Membership[]
  > => {
    return getFactory('coaching/active-memberships');
  }, [getFactory]);

  const getLastThreeWeeks =
    useCallback((): Promise<StudentRecordsTypes.getLastThreeWeeksResponse> => {
      return getFactory('coaching/last-three-weeks');
    }, [getFactory]);

  const getNewWeeks = useCallback((): Promise<StudentRecordsTypes.Week[]> => {
    return getFactory('coaching/weeks-new-format');
  }, [getFactory]);

  const getGroupAttendees = useCallback((): Promise<
    StudentRecordsTypes.GroupAttendees[]
  > => {
    return getFactory('coaching/group-attendees');
  }, [getFactory]);

  const getGroupSessions = useCallback((): Promise<
    StudentRecordsTypes.GroupSession[]
  > => {
    return getFactory('coaching/group-sessions');
  }, [getFactory]);

  const getAssignments = useCallback((): Promise<
    StudentRecordsTypes.Assignment[]
  > => {
    return getFactory('coaching/assignments');
  }, [getFactory]);

  const getCalls = useCallback((): Promise<StudentRecordsTypes.Call[]> => {
    return getFactory('coaching/calls');
  }, [getFactory]);
  /*      POST Requests      */

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
          console.error(`Error parsing JSON from ${path}:`, error);
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        console.log('debugging this error, full response:', response);
        console.error(`Failed to post to ${path}: ${response.statusText}`);
        throw new Error(`Failed to post to ${path}`);
      }
    },
    [getAccessToken, backendUrl],
  );

  const createMyStudentExample = useCallback(
    (exampleId: number): Promise<number> => {
      return postFactory<number>('create-my-student-example', {
        exampleid: exampleId,
      });
    },
    [postFactory],
  );

  const createStudentExample = useCallback(
    (studentId: number, exampleId: number): Promise<number> => {
      return postFactory<number>('create-student-example', {
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

  /*      DELETE Requests      */

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
          console.error(`Error parsing JSON from ${path}:`, error);
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        console.error(`Failed to delete ${path}: ${response.statusText}`);
        throw new Error(`Failed to delete ${path}`);
      }
    },
    [getAccessToken, backendUrl],
  );

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
          console.error(`Error parsing JSON from ${path}:`, error);
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        console.error(`Failed to delete ${path}: ${response.statusText}`);
        throw new Error(`Failed to delete ${path}`);
      }
    },
    [getAccessToken, backendUrl],
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
          console.error(`Error parsing JSON from ${path}:`, error);
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        console.error(`Failed to post to ${path}: ${response.statusText}`);
        throw new Error(`Failed to post to ${path}`);
      }
    },
    [getAccessToken, backendUrl],
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

  return {
    // GET Requests
    getAccessToken,
    getActiveExamplesFromBackend,
    getActiveMemberships,
    getActiveStudents,
    getAllUsersFromBackend,
    getAssignments,
    getAudioExamplesFromBackend,
    getCalls,
    getCoachList,
    getCourseList,
    getExamplesFromBackend,
    getGroupAttendees,
    getGroupSessions,
    getLastThreeWeeks,
    getLcspQuizzesFromBackend,
    getLessonList,
    getLessonsFromBackend,
    getMyExamplesFromBackend,
    getNewWeeks,
    getPMFDataForUser,
    getProgramsFromBackend,
    getQuizExamplesFromBackend,
    getSingleExample,
    getSpellingsFromBackend,
    getUnverifiedExamplesFromBackend,
    getRecentlyEditedExamples,
    getUserDataFromBackend,
    getVerifiedExamplesFromBackend,
    getVocabFromBackend,

    // POST Requests
    addVocabularyToExample,
    createMyStudentExample,
    createPMFDataForUser,
    createStudentExample,
    createUnverifiedExample,
    updateExample,
    updateMyStudentExample,
    updatePMFDataForUser,
    updateStudentExample,

    // DELETE Requests
    deleteMyStudentExample,
    deleteStudentExample,
    removeVocabFromExample,
  };
}
