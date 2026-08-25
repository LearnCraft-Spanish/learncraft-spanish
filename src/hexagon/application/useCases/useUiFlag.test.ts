import { overrideMockFeatureFlagAdapter } from '@application/adapters/featureFlagAdapter.mock';
import { useUiFlag } from '@application/useCases/useUiFlag';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('useUiFlag', () => {
  it('returns enabled false when the flag is disabled', () => {
    overrideMockFeatureFlagAdapter({
      isEnabled: () => false,
    });

    const { result } = renderHook(() => useUiFlag('ui.dev.gallery'));

    expect(result.current.enabled).toBe(false);
  });

  it('returns enabled true when the flag is enabled', () => {
    overrideMockFeatureFlagAdapter({
      isEnabled: () => true,
    });

    const { result } = renderHook(() => useUiFlag('ui.dev.gallery'));

    expect(result.current.enabled).toBe(true);
  });

  it('asks the adapter about the requested flag', () => {
    const isEnabled = vi.fn<(flagId: string) => boolean>(() => true);
    overrideMockFeatureFlagAdapter({ isEnabled });

    renderHook(() => useUiFlag('ui.student.flashcards.finder.v2'));

    expect(isEnabled).toHaveBeenCalledWith('ui.student.flashcards.finder.v2');
  });
});
