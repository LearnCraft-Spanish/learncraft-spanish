import { SearchModeNav } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('component: SearchModeNav', () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all navigation options', () => {
      render(
        <SearchModeNav activeMode="filter" onModeChange={mockOnModeChange} />,
      );

      expect(screen.getByText('Filter Panel')).toBeInTheDocument();
      expect(screen.getByText('Search by Quiz')).toBeInTheDocument();
      expect(screen.getByText('Search by Text')).toBeInTheDocument();
      expect(screen.getByText('Search by IDs')).toBeInTheDocument();
      expect(screen.getByText('Search by Date')).toBeInTheDocument();
    });

    describe('active mode', () => {
      it('should mark the filter mode as checked when activeMode is "filter"', () => {
        render(
          <SearchModeNav activeMode="filter" onModeChange={mockOnModeChange} />,
        );

        const filterRadio = screen.getByDisplayValue('filter');
        expect(filterRadio).toBeChecked();
      });

      it('should only check one radio button at a time', () => {
        render(
          <SearchModeNav activeMode="quiz" onModeChange={mockOnModeChange} />,
        );

        const checkedRadios = screen
          .getAllByRole('radio')
          .filter((radio) => (radio as HTMLInputElement).checked);

        expect(checkedRadios).toHaveLength(1);
      });
    });

    describe('mode change interaction', () => {
      it('should call onModeChange with "filter" when filter option is clicked', () => {
        render(
          <SearchModeNav activeMode="text" onModeChange={mockOnModeChange} />,
        );

        const filterRadio = screen.getByDisplayValue('filter');
        fireEvent.click(filterRadio);

        expect(mockOnModeChange).toHaveBeenCalledTimes(1);
        expect(mockOnModeChange).toHaveBeenCalledWith('filter');
      });
    });
  });
});
