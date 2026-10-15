import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockUseUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent.mock';
import { useHomeView } from '@application/useCases/useHomeView';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const noRoles = {
  isAdmin: false,
  isCoach: false,
  isStudent: false,
  isLimited: false,
};

describe('useHomeView', () => {
  it('shows a coach their staff tools without admin tools', () => {
    overrideMockAuthAdapter({ ...noRoles, isCoach: true });

    const { result } = renderHook(() => useHomeView());

    expect(result.current).toEqual({
      view: 'staffTools',
      showAdminTools: false,
      ctas: [],
      entries: [],
    });
  });

  it('shows an admin their staff tools with admin tools', () => {
    overrideMockAuthAdapter({ ...noRoles, isAdmin: true });

    const { result } = renderHook(() => useHomeView());

    expect(result.current).toEqual({
      view: 'staffTools',
      showAdminTools: true,
      ctas: [],
      entries: [],
    });
  });

  it('shows staff the student home while using the app as a student', () => {
    overrideMockAuthAdapter({ ...noRoles, isCoach: true });
    overrideMockUseUsingAsStudent({ isUsingAsStudent: true });

    const { result } = renderHook(() => useHomeView());

    expect(result.current.view).toBe('student');
  });

  it('shows every student the student home, beta tester or not', () => {
    overrideMockAuthAdapter({ ...noRoles, isStudent: true });

    const { result } = renderHook(() => useHomeView());

    expect(result.current).toEqual({
      view: 'student',
      showAdminTools: false,
      ctas: [],
      entries: [],
    });
  });

  it('gives a limited user the Audio Quiz CTA and Official quizzes as a menu option', () => {
    overrideMockAuthAdapter({ ...noRoles, isLimited: true });

    const { result } = renderHook(() => useHomeView());

    expect(result.current.view).toBe('limited');
    expect(result.current.ctas.map((cta) => cta.headline)).toEqual([
      'Audio Quiz',
    ]);
    expect(result.current.entries.map((entry) => entry.title)).toEqual([
      'Official quizzes',
    ]);
  });

  it('gives a free user only the Official Quizzes CTA', () => {
    overrideMockAuthAdapter(noRoles);

    const { result } = renderHook(() => useHomeView());

    expect(result.current.view).toBe('free');
    expect(result.current.ctas.map((cta) => cta.headline)).toEqual([
      'Official Quizzes',
    ]);
    expect(result.current.entries).toEqual([]);
  });
});
