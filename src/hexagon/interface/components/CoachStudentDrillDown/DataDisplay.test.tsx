import {
  mockUseAllCoachesByStudent,
  overrideMockUseAllCoachesByStudent,
  resetMockUseAllCoachesByStudent,
} from '@application/queries/CoachQueries/useAllCoachesByStudent.mock';
import DataDisplay from '@interface/components/CoachStudentDrillDown/DataDisplay';
import { render, screen, waitFor } from '@testing-library/react';
import { createMockCoachCallCountList } from '@testing/factories/coachFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useAllCoachesByStudent hook
vi.mock('@application/queries/CoachQueries/useAllCoachesByStudent', () => ({
  useAllCoachesByStudent: mockUseAllCoachesByStudent,
}));

describe('component DataDisplay', () => {
  beforeEach(() => {
    resetMockUseAllCoachesByStudent();
  });

  it('should render loading state', async () => {
    // Arrange
    overrideMockUseAllCoachesByStudent({
      data: undefined,
      isLoading: true,
      error: null,
    });

    // Act
    render(<DataDisplay studentId={1} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Loading coach data...')).toBeInTheDocument();
    });
  });

  it('should render error state', () => {
    // Arrange
    const errorMessage = 'Failed to fetch coaches';
    overrideMockUseAllCoachesByStudent({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
    });

    // Act
    render(<DataDisplay studentId={1} />);

    // Assert
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('should render coach data correctly', () => {
    // Arrange
    const mockCoaches = createMockCoachCallCountList(2);
    overrideMockUseAllCoachesByStudent({
      data: mockCoaches,
      isLoading: false,
      error: null,
    });

    // Act
    const { container } = render(<DataDisplay studentId={1} />);

    // Assert
    const coachContainers = container.querySelectorAll('.coach-item-container');
    expect(coachContainers).toHaveLength(2);

    // Check that coach labels are present
    expect(screen.getAllByText('Coach:')).toHaveLength(2);
    expect(screen.getAllByText('Private Calls:')).toHaveLength(2);
    expect(screen.getAllByText('Group Calls:')).toHaveLength(2);
  });

  it('should render "No previous coach data found" when data is empty array', () => {
    // Arrange
    overrideMockUseAllCoachesByStudent({
      data: [],
      isLoading: false,
      error: null,
    });

    // Act
    render(<DataDisplay studentId={1} />);

    // Assert
    expect(
      screen.getByText('No previous coach data found'),
    ).toBeInTheDocument();
  });

  it('should render "No previous coach data found" when data is undefined', () => {
    // Arrange
    overrideMockUseAllCoachesByStudent({
      data: undefined,
      isLoading: false,
      error: null,
    });

    // Act
    render(<DataDisplay studentId={1} />);

    // Assert
    expect(
      screen.getByText('No previous coach data found'),
    ).toBeInTheDocument();
  });
});
