import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useStudentUiVersion', () => {
  it('returns v2 for a signed-in student', () => {
    overrideMockAuthAdapter({ isStudent: true });

    const { result } = renderHook(() => useStudentUiVersion());

    expect(result.current.version).toBe('v2');
  });

  it('returns v2 for a limited user', () => {
    overrideMockAuthAdapter({ isStudent: false, isLimited: true });

    const { result } = renderHook(() => useStudentUiVersion());

    expect(result.current.version).toBe('v2');
  });

  it('returns v2 before anyone has logged in', () => {
    overrideMockAuthAdapter({ isAuthenticated: false });

    const { result } = renderHook(() => useStudentUiVersion());

    expect(result.current.version).toBe('v2');
  });
});
