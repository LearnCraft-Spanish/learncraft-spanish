import { renderHook, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { overrideMockAuthAdapter } from 'src/hexagon/application/adapters/authAdapter.mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { usePMFData } from './usePMFData';

/*
********* NOTE *********
The mock api is set up to serve specific data based on what student is logged in.
For testing, these are the avalible students and their api responses:
student-lcsp: getPMFData: <todaysDate>, createPMFData: 1, updatePMFData: 1
student-ser-estar: getPMFData: <90 days ago>, createPMFData: 1, updatePMFData: 1
all other Students: getPMFData: '', createPMFData: 1, updatePMFData: 1
*/
describe('usePMFData', () => {
  describe('when student-lcsp is logged in', () => {
    beforeEach(() => {
      overrideMockAuthAdapter({
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isStudent: true,
        isLimited: false,
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
    beforeEach(() => {
      overrideMockAuthAdapter({
        authUser: getAuthUserFromEmail('student-ser-estar@fake.not')!,
        isAuthenticated: true,
        isAdmin: false,
        isCoach: false,
        isStudent: true,
        isLimited: false,
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
      overrideMockAuthAdapter({
        authUser: getAuthUserFromEmail('student-admin@fake.not')!,
        isAuthenticated: true,
        isAdmin: true,
        isCoach: true,
        isStudent: true,
        isLimited: false,
      });
    });
    it('data is successfully fetched', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data).toBe('');
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
