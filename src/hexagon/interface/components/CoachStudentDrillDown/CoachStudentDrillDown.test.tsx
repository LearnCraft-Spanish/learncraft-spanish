import CoachStudentDrillDown from '@interface/components/CoachStudentDrillDown/CoachStudentDrillDown';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock the DataDisplay component
vi.mock('@interface/components/CoachStudentDrillDown/DataDisplay', () => ({
  default: vi.fn(({ studentId }: { studentId: number }) => (
    <div data-testid="data-display" data-student-id={studentId}>
      DataDisplay
    </div>
  )),
}));

describe('component CoachStudentDrillDown', () => {
  it('should render with "Show Previous Coaches" button initially & not render DataDisplay initially', () => {
    // Act
    render(<CoachStudentDrillDown studentId={1} />);

    // Assert
    expect(
      screen.getByRole('button', { name: 'Show Previous Coaches' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('data-display')).not.toBeInTheDocument();
  });

  it('should toggle button text & display DataDisplay when clicked', () => {
    // Arrange
    render(<CoachStudentDrillDown studentId={1} />);
    const button = screen.getByRole('button', {
      name: 'Show Previous Coaches',
    });

    // Act
    fireEvent.click(button);

    // Assert
    expect(
      screen.getByRole('button', { name: 'Hide Previous Coaches' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('data-display')).toBeInTheDocument();
  });

  it('should hide DataDisplay when button is clicked twice', () => {
    // Arrange
    render(<CoachStudentDrillDown studentId={1} />);
    const button = screen.getByRole('button');

    // Act
    fireEvent.click(button); // Show
    fireEvent.click(button); // Hide

    // Assert
    expect(screen.queryByTestId('data-display')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show Previous Coaches' }),
    ).toBeInTheDocument();
  });
});
