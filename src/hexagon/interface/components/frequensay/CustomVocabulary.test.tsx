import CustomVocabulary from '@interface/components/frequensay/CustomVocabulary';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const mockAddManualVocabulary = false;
const mockDisableManualVocabulary = vi.fn();
const mockEnableManualVocabulary = vi.fn();
const mockUserAddedVocabulary = 'test';
const mockSetUserAddedVocabulary = vi.fn();

const defaultStateProps = {
  addManualVocabulary: mockAddManualVocabulary,
  disableManualVocabulary: mockDisableManualVocabulary,
  enableManualVocabulary: mockEnableManualVocabulary,
  userAddedVocabulary: mockUserAddedVocabulary,
  setUserAddedVocabulary: mockSetUserAddedVocabulary,
};

describe('customVocabulary', () => {
  it('should render', () => {
    render(<CustomVocabulary {...defaultStateProps} />);
    expect(screen.getByText('Add Extra Vocabulary')).toBeInTheDocument();
  });

  it('should render the correct button text when addManualVocabulary is true', () => {
    render(
      <CustomVocabulary {...defaultStateProps} addManualVocabulary={true} />,
    );
    expect(screen.getByText('Cancel Extra Vocabulary')).toBeInTheDocument();
  });

  it('should call the enableManualVocabulary function when the add button is clicked', async () => {
    render(<CustomVocabulary {...defaultStateProps} />);
    const addButton = screen.getByText('Add Extra Vocabulary');
    userEvent.click(addButton);
    await waitFor(() => {
      expect(mockEnableManualVocabulary).toHaveBeenCalled();
    });
  });

  it('should call the disableManualVocabulary function when the cancel button is clicked', async () => {
    render(
      <CustomVocabulary {...defaultStateProps} addManualVocabulary={true} />,
    );
    const cancelButton = screen.getByText('Cancel Extra Vocabulary');
    userEvent.click(cancelButton);
    await waitFor(() => {
      expect(mockDisableManualVocabulary).toHaveBeenCalled();
    });
  });

  it('should render the textarea when addManualVocabulary is true', () => {
    render(
      <CustomVocabulary {...defaultStateProps} addManualVocabulary={true} />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should not populate the textarea with userAddedVocabulary when addManualVocabulary is true', () => {
    render(
      <CustomVocabulary {...defaultStateProps} addManualVocabulary={true} />,
    );
    expect(screen.getByRole('textbox')).toHaveValue(mockUserAddedVocabulary);
  });
});
