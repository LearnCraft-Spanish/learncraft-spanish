import type {
  ExampleFilterContextType,
  ExampleFilterStateWithoutLesson,
} from '@application/coordinators/contexts/ExampleFilterContext';
import type { ReactNode } from 'react';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { useIncludeUnpublished } from '@application/coordinators/hooks/useIncludeUnpublished';
import { act, renderHook } from '@testing-library/react';
import { useMemo, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

// The global setup mocks this hook for consumers; this suite tests the real one
vi.unmock('@application/coordinators/hooks/useIncludeUnpublished');

const initialFilters: ExampleFilterStateWithoutLesson = {
  excludeSpanglish: true,
  audioOnly: true,
  skillTagKeys: ['preterite'],
  includeUnpublished: false,
};

// Minimal stateful stand-in for the filter provider, so updates are observable
function StatefulFilters({ children }: { children: ReactNode }) {
  const [exampleFilters, updateExampleFilters] =
    useState<ExampleFilterStateWithoutLesson>(initialFilters);
  const value = useMemo<ExampleFilterContextType>(
    () => ({ exampleFilters, updateExampleFilters }),
    [exampleFilters],
  );
  return <ExampleFilterContext value={value}>{children}</ExampleFilterContext>;
}

describe('useIncludeUnpublished', () => {
  it('excludes unpublished content by default', () => {
    const { result } = renderHook(() => useIncludeUnpublished());

    expect(result.current.includeUnpublished).toBe(false);
  });

  it('turns unpublished content on and back off', () => {
    const { result } = renderHook(() => useIncludeUnpublished(), {
      wrapper: StatefulFilters,
    });

    act(() => result.current.updateIncludeUnpublished(true));
    expect(result.current.includeUnpublished).toBe(true);

    act(() => result.current.updateIncludeUnpublished(false));
    expect(result.current.includeUnpublished).toBe(false);
  });

  it('leaves the other example filters as they were when it changes', () => {
    const updateExampleFilters = vi.fn();
    const { result } = renderHook(() => useIncludeUnpublished(), {
      wrapper: ({ children }) => (
        <ExampleFilterContext
          value={{ exampleFilters: initialFilters, updateExampleFilters }}
        >
          {children}
        </ExampleFilterContext>
      ),
    });

    act(() => result.current.updateIncludeUnpublished(true));

    expect(updateExampleFilters).toHaveBeenCalledWith({
      ...initialFilters,
      includeUnpublished: true,
    });
  });

  it('tells admins apart from other users', () => {
    overrideMockAuthAdapter({ isAdmin: true });
    const { result: asAdmin } = renderHook(() => useIncludeUnpublished());
    expect(asAdmin.current.isAdmin).toBe(true);

    overrideMockAuthAdapter({ isAdmin: false });
    const { result: asNonAdmin } = renderHook(() => useIncludeUnpublished());
    expect(asNonAdmin.current.isAdmin).toBe(false);
  });
});
