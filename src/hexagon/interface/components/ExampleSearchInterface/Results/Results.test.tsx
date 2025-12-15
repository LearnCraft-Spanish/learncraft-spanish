import { Results } from '@interface/components/ExampleSearchInterface/Results/Results';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock all the result components
vi.mock(
  '@interface/components/ExampleSearchInterface/Results/LocalFilterPanelResults',
  () => ({
    LocalFilterPanelResults: () => <div>Local Filter Panel Results</div>,
  }),
);

vi.mock(
  '@interface/components/ExampleSearchInterface/Results/SearchByDateResults',
  () => ({
    SearchByDateResults: () => <div>Search By Date Results</div>,
  }),
);

vi.mock(
  '@interface/components/ExampleSearchInterface/Results/SearchByQuizResults',
  () => ({
    SearchByQuizResults: () => <div>Search By Quiz Results</div>,
  }),
);

vi.mock(
  '@interface/components/ExampleSearchInterface/Results/SearchByTextResults',
  () => ({
    SearchByTextResults: () => <div>Search By Text Results</div>,
  }),
);

vi.mock(
  '@interface/components/ExampleSearchInterface/Results/SearchByIdsResults',
  () => ({
    SearchByIdsResults: () => <div>Search By Ids Results</div>,
  }),
);

describe('component: Results', () => {
  const mockProps = {
    localFilterResultsProps: {} as any,
    quizResultsProps: {} as any,
    textResultsProps: {} as any,
    idsResultsProps: {} as any,
  };

  describe('mode routing', () => {
    it('should render LocalFilterPanelResults when mode is "filter"', () => {
      render(<Results mode="filter" {...mockProps} />);

      expect(
        screen.getByText('Local Filter Panel Results'),
      ).toBeInTheDocument();
    });

    it('should render SearchByDateResults when mode is "date"', () => {
      render(<Results mode="date" {...mockProps} />);

      expect(screen.getByText('Search By Date Results')).toBeInTheDocument();
    });

    it('should render SearchByQuizResults when mode is "quiz"', () => {
      render(<Results mode="quiz" {...mockProps} />);

      expect(screen.getByText('Search By Quiz Results')).toBeInTheDocument();
    });

    it('should render SearchByTextResults when mode is "text"', () => {
      render(<Results mode="text" {...mockProps} />);

      expect(screen.getByText('Search By Text Results')).toBeInTheDocument();
    });

    it('should render SearchByIdsResults when mode is "ids"', () => {
      render(<Results mode="ids" {...mockProps} />);

      expect(screen.getByText('Search By Ids Results')).toBeInTheDocument();
    });

    it('should render error message for invalid mode', () => {
      render(<Results mode={'invalid' as any} {...mockProps} />);

      expect(screen.getByText('ERROR: Invalid mode')).toBeInTheDocument();
    });
  });

  describe('mode exclusivity', () => {
    it('should only render one result component at a time', () => {
      const { rerender } = render(<Results mode="filter" {...mockProps} />);

      expect(
        screen.getByText('Local Filter Panel Results'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Search By Date Results'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Search By Quiz Results'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Search By Text Results'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Search By Ids Results'),
      ).not.toBeInTheDocument();

      rerender(<Results mode="text" {...mockProps} />);

      expect(
        screen.queryByText('Local Filter Panel Results'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Search By Text Results')).toBeInTheDocument();
    });
  });
});
