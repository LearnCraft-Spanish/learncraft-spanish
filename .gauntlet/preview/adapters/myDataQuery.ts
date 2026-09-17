import type { UseMyDataReturn } from '@application/queries/useMyData';
import type { AppUser } from '@learncraft-spanish/shared';

function forceV1(): boolean {
  const raw = new URLSearchParams(window.location.search).get('flags');
  return raw === 'off' || raw === '0' || raw === 'false';
}

const previewStudent: AppUser = {
  name: 'Gauntlet Student',
  emailAddress: 'gauntlet-student@fake.not',
  recordId: 1,
  courseId: 2,
  lessonNumber: 1,
  studentRole: 'student',
  betaTester: true,
};

/**
 * Auth0-free / network-free `useMyData` for gauntlet preview.
 * Defaults to a beta-tester student (v2). `?flags=off` forces v1.
 */
export function useMyData(): UseMyDataReturn {
  const isV1 = forceV1();
  const myData: AppUser = {
    ...previewStudent,
    betaTester: !isV1,
  };

  return {
    myData,
    isBetaTester: myData.betaTester,
    isLoading: false,
    error: null,
  };
}

export default useMyData;
