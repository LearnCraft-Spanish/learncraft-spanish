import { setQuizActive, useQuizActive } from '@interface/hooks/useQuizChrome';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('useQuizChrome', () => {
  afterEach(() => {
    setQuizActive(false);
  });

  it('defaults to false', () => {
    const { result } = renderHook(() => useQuizActive());
    expect(result.current).toBe(false);
  });

  it('set true/false notifies subscribers', () => {
    const { result } = renderHook(() => useQuizActive());

    act(() => setQuizActive(true));
    expect(result.current).toBe(true);

    act(() => setQuizActive(false));
    expect(result.current).toBe(false);
  });

  it('multiple subscribers stay in sync', () => {
    const { result: first } = renderHook(() => useQuizActive());
    const { result: second } = renderHook(() => useQuizActive());

    act(() => setQuizActive(true));

    expect(first.current).toBe(true);
    expect(second.current).toBe(true);
  });
});
