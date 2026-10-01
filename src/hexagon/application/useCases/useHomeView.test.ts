import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockUseUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent.mock';
import {
  mockUseMyData,
  overrideMockUseMyData,
  resetMockUseMyData,
} from '@application/queries/useMyData.mock';
import { useHomeView } from '@application/useCases/useHomeView';
import { renderHook } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/useMyData', () => ({
  useMyData: () => mockUseMyData,
}));

describe('useHomeView', () => {
  afterEach(() => {
    resetMockUseMyData();
  });

  it('shows a coach their staff tools without admin tools', () => {
    overrideMockAuthAdapter({ isCoach: true, isAdmin: false });

    const { result } = renderHook(() => useHomeView());

    expect(result.current).toEqual({
      view: 'staffTools',
      showAdminTools: false,
    });
  });

  it('shows an admin their staff tools with admin tools', () => {
    overrideMockAuthAdapter({ isCoach: false, isAdmin: true });

    const { result } = renderHook(() => useHomeView());

    expect(result.current).toEqual({
      view: 'staffTools',
      showAdminTools: true,
    });
  });

  it('shows staff the v2 student home while using the app as a student', () => {
    overrideMockAuthAdapter({ isCoach: true, isAdmin: false });
    overrideMockUseUsingAsStudent({ isUsingAsStudent: true });

    const { result } = renderHook(() => useHomeView());

    expect(result.current.view).toBe('studentV2');
  });

  it('shows a beta-tester student the v2 home', () => {
    overrideMockAuthAdapter({ isCoach: false, isAdmin: false });
    overrideMockUseMyData({
      myData: createMockAppUser({ studentRole: 'student', betaTester: true }),
    });

    const { result } = renderHook(() => useHomeView());

    expect(result.current.view).toBe('studentV2');
  });

  it('shows a non-beta student the legacy menu', () => {
    overrideMockAuthAdapter({ isCoach: false, isAdmin: false });
    overrideMockUseMyData({
      myData: createMockAppUser({ studentRole: 'student', betaTester: false }),
    });

    const { result } = renderHook(() => useHomeView());

    expect(result.current.view).toBe('legacyMenu');
  });
});
