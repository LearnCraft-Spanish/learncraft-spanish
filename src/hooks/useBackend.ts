// used in some contexts, possibly consider using inside hexagon implementation
import type { QueryFunctionContext } from '@tanstack/react-query';
import type * as StudentRecordsTypes from 'src/types/CoachingTypes';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useCallback } from 'react';

export function useBackendHelpers() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { getAccessToken } = useAuthAdapter();

  const getFactory = useCallback(
    async <T>(path: string, headers?: any): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await getAccessToken(null)}`,
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
          Authorization: `Bearer ${await getAccessToken(null)}`,
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
          Authorization: `Bearer ${await getAccessToken(null)}`,
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
      body = {},
    }: DeleteFactoryOptions): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await getAccessToken(null)}`,
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

  interface PostFactoryOptions {
    path: string;
    headers?: Record<string, any>;
    body?: Record<string, any>;
  }
  const newPostFactory = useCallback(
    async <T>({
      path,
      headers = [],
      body = {},
    }: PostFactoryOptions): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getAccessToken(null)}`,
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
      body = {},
    }: PostFactoryOptions): Promise<T> => {
      const fetchUrl = `${backendUrl}${path}`;
      const response = await fetch(fetchUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${await getAccessToken(null)}`,
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
  const { getFactory } = useBackendHelpers();

  /*      GET Requests      */
  const { getAccessToken } = useAuthAdapter();

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

  return {
    getAccessToken,
    // GET Requests
    getActiveMemberships,
    getActiveStudents,
    getCoachList,
    getCourseList,

    getLessonList,
  };
}
