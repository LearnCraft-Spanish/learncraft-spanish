import { CreateTableFooter } from '@interface/components/CreateTable/CreateTableFooter';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('createTableFooter component', () => {
  it('should not render when no handlers are provided', () => {
    const { container } = render(
      <CreateTableFooter hasData isValid isSaving={false} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show validation error hint and disable save button when invalid', () => {
    render(
      <CreateTableFooter
        hasData
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

  it('should show ready to save hint and enable buttons when valid with data', () => {
    render(
      <CreateTableFooter
        hasData
        isValid
        isSaving={false}
        onSave={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText('Ready to save')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).not.toBeDisabled();
  });

  it('should show add data hint and disable buttons when no data', () => {
    render(
      <CreateTableFooter
        hasData={false}
        isValid
        isSaving={false}
        onSave={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Add data to the table to save'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  it('should show saving state and disable buttons when saving', () => {
    render(
      <CreateTableFooter
        hasData
        isValid
        isSaving
        onSave={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  it('should call onSave when save button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSave = vi.fn().mockResolvedValue(undefined);

    render(
      <CreateTableFooter
        hasData
        isValid
        isSaving={false}
        onSave={mockOnSave}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('should call onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnReset = vi.fn();

    render(
      <CreateTableFooter
        hasData
        isValid
        isSaving={false}
        onReset={mockOnReset}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should render only save button when onReset is not provided', () => {
    render(
      <CreateTableFooter hasData isValid isSaving={false} onSave={vi.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  });

  it('should render only reset button when onSave is not provided', () => {
    render(
      <CreateTableFooter hasData isValid isSaving={false} onReset={vi.fn()} />,
    );

    expect(
      screen.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});
