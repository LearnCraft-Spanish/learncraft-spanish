import { useMediaQuery } from '@interface/hooks/useMediaQuery';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

/** Minimal `MediaQueryList` stub — jsdom does not implement `matchMedia`. */
function stubMatchMedia(matches: boolean): {
  list: MockMediaQueryList;
  listeners: Set<() => void>;
} {
  const listeners = new Set<() => void>();
  const list: MockMediaQueryList = {
    matches,
    media: '',
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
  };
  vi.stubGlobal('matchMedia', (query: string) => {
    list.media = query;
    return list;
  });
  return { list, listeners };
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when matchMedia is not implemented (jsdom default)', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('returns the query’s current match state', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const { list, listeners } = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);

    list.matches = true;
    act(() => {
      listeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
  });

  it('unsubscribes on unmount', () => {
    const { listeners } = stubMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
