import {
  mockUseStudentSearch,
  resetMockUseStudentSearch,
} from '@application/units/StudentSearch/useStudentSearch.mock';
import {
  mockUseSubHeader,
  overrideMockUseSubHeader,
  resetMockUseSubHeader,
} from '@application/units/SubHeader/useSubHeader.mock';
import { SubHeaderComponent } from '@interface/components/SubHeader';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useSubHeader hook
vi.mock('@application/units/SubHeader', () => ({
  useSubHeader: () => mockUseSubHeader,
}));

// Mock the StudentSearchComponent's hook
vi.mock('@application/units/StudentSearch', () => ({
  useStudentSearch: () => mockUseStudentSearch,
}));

describe('component SubHeaderComponent', () => {
  beforeEach(() => {
    resetMockUseSubHeader();
    resetMockUseStudentSearch();
  });

  describe('not logged in state', () => {
    it('should show "You must be logged in" message when not logged in', () => {
      overrideMockUseSubHeader({
        notLoggedIn: true,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(
        screen.getByText('You must be logged in to use this app.'),
      ).toBeInTheDocument();
    });
  });

  describe('logging in state', () => {
    it('should show "Logging In..." message when logging in', () => {
      overrideMockUseSubHeader({
        loggingIn: true,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(screen.getByText('Logging In...')).toBeInTheDocument();
    });
  });

  describe('loading user data state', () => {
    it('should show "Loading user data..." when authenticated and loading student', () => {
      overrideMockUseSubHeader({
        isAuthenticated: true,
        activeStudentLoading: true,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(screen.getByText('Loading user data...')).toBeInTheDocument();
    });
  });

  describe('free user state', () => {
    it('should show "Welcome back!" message for free users', () => {
      overrideMockUseSubHeader({
        freeUser: true,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    });
  });

  describe('student user state', () => {
    it('should show welcome message with student name', () => {
      const mockStudent = createMockAppUser({
        name: 'John Doe',
      });

      overrideMockUseSubHeader({
        studentUser: true,
        appUser: mockStudent,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument();
    });
  });

  describe('coach/admin state - student selector closed', () => {
    it('should show current student name when student is selected', () => {
      const mockStudent = createMockAppUser({
        name: 'Jane Smith',
      });

      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: false,
        appUser: mockStudent,
        isOwnUser: false,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(screen.getByText(/Using as Jane Smith/)).toBeInTheDocument();
    });

    it('should show "(yourself)" indicator when viewing own data', () => {
      const mockStudent = createMockAppUser({
        name: 'Jane Smith',
      });

      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: false,
        appUser: mockStudent,
        isOwnUser: true,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(
        screen.getByText(/Using as Jane Smith \(yourself\)/),
      ).toBeInTheDocument();
    });

    it('should show "No student Selected" when no student is selected', () => {
      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: false,
        appUser: null,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(screen.getByText('No student Selected')).toBeInTheDocument();
    });

    it('should render "Change" button when selector is closed', () => {
      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: false,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      const changeButton = screen.getByRole('button', { name: 'Change' });
      expect(changeButton).toBeInTheDocument();
    });

    it('should call setStudentSelectorOpen(true) when Change button is clicked', () => {
      const mockSetStudentSelectorOpen = vi.fn();
      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: false,
        setStudentSelectorOpen: mockSetStudentSelectorOpen,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      const changeButton = screen.getByRole('button', { name: 'Change' });
      fireEvent.click(changeButton);

      expect(mockSetStudentSelectorOpen).toHaveBeenCalledWith(true);
    });
  });

  describe('coach/admin state - student selector open', () => {
    it('should render StudentSearchComponent when selector is open', () => {
      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: true,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      // StudentSearchComponent should render its search input
      expect(
        screen.getByPlaceholderText('Search for a student by name or email'),
      ).toBeInTheDocument();
    });

    it('should render "Cancel" and "Clear Selection" buttons when selector is open', () => {
      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: true,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Clear Selection' }),
      ).toBeInTheDocument();
    });

    it('should call setStudentSelectorOpen(false) when Cancel button is clicked', () => {
      const mockSetStudentSelectorOpen = vi.fn();
      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: true,
        setStudentSelectorOpen: mockSetStudentSelectorOpen,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(mockSetStudentSelectorOpen).toHaveBeenCalledWith(false);
    });

    it('should call clearSelection when Clear Selection button is clicked', () => {
      const mockClearSelection = vi.fn();
      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: true,
        clearSelection: mockClearSelection,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      const clearButton = screen.getByRole('button', {
        name: 'Clear Selection',
      });
      fireEvent.click(clearButton);

      expect(mockClearSelection).toHaveBeenCalled();
    });

    it('should not render "Change" button when selector is open', () => {
      overrideMockUseSubHeader({
        isCoachOrAdmin: true,
        studentSelectorOpen: true,
      });

      render(
        <MockAllProviders>
          <SubHeaderComponent />
        </MockAllProviders>,
      );

      expect(
        screen.queryByRole('button', { name: 'Change' }),
      ).not.toBeInTheDocument();
    });
  });
});
