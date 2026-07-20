import { overrideMockPMFSurveyFrequencyAdapter } from '@application/adapters/pmfSurveyFrequencyAdapter.mock';
import { usePMFData } from '@application/useCases/usePMFData';
import { renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const NINETY_DAYS_MS = 7776000000;

describe('usePMFData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('role gating', () => {
    it('canShowPMF is false when user is not a student', async () => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-admin@fake.not')!,
          isAuthenticated: true,
          isAdmin: true,
          isCoach: true,
          isStudent: false,
          isLimited: false,
        },
        {
          isOwnUser: true,
        },
      );
      overrideMockPMFSurveyFrequencyAdapter({
        getPMFSurveyFrequency: async () => null,
      });
      vi.spyOn(Math, 'random').mockReturnValue(1 / 30);

      const { result } = renderHook(() => usePMFData(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.canShowPMF).toBe(false);
    });

    it('canShowPMF is false when viewing another user', async () => {
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
          isOwnUser: false,
        },
      );
      overrideMockPMFSurveyFrequencyAdapter({
        getPMFSurveyFrequency: async () => null,
      });
      vi.spyOn(Math, 'random').mockReturnValue(1 / 30);

      const { result } = renderHook(() => usePMFData(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.canShowPMF).toBe(false);
    });
  });

  describe('when own student is logged in', () => {
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
      });
    });

    it('exposes pmfDataQuery from the query hook', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: TestQueryClientProvider,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data?.lastContactDate).toBeDefined();
    });

    it('canShowPMF is true when contact is old and random roll is 1', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(1 / 30);

      const { result } = renderHook(() => usePMFData(), {
        wrapper: TestQueryClientProvider,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.canShowPMF).toBe(true);
    });

    it('canShowPMF is false when random roll is not 1', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);

      const { result } = renderHook(() => usePMFData(), {
        wrapper: TestQueryClientProvider,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.canShowPMF).toBe(false);
    });
  });
});
