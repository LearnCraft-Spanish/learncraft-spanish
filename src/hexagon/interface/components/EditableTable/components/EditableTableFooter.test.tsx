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

  it('shows only the Save button when only onSave is provided', () => {
    render(
      <EditableTableFooter
        hasUnsavedChanges
        isValid
        isSaving={false}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Discard' }),
    ).not.toBeInTheDocument();
  });

  it('shows only the Discard button when only onDiscard is provided', () => {
    render(
      <EditableTableFooter
        hasUnsavedChanges
        isValid
        isSaving={false}
        onDiscard={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Discard' })).toBeEnabled();
    expect(
      screen.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument();
  });

  it('shows no hint when the table is valid and has no unsaved changes', () => {
    render(
      <EditableTableFooter
        hasUnsavedChanges={false}
        isValid
        isSaving={false}
        onSave={vi.fn()}
      />,
    );

    expect(
      screen.queryByText('You have unsaved changes'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Please fix validation errors before saving'),
    ).not.toBeInTheDocument();
  });

  it('shows only the validation hint, not the unsaved changes hint, when invalid', () => {
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
    expect(
      screen.queryByText('You have unsaved changes'),
    ).not.toBeInTheDocument();
  });

  it('lets the user discard invalid changes', async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();
    render(
      <EditableTableFooter
        hasUnsavedChanges
        isValid={false}
        isSaving={false}
        onSave={vi.fn()}
        onDiscard={onDiscard}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Discard' }));

    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('does not call onSave when Save is disabled', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <EditableTableFooter
        hasUnsavedChanges
        isValid={false}
        isSaving={false}
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).not.toHaveBeenCalled();
  });
});
