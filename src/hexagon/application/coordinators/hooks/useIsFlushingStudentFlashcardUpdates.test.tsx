import type { ReactNode } from 'react';
import { useIsFlushingStudentFlashcardUpdates } from '@application/coordinators/hooks/useIsFlushingStudentFlashcardUpdates';
import { IsFlushingStudentFlashcardUpdatesProvider } from '@application/coordinators/providers/IsFlushingStudentFlashcardUpdatesProvider';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <IsFlushingStudentFlashcardUpdatesProvider>
      {children}
    </IsFlushingStudentFlashcardUpdatesProvider>
  );
}

describe('useIsFlushingStudentFlashcardUpdates', () => {
  it('starts out not flushing', () => {
    const { result } = renderHook(
      () => useIsFlushingStudentFlashcardUpdates(),
      { wrapper },
    );

    expect(result.current.isFlushing).toBe(false);
  });

  it('turns on and back off', () => {
    const { result } = renderHook(
      () => useIsFlushingStudentFlashcardUpdates(),
      { wrapper },
    );

    act(() => result.current.setIsFlushing(true));
    expect(result.current.isFlushing).toBe(true);

    act(() => result.current.setIsFlushing(false));
    expect(result.current.isFlushing).toBe(false);
  });

  it('throws outside its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      renderHook(() => useIsFlushingStudentFlashcardUpdates()),
    ).toThrow(
      'useIsFlushingStudentFlashcardUpdates must be used within a IsFlushingStudentFlashcardUpdatesProvider',
    );
  });
});
