import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import MockQueryClientProvider from '../../mocks/Providers/MockQueryClient';
import { setupMockAuth } from '../../tests/setupMockAuth';
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
      setupMockAuth({ userName: 'student-lcsp' });
    });
    it('data is successfully fetched', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data?.lastContactDate).toBeDefined();
    });
    it('createOrUpdatePMFData works', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockQueryClientProvider,
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
      setupMockAuth({ userName: 'student-ser-estar' });
    });
    it('data is successfully fetched', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data?.lastContactDate).toBeDefined();
    });
  });
  describe('when any other student is logged in', () => {
    beforeEach(() => {
      setupMockAuth({ userName: 'student-admin' });
    });
    it('data is successfully fetched', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() =>
        expect(result.current.pmfDataQuery.isSuccess).toBe(true),
      );
      expect(result.current.pmfDataQuery.data).toBe('');
    });

    it('createOrUpdatePMFData works', async () => {
      const { result } = renderHook(() => usePMFData(), {
        wrapper: MockQueryClientProvider,
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
