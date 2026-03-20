import {
  defaultMockImplementation,
  resetMockUseSelectedExamplesContext,
} from '@application/coordinators/hooks/useSelectedExamplesContext.mock';
import { MaxFrequencyResultsComponent } from '@interface/components/ExampleSearchInterface/Results/MaxFrequencyResultsComponent';
import { render, screen } from '@testing-library/react';
import { createMockExampleMaxFrequencyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: () => defaultMockImplementation,
}));

describe('component: MaxFrequencyResultsComponent', () => {
  beforeEach(() => {
    resetMockUseSelectedExamplesContext();
    vi.clearAllMocks();
  });

  it('renders each example maxFrequency via postTextComponents', () => {
    const examples = createMockExampleMaxFrequencyList(1, {
      maxFrequency: 7,
    });

    render(
      <MaxFrequencyResultsComponent
        bulkOption={undefined}
        isLoading={false}
        error={null}
        examples={examples}
      />,
    );

    expect(screen.getByText('Max Frequency:')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders empty state for undefined examples', () => {
    render(
      <MaxFrequencyResultsComponent
        bulkOption={undefined}
        isLoading={false}
        error={null}
        examples={undefined}
      />,
    );

    expect(
      screen.getByText('Perform a search to see results.'),
    ).toBeInTheDocument();
  });
});
