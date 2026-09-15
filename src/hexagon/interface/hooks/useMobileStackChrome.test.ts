import {
  setMobileStackOverride,
  useMobileStackOverride,
} from '@interface/hooks/useMobileStackChrome';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('useMobileStackChrome', () => {
  afterEach(() => {
    setMobileStackOverride(null);
  });

  it('defaults to null', () => {
    const { result } = renderHook(() => useMobileStackOverride());
    expect(result.current).toBeNull();
  });

  it('notifies subscribers when an override is set and cleared', () => {
    const { result } = renderHook(() => useMobileStackOverride());
    const onBack = vi.fn();

    act(() => setMobileStackOverride({ title: 'Text Quiz', onBack }));
    expect(result.current).toEqual({ title: 'Text Quiz', onBack });

    act(() => setMobileStackOverride(null));
    expect(result.current).toBeNull();
  });

  it('keeps multiple subscribers in sync', () => {
    const { result: first } = renderHook(() => useMobileStackOverride());
    const { result: second } = renderHook(() => useMobileStackOverride());
    const onBack = vi.fn();

    act(() => setMobileStackOverride({ title: 'Choose tags', onBack }));

    expect(first.current?.title).toBe('Choose tags');
    expect(second.current?.title).toBe('Choose tags');
  });
});
