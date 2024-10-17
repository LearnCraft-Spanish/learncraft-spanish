import { useCallback } from "react";
import type * as types from "../interfaceDefinitions";
import useAuth from "./useAuth";

export function useBackend() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { getAccessToken } = useAuth();

  const getFactory = useCallback(
    async <T>(path: string, headers?: any): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: "GET",
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
    [getAccessToken, backendUrl]
  );

  /*      GET Requests      */

  const getProgramsFromBackend = useCallback((): Promise<
    types.ProgramUnparsed[]
  > => {
    return getFactory<types.ProgramUnparsed[]>("public/programs");
  }, [getFactory]);

  const getLessonsFromBackend = useCallback((): Promise<types.Lesson[]> => {
    return getFactory<types.Lesson[]>("public/lessons");
  }, [getFactory]);

  const getVocabFromBackend = useCallback((): Promise<types.Vocabulary[]> => {
    return getFactory<types.Vocabulary[]>("public/vocabulary");
  }, [getFactory]);

  const getSpellingsFromBackend = useCallback((): Promise<types.Spelling[]> => {
    return getFactory<types.Spelling[]>("public/spellings");
  }, [getFactory]);

  // UNUSED -- CONSIDER DELETING
  const getExamplesFromBackend = useCallback((): Promise<types.Flashcard[]> => {
    return getFactory<types.Flashcard[]>("public/examples");
  }, [getFactory]);

  const getVerifiedExamplesFromBackend = useCallback((): Promise<
    types.Flashcard[]
  > => {
    return getFactory<types.Flashcard[]>("public/verified-examples");
  }, [getFactory]);

  const getAudioExamplesFromBackend = useCallback((): Promise<
    types.Flashcard[]
  > => {
    return getFactory<types.Flashcard[]>("public/audio-examples");
  }, [getFactory]);

  const getLcspQuizzesFromBackend = useCallback((): Promise<types.Quiz[]> => {
    return getFactory<types.Quiz[]>("public/quizzes");
  }, [getFactory]);

  const getMyExamplesFromBackend =
    useCallback((): Promise<types.StudentFlashcardData> => {
      return getFactory<types.StudentFlashcardData>("my-examples");
    }, [getFactory]);

  const getQuizExamplesFromBackend = useCallback(
    (quizId: number): Promise<types.Flashcard[]> => {
      return getFactory<types.Flashcard[]>(`public/quizExamples/${quizId}`);
    },
    [getFactory]
  );

  const getAllUsersFromBackend = useCallback((): Promise<types.UserData[]> => {
    return getFactory<types.UserData[]>("all-students");
  }, [getFactory]);

  const getUserDataFromBackend = useCallback((): Promise<types.UserData> => {
    return getFactory<types.UserData>("my-data");
  }, [getFactory]);

  const getActiveExamplesFromBackend = useCallback(
    (studentId: number): Promise<types.StudentFlashcardData> => {
      return getFactory<types.StudentFlashcardData>(`${studentId}/examples`);
    },
    [getFactory]
  );

  /*      Coaching API      */

  const getCoachList = useCallback((): Promise<types.Coach[]> => {
    return getFactory<types.Coach[]>("coaching/coaches");
  }, [getFactory]);

  const getCourseList = useCallback((): Promise<string[]> => {
    return getFactory<string[]>("coaching/courses");
  }, [getFactory]);

  const getLessonList = useCallback((): Promise<string[]> => {
    return getFactory<string[]>("coaching/lessons");
  }, [getFactory]);

  const getActiveStudents = useCallback((): Promise<string[]> => {
    return getFactory<string[]>("coaching/active-students");
  }, [getFactory]);

  const getActiveMemberships = useCallback((): Promise<string[]> => {
    return getFactory<string[]>("coaching/active-memberships");
  }, [getFactory]);

  const getLastThreeWeeks = useCallback((): Promise<string[]> => {
    return getFactory<string[]>("coaching/last-three-weeks");
  }, [getFactory]);

  /*      POST Requests      */

  const postFactory = useCallback(
    async <T>(path: string, headers?: any): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
          "Content-Type": "application/json",
          ...headers,
        },
      });
      if (response.ok) {
        return response.json().catch((error) => {
          console.error(`Error parsing JSON from ${path}:`, error);
          throw new Error(`Failed to parse JSON from ${path}`);
        });
      } else {
        console.error(`Failed to post to ${path}: ${response.statusText}`);
        throw new Error(`Failed to post to ${path}`);
      }
    },
    [getAccessToken, backendUrl]
  );

  const createMyStudentExample = useCallback(
    (exampleId: number): Promise<number> => {
      return postFactory<number>("create-my-student-example", {
        exampleid: exampleId,
      });
    },
    [postFactory]
  );

  const createStudentExample = useCallback(
    (studentId: number, exampleId: number): Promise<number> => {
      return postFactory<number>("create-student-example", {
        studentid: studentId,
        exampleid: exampleId,
      });
    },
    [postFactory]
  );

  const updateMyStudentExample = useCallback(
    (updateId: number, newInterval: number): Promise<number> => {
      return postFactory<number>("update-my-student-example", {
        updateid: updateId,
        newinterval: newInterval,
      });
    },
    [postFactory]
  );

  const updateStudentExample = useCallback(
    (updateId: number, newInterval: number): Promise<number> => {
      return postFactory<number>("update-student-example", {
        updateid: updateId,
        newinterval: newInterval,
      });
    },
    [postFactory]
  );

  /*      DELETE Requests      */

  const deleteFactory = useCallback(
    async (path: string, headers?: any): Promise<number> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: "DELETE",
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
    [getAccessToken, backendUrl]
  );

  const deleteMyStudentExample = useCallback(
    (recordId: number): Promise<number> => {
      return deleteFactory("delete-my-student-example", { deleteid: recordId });
    },
    [deleteFactory]
  );

  const deleteStudentExample = useCallback(
    (recordId: number): Promise<number> => {
      return deleteFactory("delete-student-example", { deleteid: recordId });
    },
    [deleteFactory]
  );

  return {
    getAccessToken,
    getProgramsFromBackend,
    getLessonsFromBackend,
    getVocabFromBackend,
    getSpellingsFromBackend,
    getExamplesFromBackend,
    getVerifiedExamplesFromBackend,
    getAudioExamplesFromBackend,
    getLcspQuizzesFromBackend,
    getMyExamplesFromBackend,
    getQuizExamplesFromBackend,
    getAllUsersFromBackend,
    getUserDataFromBackend,
    getActiveExamplesFromBackend,
    getCoachList,
    getCourseList,
    getLessonList,
    getActiveStudents,
    getActiveMemberships,
    getLastThreeWeeks,
    createMyStudentExample,
    createStudentExample,
    updateMyStudentExample,
    updateStudentExample,
    deleteMyStudentExample,
    deleteStudentExample,
  };
}
