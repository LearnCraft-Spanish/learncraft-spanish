import {
  mockUseStudentSearch,
  overrideMockUseStudentSearch,
  resetMockUseStudentSearch,
} from '@application/units/StudentSearch/useStudentSearch.mock';
import { StudentSearchComponent } from '@interface/components/StudentSearch';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockAppUserAbbreviationList } from '@testing/factories/appUserFactories';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useStudentSearch hook
vi.mock('@application/units/StudentSearch', () => ({
  useStudentSearch: () => mockUseStudentSearch,
}));

describe('component StudentSearchComponent', () => {
  const mockCloseMenu = vi.fn();
  const defaultProps = {
    closeMenu: mockCloseMenu,
  };

  beforeEach(() => {
    resetMockUseStudentSearch();
    mockCloseMenu.mockClear();
  });

  describe('rendering', () => {
    it('should render the search input', () => {
      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      expect(
        screen.getByPlaceholderText('Search for a student by name or email'),
      ).toBeInTheDocument();
    });

    it('should render the search input with current search string value', () => {
      overrideMockUseStudentSearch({
        searchString: 'john',
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      expect(screen.getByDisplayValue('john')).toBeInTheDocument();
    });

    it('should NOT render options when searchStudentOptions is empty', () => {
      overrideMockUseStudentSearch({
        searchStudentOptions: [],
        searchString: '',
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      expect(screen.queryByText('– Clear Selection –')).not.toBeInTheDocument();
    });

    it('should render options wrapper when searchStudentOptions has results', () => {
      const mockStudents = createMockAppUserAbbreviationList(2);
      overrideMockUseStudentSearch({
        searchStudentOptions: mockStudents,
        searchString: 'test',
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      expect(screen.getByText('– Clear Selection –')).toBeInTheDocument();
      // Check that search results are rendered by finding all search result items
      const searchResults = screen.getAllByRole('generic', {
        hidden: false,
      });
      const searchResultItems = searchResults.filter((el) =>
        el.className?.includes('searchResultItem'),
      );
      expect(searchResultItems.length).toBe(2);
    });

    it('should render student name and email when both are present', () => {
      const mockStudents = createMockAppUserAbbreviationList(1, {
        name: 'John Doe',
        emailAddress: 'john@example.com',
      });
      overrideMockUseStudentSearch({
        searchStudentOptions: mockStudents,
        searchString: 'john',
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      expect(screen.getByText(/John Doe -- /)).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    });
    it('should only render student email if name is not present', () => {
      const mockStudents = createMockAppUserAbbreviationList(1, {
        name: '',
        emailAddress: 'john@example.com',
      });
      overrideMockUseStudentSearch({
        searchStudentOptions: mockStudents,
        searchString: 'john',
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call setSearchString when user types in search input', async () => {
      const mockSetSearchString = vi.fn();
      overrideMockUseStudentSearch({
        setSearchString: mockSetSearchString,
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      const input = screen.getByPlaceholderText(
        'Search for a student by name or email',
      );
      await userEvent.type(input, 'test');

      await waitFor(() => {
        expect(mockSetSearchString).toHaveBeenCalledTimes(4); // 't', 'e', 's', 't'
      });
    });

    it('should call selectStudent with email when clicking on a student option', () => {
      const mockSelectStudent = vi.fn();
      const mockStudents = createMockAppUserAbbreviationList(1, {
        name: 'John Doe',
        emailAddress: 'john@example.com',
      });
      overrideMockUseStudentSearch({
        searchStudentOptions: mockStudents,
        searchString: 'john',
        selectStudent: mockSelectStudent,
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      const studentOption = screen.getByText(/john@example.com/);
      fireEvent.click(studentOption);

      expect(mockSelectStudent).toHaveBeenCalledWith('john@example.com');
    });

    it('should call selectStudent with null when clicking clear selection', () => {
      const mockSelectStudent = vi.fn();
      const mockStudents = createMockAppUserAbbreviationList(1);
      overrideMockUseStudentSearch({
        searchStudentOptions: mockStudents,
        searchString: 'test',
        selectStudent: mockSelectStudent,
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      const clearOption = screen.getByText('– Clear Selection –');
      fireEvent.click(clearOption);

      expect(mockSelectStudent).toHaveBeenCalledWith(null);
    });

    it('should handle onChange event for search input', () => {
      const mockSetSearchString = vi.fn();
      overrideMockUseStudentSearch({
        setSearchString: mockSetSearchString,
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      const input = screen.getByPlaceholderText(
        'Search for a student by name or email',
      );
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(mockSetSearchString).toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should display multiple student results correctly', () => {
      const mockStudents = createMockAppUserAbbreviationList(3);
      overrideMockUseStudentSearch({
        searchStudentOptions: mockStudents,
        searchString: 'student',
      });

      render(
        <MockAllProviders>
          <StudentSearchComponent {...defaultProps} />
        </MockAllProviders>,
      );

      // Check that all 3 students are rendered as search result items
      const searchResults = screen.getAllByRole('generic', {
        hidden: false,
      });
      const searchResultItems = searchResults.filter((el) =>
        el.className?.includes('searchResultItem'),
      );
      expect(searchResultItems.length).toBe(3);

      // Verify the clear selection option is present
      expect(screen.getByText('– Clear Selection –')).toBeInTheDocument();
    });
  });
});
