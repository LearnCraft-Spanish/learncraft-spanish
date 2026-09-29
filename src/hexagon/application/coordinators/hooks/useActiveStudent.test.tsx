import type { AppUserPort } from '@application/ports/appUserPort';
import type { ReactNode } from 'react';
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The global setup mocks this hook for consumers; this suite tests the real one
vi.unmock('@application/coordinators/hooks/useActiveStudent');

const coach = getAppUserFromEmail('student-admin@fake.not')!;
const student = getAppUserFromEmail('student-lcsp@fake.not')!;

const appUserPort: AppUserPort = {
  getMyData: vi.fn(async () => coach),
  getAppUserByEmail: vi.fn(async (email: string) =>
    email === student.emailAddress ? student : null,
  ),
  getAllAppStudents: vi.fn(async () => []),
};

vi.mock('@application/adapters/appUserAdapter', () => ({
  useAppUserAdapter: () => appUserPort,
}));

vi.mock('@interface/hooks/useModal', () => ({
  useModal: () => ({ openModal: vi.fn(), closeModal: vi.fn() }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <TestQueryClientProvider>
      <ActiveStudentProvider>{children}</ActiveStudentProvider>
    </TestQueryClientProvider>
  );
}

describe('useActiveStudent', () => {
  beforeEach(() => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-admin@fake.not')!,
      isAuthenticated: true,
      isAdmin: true,
      isCoach: true,
      isStudent: true,
    });
  });

  it('defaults to the signed-in user', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    await waitFor(() => expect(result.current.appUser).toEqual(coach));
    expect(result.current.isOwnUser).toBe(true);
  });

  it('switches to a selected student', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    act(() => result.current.changeActiveStudent(student.emailAddress));

    await waitFor(() => expect(result.current.appUser).toEqual(student));
    expect(result.current.isOwnUser).toBe(false);
  });

  it('resetActiveStudent returns to the signed-in user', async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    act(() => result.current.changeActiveStudent(student.emailAddress));
    await waitFor(() => expect(result.current.appUser).toEqual(student));

    act(() => result.current.resetActiveStudent());

    await waitFor(() => expect(result.current.appUser).toEqual(coach));
    expect(result.current.isOwnUser).toBe(true);
  });

  it('ignores changes from a user without a coach or admin role', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isStudent: true,
      isAdmin: false,
      isCoach: false,
    });
    const { result } = renderHook(() => useActiveStudent(), { wrapper });

    act(() => result.current.changeActiveStudent('student-ser-estar@fake.not'));

    expect(result.current.isOwnUser).toBe(true);
  });
});
