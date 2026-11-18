import type { ReactNode } from 'react';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

function wrapper({ children }: { children: ReactNode }) {
  return <SelectedExamplesProvider>{children}</SelectedExamplesProvider>;
}

// Selection order is not part of the contract, so compare order-insensitively
function sorted(ids: number[]): number[] {
  return [...ids].sort((a, b) => a - b);
}

describe('useSelectedExamplesContext', () => {
  it('starts with no examples selected', () => {
    const { result } = renderHook(() => useSelectedExamplesContext(), {
      wrapper,
    });

    expect(result.current.selectedExampleIds).toEqual([]);
  });

  it('replaces the whole selection with updateSelectedExamples', () => {
    const { result } = renderHook(() => useSelectedExamplesContext(), {
      wrapper,
    });
    act(() => result.current.updateSelectedExamples([1, 2, 3]));

    act(() => result.current.updateSelectedExamples([7, 8]));

    expect(sorted(result.current.selectedExampleIds)).toEqual([7, 8]);
  });

  it('adds an example to the selection', () => {
    const { result } = renderHook(() => useSelectedExamplesContext(), {
      wrapper,
    });
    act(() => result.current.updateSelectedExamples([1]));

    act(() => result.current.addSelectedExample(2));

    expect(sorted(result.current.selectedExampleIds)).toEqual([1, 2]);
  });

  it('does not select the same example twice', () => {
    const { result } = renderHook(() => useSelectedExamplesContext(), {
      wrapper,
    });
    act(() => result.current.addSelectedExample(5));

    act(() => result.current.addSelectedExample(5));

    expect(result.current.selectedExampleIds).toEqual([5]);
  });

  it('removes only the given example from the selection', () => {
    const { result } = renderHook(() => useSelectedExamplesContext(), {
      wrapper,
    });
    act(() => result.current.updateSelectedExamples([1, 2, 3]));

    act(() => result.current.removeSelectedExample(2));

    expect(sorted(result.current.selectedExampleIds)).toEqual([1, 3]);
  });

  it('leaves the selection alone when removing an example that is not selected', () => {
    const { result } = renderHook(() => useSelectedExamplesContext(), {
      wrapper,
    });
    act(() => result.current.updateSelectedExamples([1, 2]));

    act(() => result.current.removeSelectedExample(99));

    expect(sorted(result.current.selectedExampleIds)).toEqual([1, 2]);
  });

  it('clears the whole selection', () => {
    const { result } = renderHook(() => useSelectedExamplesContext(), {
      wrapper,
    });
    act(() => result.current.updateSelectedExamples([1, 2, 3]));

    act(() => result.current.clearSelectedExamples());

    expect(result.current.selectedExampleIds).toEqual([]);
  });

  it('throws outside its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useSelectedExamplesContext())).toThrow(
      'useSelectedExamplesContext must be used within a SelectedExamplesContextProvider',
    );
  });
});
