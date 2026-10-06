import type { CoachCapacityNotesPanelState } from '@application/useCases/useCoachCapacityTodayReport';
import { CoachCapacityNotesPanel } from '@interface/components/CoachCapacity/CoachCapacityNotesPanel';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

function panelState(
  overrides: Partial<CoachCapacityNotesPanelState> = {},
): CoachCapacityNotesPanelState {
  return {
    coachName: 'Coach Ana',
    draft: 'Prefers mornings',
    setDraft: vi.fn(),
    close: vi.fn(),
    save: vi.fn(async () => {}),
    isSaving: false,
    error: null,
    ...overrides,
  };
}

describe('coach capacity notes panel', () => {
  it('renders nothing while no coach’s notes are open', () => {
    render(<CoachCapacityNotesPanel {...panelState({ coachName: null })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the coach’s notes ready to edit', () => {
    render(<CoachCapacityNotesPanel {...panelState()} />);

    expect(
      screen.getByRole('dialog', { name: 'Notes: Coach Ana' }),
    ).toBeInTheDocument();
    const notes = screen.getByRole('textbox', { name: 'Notes for Coach Ana' });
    expect(notes).toHaveValue('Prefers mornings');
    expect(notes).toHaveFocus();
  });

  it('passes typed notes to the draft and saves on Save notes', () => {
    const state = panelState();
    render(<CoachCapacityNotesPanel {...state} />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Afternoons only' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save notes' }));

    expect(state.setDraft).toHaveBeenCalledWith('Afternoons only');
    expect(state.save).toHaveBeenCalledOnce();
  });

  it('closes on Cancel and on Escape', () => {
    const state = panelState();
    render(<CoachCapacityNotesPanel {...state} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });

    expect(state.close).toHaveBeenCalledTimes(2);
  });

  it('locks the panel while saving', () => {
    const state = panelState({ isSaving: true });
    render(<CoachCapacityNotesPanel {...state} />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(state.close).not.toHaveBeenCalled();
  });

  it('shows why a save failed', () => {
    render(
      <CoachCapacityNotesPanel
        {...panelState({ error: 'Notes could not be saved. Try again.' })}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Notes could not be saved. Try again.',
    );
  });
});
