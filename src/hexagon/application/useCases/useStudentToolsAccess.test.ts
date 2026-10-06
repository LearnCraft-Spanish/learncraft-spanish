import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockUseUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent.mock';
import { useStudentToolsAccess } from '@application/useCases/useStudentToolsAccess';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('useStudentToolsAccess', () => {
  it('allows a student', () => {
    overrideMockAuthAdapter({ isAdmin: false, isCoach: false });

    const { result } = renderHook(() => useStudentToolsAccess());

    expect(result.current.allowed).toBe(true);
  });

  it('blocks a coach who is not using the app as a student', () => {
    overrideMockAuthAdapter({ isAdmin: false, isCoach: true });

    const { result } = renderHook(() => useStudentToolsAccess());

    expect(result.current.allowed).toBe(false);
  });

  it('allows an admin who is using the app as a student', () => {
    overrideMockAuthAdapter({ isAdmin: true, isCoach: false });
    overrideMockUseUsingAsStudent({ isUsingAsStudent: true });

    const { result } = renderHook(() => useStudentToolsAccess());

    expect(result.current.allowed).toBe(true);
  });

  it('allows a coach who is not using the app as a student into catalog tools', () => {
    overrideMockAuthAdapter({ isAdmin: false, isCoach: true });

    const { result } = renderHook(() => useStudentToolsAccess('catalog'));

    expect(result.current.allowed).toBe(true);
  });

  it('still blocks that coach from explicitly student-scoped tools', () => {
    overrideMockAuthAdapter({ isAdmin: false, isCoach: true });

    const { result } = renderHook(() => useStudentToolsAccess('student'));

    expect(result.current.allowed).toBe(false);
  });

  it('passes auth loading through', () => {
    overrideMockAuthAdapter({ isLoading: true });

    const { result } = renderHook(() => useStudentToolsAccess());

    expect(result.current.isLoading).toBe(true);
  });
});
