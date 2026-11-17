import type { ExampleFilterStateWithoutLesson } from '@application/coordinators/contexts/ExampleFilterContext';
import type { ReactNode } from 'react';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
import { act, render, renderHook, screen } from '@testing-library/react';
import { use } from 'react';
import { describe, expect, it } from 'vitest';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ExampleFilterContextProvider>{children}</ExampleFilterContextProvider>
);

const changedFilters: ExampleFilterStateWithoutLesson = {
  excludeSpanglish: true,
  audioOnly: true,
  skillTagKeys: ['Vocabulary-1'],
  includeUnpublished: true,
};

describe('exampleFilterContextProvider', () => {
  it('starts with no filters applied', () => {
    const { result } = renderHook(() => use(ExampleFilterContext), { wrapper });

    expect(result.current.exampleFilters).toEqual({
      excludeSpanglish: false,
      audioOnly: false,
      skillTagKeys: [],
      includeUnpublished: false,
    });
  });

  it('renders its children and shares the filters between all of them', () => {
    const Reader = ({ label }: { label: string }) => {
      const { exampleFilters } = use(ExampleFilterContext);
      return <p>{`${label}: ${exampleFilters.skillTagKeys.join(',')}`}</p>;
    };
    const Writer = () => {
      const { updateExampleFilters } = use(ExampleFilterContext);
      return (
        <button
          type="button"
          onClick={() => updateExampleFilters(changedFilters)}
        >
          select tag
        </button>
      );
    };
    render(
      <ExampleFilterContextProvider>
        <Reader label="first" />
        <Reader label="second" />
        <Writer />
      </ExampleFilterContextProvider>,
    );

    act(() => screen.getByRole('button', { name: 'select tag' }).click());

    expect(screen.getByText('first: Vocabulary-1')).toBeInTheDocument();
    expect(screen.getByText('second: Vocabulary-1')).toBeInTheDocument();
  });
});
