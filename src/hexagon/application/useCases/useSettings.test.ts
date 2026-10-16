import {
  mockAuthAdapter,
  overrideMockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import {
  mockUseMyData,
  overrideMockUseMyData,
  resetMockUseMyData,
} from '@application/queries/useMyData.mock';
import { useSettings } from '@application/useCases/useSettings';
import { act, renderHook } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/authAdapter', () => ({
  useAuthAdapter: () => mockAuthAdapter,
}));

vi.mock('@application/queries/useMyData', () => ({
  useMyData: () => mockUseMyData,
}));

describe('useSettings', () => {
  beforeEach(() => {
    resetMockAuthAdapter();
    resetMockUseMyData();
  });

  it('shows the signed-in user name and email', () => {
    overrideMockUseMyData({
      myData: createMockAppUser({ name: 'Maria Silva' }),
    });
    overrideMockAuthAdapter({
      authUser: { email: 'maria@example.com', roles: ['Student'] },
    });

    const { result } = renderHook(() => useSettings());

    expect(result.current.fullName).toBe('Maria Silva');
    expect(result.current.email).toBe('maria@example.com');
    expect(result.current.isLoading).toBe(false);
  });

  it('reports loading while the own record is still fetching', () => {
    overrideMockUseMyData({ isLoading: true, myData: null });

    const { result } = renderHook(() => useSettings());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.fullName).toBeNull();
  });

  it('treats a blank name or email as missing', () => {
    overrideMockUseMyData({
      myData: createMockAppUser({ name: '   ' }),
    });
    overrideMockAuthAdapter({
      authUser: { email: '  ', roles: ['Student'] },
    });

    const { result } = renderHook(() => useSettings());

    expect(result.current.fullName).toBeNull();
    expect(result.current.email).toBeNull();
  });

  it('emails a reset link to the signed-in address', async () => {
    const requestPasswordReset = vi.fn<(email: string) => Promise<void>>(
      async () => undefined,
    );
    overrideMockAuthAdapter({
      authUser: { email: 'maria@example.com', roles: ['Student'] },
      requestPasswordReset,
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.requestPasswordReset();
    });

    expect(requestPasswordReset).toHaveBeenCalledOnce();
    expect(requestPasswordReset).toHaveBeenCalledWith('maria@example.com');
    expect(result.current.passwordResetStatus).toBe('sent');
  });

  it('records an error when the reset email is rejected', async () => {
    overrideMockAuthAdapter({
      authUser: { email: 'maria@example.com', roles: ['Student'] },
      requestPasswordReset: vi.fn<(email: string) => Promise<void>>(
        async () => {
          throw new Error('nope');
        },
      ),
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.requestPasswordReset();
    });

    expect(result.current.passwordResetStatus).toBe('error');
  });

  it('does not ask for a reset when the account has no email', async () => {
    const requestPasswordReset = vi.fn<(email: string) => Promise<void>>();
    overrideMockAuthAdapter({
      authUser: { email: '   ', roles: ['Student'] },
      requestPasswordReset,
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.requestPasswordReset();
    });

    expect(requestPasswordReset).not.toHaveBeenCalled();
    expect(result.current.passwordResetStatus).toBe('idle');
  });

  it('ignores a second reset while the first is still sending', async () => {
    let finish: () => void = () => {};
    const requestPasswordReset = vi.fn<(email: string) => Promise<void>>(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    overrideMockAuthAdapter({
      authUser: { email: 'maria@example.com', roles: ['Student'] },
      requestPasswordReset,
    });

    const { result } = renderHook(() => useSettings());

    await act(async () => {
      result.current.requestPasswordReset();
      result.current.requestPasswordReset();
    });

    expect(requestPasswordReset).toHaveBeenCalledOnce();
    expect(result.current.passwordResetStatus).toBe('sending');

    await act(async () => {
      finish();
    });

    expect(result.current.passwordResetStatus).toBe('sent');
  });

  it('forwards logout to the auth adapter', () => {
    const logout = vi.fn();
    overrideMockAuthAdapter({ logout });

    const { result } = renderHook(() => useSettings());
    result.current.logout();

    expect(logout).toHaveBeenCalledOnce();
  });
});
