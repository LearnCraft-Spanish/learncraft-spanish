import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { SelectedExamples } from '@interface/components/ExampleSearchInterface/SelectedExamples';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/units/ExampleSearchInterface/useSelectedExamples',
  () => ({
    useSelectedExamples: vi.fn(() => ({
      selectedExamples: createMockExampleWithVocabularyList(3),
    })),
  }),
);

vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: vi.fn(() => ({
    addSelectedExample: vi.fn(),
    removeSelectedExample: vi.fn(),
    selectedExampleIds: [],
  })),
}));

describe('component: SelectedExamples', () => {
  it('should render selected examples with count in title', () => {
    render(<SelectedExamples />);
    expect(screen.getByText('3 Selected Examples')).toBeInTheDocument();
  });

  it('uses useSelectedExamples hook', () => {
    render(<SelectedExamples />);
    expect(useSelectedExamples).toHaveBeenCalled();
  });

  it('should return null when no examples are selected', () => {
    vi.mocked(useSelectedExamples).mockReturnValue({
      selectedExamples: [],
    });

    const { container } = render(<SelectedExamples />);
    expect(container.firstChild).toBeNull();
  });
});
