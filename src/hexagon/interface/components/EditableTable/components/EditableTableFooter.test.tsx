import { EditableTableFooter } from '@interface/components/EditableTable/components/EditableTableFooter';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('editableTableFooter', () => {
  it('should not render when no handlers are provided', () => {
    const { container } = render(
      <EditableTableFooter hasUnsavedChanges isValid isSaving={false} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show validation error hint and disable save button when invalid', () => {
    render(
      <EditableTableFooter
        hasUnsavedChanges
        isValid={false}
        isSaving={false}
        onSave={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Please fix validation errors before saving'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('should show unsaved changes hint and enable buttons when valid with changes', () => {
    render(
      <EditableTableFooter
        hasUnsavedChanges
        isValid
        isSaving={false}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />,
    );

    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard' })).not.toBeDisabled();
  });

  it('should disable both buttons when no unsaved changes', () => {
    render(
      <EditableTableFooter
        hasUnsavedChanges={false}
        isValid
        isSaving={false}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
  });

  it('should show saving state and disable buttons when saving', () => {
    render(
      <EditableTableFooter
        hasUnsavedChanges
        isValid
        isSaving
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
  });

  it('should call onSave and onDiscard when buttons are clicked', async () => {
    const user = userEvent.setup();
    const mockOnSave = vi.fn().mockResolvedValue(undefined);
    const mockOnDiscard = vi.fn();

    render(
      <EditableTableFooter
        hasUnsavedChanges
        isValid
        isSaving={false}
        onSave={mockOnSave}
        onDiscard={mockOnDiscard}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(mockOnSave).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(mockOnDiscard).toHaveBeenCalledTimes(1);
  });
});
