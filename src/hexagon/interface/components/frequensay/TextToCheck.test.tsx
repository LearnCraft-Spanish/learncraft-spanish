import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TextToCheck from './TextToCheck';

const mockUserInput = '';
const mockUpdateUserInput = vi.fn();
const mockPassageLength = 0;
const mockComprehensionPercentage = 0;

const defaultProps = {
  userInput: mockUserInput,
  updateUserInput: mockUpdateUserInput,
  passageLength: mockPassageLength,
  comprehensionPercentage: mockComprehensionPercentage,
};

describe('textToCheck', () => {
  it('should render', () => {
    render(<TextToCheck {...defaultProps} />);

    expect(screen.getByText('Text to Check:')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue(mockUserInput);
    expect(
      screen.getByText(`Word Count: ${mockPassageLength}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Words Known: ${mockComprehensionPercentage}%`),
    ).toBeInTheDocument();
  });

  it('should call updateUserInput when the textarea value changes', async () => {
    render(<TextToCheck {...defaultProps} />);

    const textUserTypes = 'testing';

    const textarea = screen.getByRole('textbox');

    userEvent.type(textarea, textUserTypes);

    await waitFor(() => {
      expect(mockUpdateUserInput).toHaveBeenCalledTimes(textUserTypes.length);
    });
  });
});
