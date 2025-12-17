import { Filters } from '@interface/components/ExampleSearchInterface/Filters/Filters';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock all the filter components
vi.mock(
  '@interface/components/ExampleSearchInterface/Filters/LocalFilterPanel',
  () => ({
    LocalFilterPanel: () => <div>Local Filter Panel</div>,
  }),
);

vi.mock(
  '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz',
  () => ({
    SearchByQuiz: () => <div>Search By Quiz</div>,
  }),
);

vi.mock(
  '@interface/components/ExampleSearchInterface/Filters/SearchByText',
  () => ({
    SearchByText: () => <div>Search By Text</div>,
  }),
);

vi.mock(
  '@interface/components/ExampleSearchInterface/Filters/SearchByIds',
  () => ({
    SearchByIds: () => <div>Search By Ids</div>,
  }),
);

describe('component: Filters', () => {
  const mockProps = {
    localFilterProps: {} as any,
    searchByQuizProps: {} as any,
    searchByTextProps: {} as any,
    searchByIdsProps: {} as any,
  };

  describe('mode routing', () => {
    it('should render LocalFilterPanel when mode is "filter"', () => {
      render(<Filters mode="filter" {...mockProps} />);

      expect(screen.getByText('Local Filter Panel')).toBeInTheDocument();
    });

    it('should render SearchByQuiz when mode is "quiz"', () => {
      render(<Filters mode="quiz" {...mockProps} />);

      expect(screen.getByText('Search By Quiz')).toBeInTheDocument();
    });

    it('should render SearchByText when mode is "text"', () => {
      render(<Filters mode="text" {...mockProps} />);

      expect(screen.getByText('Search By Text')).toBeInTheDocument();
    });

    it('should render SearchByIds when mode is "ids"', () => {
      render(<Filters mode="ids" {...mockProps} />);

      expect(screen.getByText('Search By Ids')).toBeInTheDocument();
    });

    it('should render error message for invalid mode', () => {
      render(<Filters mode={'invalid' as any} {...mockProps} />);

      expect(screen.getByText('ERROR: Invalid mode')).toBeInTheDocument();
    });
  });

  describe('mode exclusivity', () => {
    it('should only render one filter component at a time', () => {
      const { rerender } = render(<Filters mode="filter" {...mockProps} />);

      expect(screen.getByText('Local Filter Panel')).toBeInTheDocument();
      expect(screen.queryByText('Search By Quiz')).not.toBeInTheDocument();
      expect(screen.queryByText('Search By Text')).not.toBeInTheDocument();
      expect(screen.queryByText('Search By Ids')).not.toBeInTheDocument();

      rerender(<Filters mode="text" {...mockProps} />);

      expect(screen.queryByText('Local Filter Panel')).not.toBeInTheDocument();
      expect(screen.getByText('Search By Text')).toBeInTheDocument();
    });
  });
});
