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

describe('useAppHeader', () => {
  beforeEach(() => {
    resetMockAuthAdapter();
    resetMockActiveStudent();
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

  it('exposes the app user name when viewing their own account', () => {
    const mockUser = createMockAppUser({ name: 'Maria Silva' });
    overrideMockActiveStudent({ appUser: mockUser, isOwnUser: true });

    const { result } = renderHook(() => useAppHeader());

    expect(result.current.studentName).toBe('Maria Silva');
  });

  it('omits the name when viewing a different student (coach/admin)', () => {
    const mockUser = createMockAppUser({ name: 'Some Other Student' });
    overrideMockActiveStudent({ appUser: mockUser, isOwnUser: false });

    const { result } = renderHook(() => useAppHeader());

    expect(result.current.studentName).toBeUndefined();
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
