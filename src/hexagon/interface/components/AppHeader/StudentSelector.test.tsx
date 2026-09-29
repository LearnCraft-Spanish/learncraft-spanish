import type { JSX } from 'react';
import {
  mockUseStudentSelector,
  overrideMockUseStudentSelector,
  resetMockUseStudentSelector,
} from '@application/useCases/useStudentSelector/useStudentSelector.mock';
import { StudentSelector } from '@interface/components/AppHeader/StudentSelector';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useStudentSelector', () => ({
  useStudentSelector: mockUseStudentSelector,
}));

const ana = { name: 'Ana Ruiz', emailAddress: 'ana@fake.not' };

function PathReadout(): JSX.Element {
  const { pathname } = useLocation();
  return <div data-testid="path">{pathname}</div>;
}

function renderSelector({
  open = true,
  onClose = vi.fn(),
  path = '/weeklyrecords',
}: { open?: boolean; onClose?: () => void; path?: string } = {}) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <StudentSelector
        open={open}
        onClose={onClose}
        trigger={<button type="button">trigger</button>}
      />
      <PathReadout />
    </MemoryRouter>,
  );
  return { onClose };
}

describe('component StudentSelector', () => {
  afterEach(() => {
    resetMockUseStudentSelector();
  });

  it('renders only the trigger while closed', () => {
    renderSelector({ open: false });

    expect(screen.getByRole('button', { name: 'trigger' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('prompts for a search when opened from the staff view', () => {
    renderSelector();

    expect(
      screen.getByRole('dialog', { name: 'Use as student' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Type a name or email to find a student.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Exit student view' }),
    ).not.toBeInTheDocument();
  });

  it('forwards typing to the search', async () => {
    renderSelector();

    await userEvent.type(screen.getByLabelText('Find a student'), 'a');

    expect(mockUseStudentSelector().setSearchTerm).toHaveBeenCalledWith('a');
  });

  it('lists matching students by name and email', () => {
    overrideMockUseStudentSelector({ searchTerm: 'ana', options: [ana] });

    renderSelector();

    const option = screen.getByRole('button', { name: /Ana Ruiz/ });
    expect(option).toHaveTextContent('ana@fake.not');
  });

  it('says so when nothing matches', () => {
    overrideMockUseStudentSelector({ searchTerm: 'zzz', options: [] });

    renderSelector();

    expect(screen.getByText('No students match “zzz”.')).toBeInTheDocument();
  });

  it('closes and goes home after a student is picked', async () => {
    const selectStudent = vi.fn(async () => true);
    overrideMockUseStudentSelector({
      searchTerm: 'ana',
      options: [ana],
      selectStudent,
    });
    const { onClose } = renderSelector();

    await userEvent.click(screen.getByRole('button', { name: /Ana Ruiz/ }));

    expect(selectStudent).toHaveBeenCalledWith(ana);
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/);
  });

  it('stays open on the same page when a pick is rejected', async () => {
    overrideMockUseStudentSelector({
      searchTerm: 'ana',
      options: [ana],
      selectStudent: vi.fn(async () => false),
      error:
        "Ana Ruiz doesn't have full student access, so you can't use the app as them.",
    });
    const { onClose } = renderSelector();

    await userEvent.click(screen.getByRole('button', { name: /Ana Ruiz/ }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      "doesn't have full student access",
    );
    expect(screen.getByTestId('path')).toHaveTextContent('/weeklyrecords');
  });

  it('offers exit while using the app as a student, and goes home', async () => {
    const exitUsingAsStudent = vi.fn();
    overrideMockUseStudentSelector({
      isUsingAsStudent: true,
      exitUsingAsStudent,
    });
    const { onClose } = renderSelector({ path: '/flashcardfinder' });

    expect(
      screen.getByRole('dialog', { name: 'Change student' }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Exit student view' }),
    );

    expect(exitUsingAsStudent).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/);
  });

  it('clears the error when dismissed with Escape', async () => {
    const clearError = vi.fn();
    overrideMockUseStudentSelector({ clearError });
    const { onClose } = renderSelector();

    await userEvent.keyboard('{Escape}');

    expect(clearError).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
