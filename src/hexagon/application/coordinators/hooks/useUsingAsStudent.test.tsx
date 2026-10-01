import type { ReactNode } from 'react';
import { useUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent';
import { UsingAsStudentProvider } from '@application/coordinators/providers/UsingAsStudentProvider';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// The global setup mocks this hook for consumers; this suite tests the real one
vi.unmock('@application/coordinators/hooks/useUsingAsStudent');

function wrapper({ children }: { children: ReactNode }) {
  return <UsingAsStudentProvider>{children}</UsingAsStudentProvider>;
}

describe('useUsingAsStudent', () => {
  it('defaults to false', () => {
    const { result } = renderHook(() => useUsingAsStudent(), { wrapper });
    expect(result.current.isUsingAsStudent).toBe(false);
  });

  it('turns on and back off', () => {
    const { result } = renderHook(() => useUsingAsStudent(), { wrapper });

    act(() => result.current.setIsUsingAsStudent(true));
    expect(result.current.isUsingAsStudent).toBe(true);

    act(() => result.current.setIsUsingAsStudent(false));
    expect(result.current.isUsingAsStudent).toBe(false);
  });

  it('throws outside its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useUsingAsStudent())).toThrow(
      'useUsingAsStudent must be used within a UsingAsStudentProvider',
    );
  });
});
