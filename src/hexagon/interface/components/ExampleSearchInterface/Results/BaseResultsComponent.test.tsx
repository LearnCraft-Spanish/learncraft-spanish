import {
  defaultMockImplementation,
  overrideMockUseSelectedExamplesContext,
  resetMockUseSelectedExamplesContext,
} from '@application/coordinators/hooks/useSelectedExamplesContext.mock';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useSelectedExamplesContext hook
vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: () => defaultMockImplementation,
}));

describe('component: BaseResultsComponent', () => {
  beforeEach(() => {
    resetMockUseSelectedExamplesContext();
    vi.clearAllMocks();
  });

  describe('info message', () => {
    it('should display info message when provided', () => {
      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={undefined}
          info="Custom info message"
        />,
      );

      expect(screen.getByText('Custom info message')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should display loading message when isLoading is true', () => {
      render(
        <BaseResultsComponent
          isLoading={true}
          error={null}
          examples={undefined}
        />,
      );

      expect(screen.getByText('Loading results...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message when error is provided', () => {
      const error = new Error('Failed to fetch examples');

      render(
        <BaseResultsComponent
          isLoading={false}
          error={error}
          examples={undefined}
        />,
      );

      expect(
        screen.getByText('Error: Failed to fetch examples'),
      ).toBeInTheDocument();
    });
  });

  describe('empty states', () => {
    it('should display "Perform a search" message when examples is undefined', () => {
      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={undefined}
        />,
      );

      expect(
        screen.getByText('Perform a search to see results.'),
      ).toBeInTheDocument();
    });

    it('should display "No results" message when examples array is empty', () => {
      render(
        <BaseResultsComponent isLoading={false} error={null} examples={[]} />,
      );

      expect(screen.getByText('No results.')).toBeInTheDocument();
    });
  });

  describe('results display', () => {
    it('should render a list of examples', () => {
      const mockExamples = createMockExampleWithVocabularyList(1, {
        spanish: 'Example 1',
      });

      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={mockExamples}
        />,
      );

      mockExamples.forEach((example) => {
        expect(screen.getByText(example.spanish)).toBeInTheDocument();
      });
    });

    it('should render title when provided', () => {
      const mockExamples = createMockExampleWithVocabularyList(2);

      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={mockExamples}
          title="Search Results"
        />,
      );

      expect(
        screen.getByRole('heading', { name: 'Search Results' }),
      ).toBeInTheDocument();
    });

    it('should not render title when not provided', () => {
      const mockExamples = createMockExampleWithVocabularyList(2);

      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={mockExamples}
        />,
      );

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    const mockPagination = {
      page: 1,
      maxPage: 3,
      nextPage: vi.fn(),
      previousPage: vi.fn(),
    };

    it('should render pagination when maxPage > 1', () => {
      const mockExamples = createMockExampleWithVocabularyList(5);

      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={mockExamples}
          pagination={mockPagination}
        />,
      );

      // Pagination component should be rendered (checking for buttons or page info)
      expect(screen.getByText(/page/i)).toBeInTheDocument();
    });

    it('should not render pagination when maxPage is 1', () => {
      const mockExamples = createMockExampleWithVocabularyList(5);
      const singlePagePagination = {
        ...mockPagination,
        maxPage: 1,
      };

      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={mockExamples}
          pagination={singlePagePagination}
        />,
      );

      expect(screen.queryByText(/page/i)).not.toBeInTheDocument();
    });

    it('should not render pagination when pagination is undefined', () => {
      const mockExamples = createMockExampleWithVocabularyList(5);

      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={mockExamples}
        />,
      );

      expect(screen.queryByText(/page/i)).not.toBeInTheDocument();
    });
  });
  describe('bulk selection controls', () => {
    it('selects all examples on the page when the button is clicked', async () => {
      const mockExamples = createMockExampleWithVocabularyList(2);
      // cange mock examples to have different ids
      mockExamples.forEach((example, index) => {
        example.id = index + 1;
      });
      const updateSelectedExamples = vi.fn();

      overrideMockUseSelectedExamplesContext(() => ({
        ...defaultMockImplementation,
        selectedExampleIds: [],
        updateSelectedExamples,
      }));

      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={mockExamples}
          bulkOption="selectAll"
        />,
      );

      const button = screen.getByRole('button', {
        name: /Select All on Page/i,
      });

      await waitFor(async () => {
        fireEvent.click(button);
      });
      waitFor(() => {
        expect(updateSelectedExamples).toHaveBeenCalledWith(
          mockExamples.map((example) => example.id),
        );
      });
    });

    it('clears the selection when the clear button is clicked', () => {
      const mockExamples = createMockExampleWithVocabularyList(1);

      render(
        <BaseResultsComponent
          isLoading={false}
          error={null}
          examples={mockExamples}
          bulkOption="deselectAll"
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /Clear Selection/i }));

      expect(
        defaultMockImplementation.clearSelectedExamples,
      ).toHaveBeenCalled();
    });
  });
});
