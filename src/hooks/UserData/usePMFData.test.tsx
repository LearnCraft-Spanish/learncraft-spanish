import { overrideMockPMFSurveyFrequencyAdapter } from '@application/adapters/pmfSurveyFrequencyAdapter.mock';
import { renderHook, waitFor } from '@testing-library/react';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';

import { beforeEach, describe, expect, it } from 'vitest';
import { usePMFData } from './usePMFData';

const NINETY_DAYS_MS = 7776000000;

const sharedCreateUpdateMocks = {
  createPMFSurveyFrequency: async (
    studentId: number,
    hasTakenSurvey: boolean,
  ) => ({
    id: 1,
    relatedStudent: studentId,
    lastContactDate: new Date().toISOString(),
    hasTakenSurvey,
  }),
  updatePMFSurveyFrequency: async ({
    recordId,
    studentId,
    hasTakenSurvey,
  }: {
    recordId: number;
    studentId: number;
    hasTakenSurvey: boolean;
  }) => ({
    id: recordId,
    relatedStudent: studentId,
    lastContactDate: new Date().toISOString(),
    hasTakenSurvey,
  }),
};

/*
The PMF adapter is mocked globally (see tests/setupTests.ts). Each scenario
below overrides getPMFSurveyFrequency to match the former MSW behavior for
that test user’s recordId.
*/
describe('usePMFData', () => {
  describe('when student-lcsp is logged in', () => {
    const lcsp = getAppUserFromEmail('student-lcsp@fake.not')!;

    beforeEach(() => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
          isAuthenticated: true,
          isAdmin: false,
          isCoach: false,
          isStudent: true,
          isLimited: false,
        },
        {
          isOwnUser: true,
        },
      );
      overrideMockPMFSurveyFrequencyAdapter({
        getPMFSurveyFrequency: async (studentId) =>
          studentId === lcsp.recordId
            ? {
                id: 1,
                relatedStudent: studentId,
                lastContactDate: new Date().toISOString(),
                hasTakenSurvey: false,
              }
            : null,
        ...sharedCreateUpdateMocks,
      });
    });
    it('data is successfully fetched', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data?.lastContactDate).toBeDefined();
    });
    it('createOrUpdatePMFData works', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      await result.current.createOrUpdatePMFData({ hasTakenSurvey: true });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data).toBeDefined();
    });
  });
  describe('when student-ser-estar is logged in', () => {
    const serEstar = getAppUserFromEmail('student-ser-estar@fake.not')!;

    beforeEach(() => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-ser-estar@fake.not')!,
          isAuthenticated: true,
          isAdmin: false,
          isCoach: false,
          isStudent: true,
          isLimited: false,
        },
        {
          isOwnUser: true,
        },
      );
      overrideMockPMFSurveyFrequencyAdapter({
        getPMFSurveyFrequency: async (studentId) =>
          studentId === serEstar.recordId
            ? {
                id: 2,
                relatedStudent: studentId,
                lastContactDate: new Date(
                  Date.now() - NINETY_DAYS_MS,
                ).toISOString(),
                hasTakenSurvey: false,
              }
            : null,
        ...sharedCreateUpdateMocks,
      });
    });
    it('data is successfully fetched', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data?.lastContactDate).toBeDefined();
    });
  });
  describe('when any other student is logged in', () => {
    beforeEach(() => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-admin@fake.not')!,
          isAuthenticated: true,
          isAdmin: true,
          isCoach: true,
          isStudent: true,
          isLimited: false,
        },
        {
          isOwnUser: true,
        },
      );
      overrideMockPMFSurveyFrequencyAdapter({
        getPMFSurveyFrequency: async (_studentId) => null,
        ...sharedCreateUpdateMocks,
      });
    });
    it('data is successfully fetched', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data).toBeNull();
    });

    it('createOrUpdatePMFData works', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      await result.current.createOrUpdatePMFData({ hasTakenSurvey: true });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data).toBeDefined();
    });
  });
});
