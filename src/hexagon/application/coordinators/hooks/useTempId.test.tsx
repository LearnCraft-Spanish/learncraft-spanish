import type { ReactNode } from 'react';
import { useTempId } from '@application/coordinators/hooks/useTempId';
import TempIdContextProvider from '@application/coordinators/providers/TempIdContextProvider';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

function wrapper({ children }: { children: ReactNode }) {
  return <TempIdContextProvider>{children}</TempIdContextProvider>;
}

describe('useTempId', () => {
  it('hands out negative ids, so they cannot collide with real record ids', () => {
    const { result } = renderHook(() => useTempId(), { wrapper });

    const ids = [
      result.current.getNextTempId(),
      result.current.getNextTempId(),
      result.current.getNextTempId(),
    ];

    ids.forEach((id) => expect(id).toBeLessThan(0));
  });

  it('never hands out the same id twice', () => {
    const { result } = renderHook(() => useTempId(), { wrapper });

    const ids = Array.from({ length: 10 }, () =>
      result.current.getNextTempId(),
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps ids unique across separate consumers of the same provider', () => {
    const { result } = renderHook(
      () => ({ first: useTempId(), second: useTempId() }),
      { wrapper },
    );

    const ids = [
      result.current.first.getNextTempId(),
      result.current.second.getNextTempId(),
      result.current.first.getNextTempId(),
      result.current.second.getNextTempId(),
    ];

    expect(new Set(ids).size).toBe(ids.length);
  });
});
