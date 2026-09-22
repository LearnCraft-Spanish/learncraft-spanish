import {
  mockUseMyData,
  overrideMockUseMyData,
  resetMockUseMyData,
} from '@application/queries/useMyData.mock';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { renderHook } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/useMyData', () => ({
  useMyData: () => mockUseMyData,
}));

describe('useStudentUiVersion', () => {
  afterEach(() => {
    resetMockUseMyData();
  });

  it('returns v1 when the logged-in user is not a beta-tester student', () => {
    overrideMockUseMyData({
      myData: createMockAppUser({
        studentRole: 'student',
        betaTester: false,
      }),
      isLoading: false,
    });

    const { result } = renderHook(() => useStudentUiVersion());

    expect(result.current.version).toBe('v1');
    expect(result.current.isLoading).toBe(false);
  });

  it('returns v2 when the logged-in user is a beta-tester student', () => {
    overrideMockUseMyData({
      myData: createMockAppUser({
        studentRole: 'student',
        betaTester: true,
      }),
      isLoading: false,
    });

    const { result } = renderHook(() => useStudentUiVersion());

    expect(result.current.version).toBe('v2');
    expect(result.current.isLoading).toBe(false);
  });

  it('returns v1 when the logged-in user is a beta tester but not a student', () => {
    overrideMockUseMyData({
      myData: createMockAppUser({
        studentRole: 'limited',
        betaTester: true,
      }),
      isLoading: false,
    });

    const { result } = renderHook(() => useStudentUiVersion());

    expect(result.current.version).toBe('v1');
  });

  it('returns v1 and isLoading true while myData is still fetching', () => {
    overrideMockUseMyData({
      myData: null,
      isLoading: true,
    });

    const { result } = renderHook(() => useStudentUiVersion());

    expect(result.current.version).toBe('v1');
    expect(result.current.isLoading).toBe(true);
  });

  it('returns v1 when myData is null after the fetch resolves', () => {
    overrideMockUseMyData({
      myData: null,
      isLoading: false,
    });

    const { result } = renderHook(() => useStudentUiVersion());

    expect(result.current.version).toBe('v1');
    expect(result.current.isLoading).toBe(false);
  });
});
