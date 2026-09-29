import {
  mockAuthAdapter,
  overrideMockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import {
  mockActiveStudent,
  overrideMockActiveStudent,
  resetMockActiveStudent,
} from '@application/coordinators/hooks/useActiveStudent.mock';
import {
  mockUseUsingAsStudent,
  overrideMockUseUsingAsStudent,
} from '@application/coordinators/hooks/useUsingAsStudent.mock';
import {
  mockUseMyData,
  overrideMockUseMyData,
  resetMockUseMyData,
} from '@application/queries/useMyData.mock';
import useAppHeader from '@application/useCases/AppHeader/useAppHeader';
import { renderHook } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/authAdapter', () => ({
  useAuthAdapter: () => mockAuthAdapter,
}));

vi.mock('@application/coordinators/hooks/useActiveStudent', () => ({
  useActiveStudent: () => mockActiveStudent,
}));

vi.mock('@application/queries/useMyData', () => ({
  useMyData: () => mockUseMyData,
}));

describe('useAppHeader', () => {
  beforeEach(() => {
    resetMockAuthAdapter();
    resetMockActiveStudent();
    resetMockUseMyData();
  });

  it('passes through isAuthenticated', () => {
    overrideMockAuthAdapter({ isAuthenticated: true });

    const { result } = renderHook(() => useAppHeader());

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('exposes the signed-in user email from the auth adapter', () => {
    overrideMockAuthAdapter({
      isAuthenticated: true,
      authUser: { email: 'student-lcsp@fake.not', roles: ['Student'] },
    });

    const { result } = renderHook(() => useAppHeader());

    expect(result.current.studentEmail).toBe('student-lcsp@fake.not');
  });

  it("exposes the signed-in user's own name", () => {
    overrideMockUseMyData({
      myData: createMockAppUser({ name: 'Maria Silva' }),
    });

    const { result } = renderHook(() => useAppHeader());

    expect(result.current.studentName).toBe('Maria Silva');
  });

  it("keeps the staff member's own name while using the app as a student", () => {
    overrideMockUseMyData({
      myData: createMockAppUser({ name: 'Coach Carla' }),
    });
    overrideMockActiveStudent({
      appUser: createMockAppUser({
        name: 'Some Other Student',
        emailAddress: 'other@fake.not',
      }),
      isOwnUser: false,
    });
    overrideMockUseUsingAsStudent({ isUsingAsStudent: true });

    const { result } = renderHook(() => useAppHeader());

    expect(result.current.studentName).toBe('Coach Carla');
    expect(result.current.usingAs).toEqual({
      name: 'Some Other Student',
      email: 'other@fake.not',
    });
  });

  it('reports no usingAs while staff are in their own view', () => {
    overrideMockActiveStudent({
      appUser: createMockAppUser(),
      isOwnUser: true,
    });

    const { result } = renderHook(() => useAppHeader());

    expect(result.current.isUsingAsStudent).toBe(false);
    expect(result.current.usingAs).toBeNull();
  });

  it('flags coaches and admins as staff, not students', () => {
    overrideMockAuthAdapter({ isAdmin: false, isCoach: true });
    const coach = renderHook(() => useAppHeader());
    expect(coach.result.current.isStaff).toBe(true);

    overrideMockAuthAdapter({ isAdmin: false, isCoach: false });
    const student = renderHook(() => useAppHeader());
    expect(student.result.current.isStaff).toBe(false);
  });

  it('reports which staff view to return to, admin first', () => {
    overrideMockAuthAdapter({ isAdmin: true, isCoach: true });
    expect(renderHook(() => useAppHeader()).result.current.staffRole).toBe(
      'admin',
    );

    overrideMockAuthAdapter({ isAdmin: false, isCoach: true });
    expect(renderHook(() => useAppHeader()).result.current.staffRole).toBe(
      'coach',
    );

    overrideMockAuthAdapter({ isAdmin: false, isCoach: false });
    expect(
      renderHook(() => useAppHeader()).result.current.staffRole,
    ).toBeNull();
  });

  it('stops using the app as a student and returns to the own record', () => {
    overrideMockUseUsingAsStudent({ isUsingAsStudent: true });
    const { result } = renderHook(() => useAppHeader());

    result.current.stopUsingAsStudent();

    expect(mockActiveStudent.resetActiveStudent).toHaveBeenCalledOnce();
    expect(mockUseUsingAsStudent.setIsUsingAsStudent).toHaveBeenCalledWith(
      false,
    );
  });

  it('forwards login and logout from the auth adapter', () => {
    const login = vi.fn();
    const logout = vi.fn();
    overrideMockAuthAdapter({ login, logout });

    const { result } = renderHook(() => useAppHeader());
    result.current.login();
    result.current.logout();

    expect(login).toHaveBeenCalledOnce();
    expect(logout).toHaveBeenCalledOnce();
  });
});
