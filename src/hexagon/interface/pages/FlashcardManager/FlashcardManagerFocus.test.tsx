import type { JSX } from 'react';
import {
  mockUseFlashcardManager,
  resetMockUseFlashcardManager,
} from '@application/useCases/useFlashcardManager/useFlashcardManager.mock';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { FlashcardManagerV2 } from '@interface/pages/FlashcardManager/FlashcardManagerV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Focus, end to end, against the real results section and bottom bar. The
 * mocked suite next door can only prove the page asked; this proves where a
 * keyboard user actually ends up. Every action here destroys the control that
 * ran it, and without recovery the browser drops focus on `<body>` — above the
 * filter card and up to a page of rows from where the student was standing.
 */

vi.mock('@application/useCases/useFlashcardManager', () => ({
  default: mockUseFlashcardManager,
}));

vi.mock('@interface/hooks/useModal', () => ({
  useModal: () => ({ openModal: vi.fn(), closeModal: vi.fn() }),
}));

function renderManagerV2(): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={['/manage-flashcards']}>
      <ContextualMenuProvider>
        <FlashcardManagerV2 />
      </ContextualMenuProvider>
    </MemoryRouter>,
  );
}

function resultsRegion(): HTMLElement {
  return screen.getByRole('group', { name: 'Flashcard manager results' });
}

function BodyProbe(): JSX.Element {
  return <button type="button">outside</button>;
}

describe('flashcard manager v2 focus after a destructive action', () => {
  afterEach(() => {
    resetMockUseFlashcardManager();
    cleanup();
  });

  it('does not steal focus on first render', () => {
    render(
      <MemoryRouter initialEntries={['/manage-flashcards']}>
        <ContextualMenuProvider>
          <BodyProbe />
          <FlashcardManagerV2 />
        </ContextualMenuProvider>
      </MemoryRouter>,
    );

    expect(document.activeElement).toBe(document.body);
  });

  it('lands focus on the results region after a row Remove', async () => {
    const user = userEvent.setup();
    renderManagerV2();

    // The row that holds this button is about to leave the collection.
    await user.click(
      screen.getAllByRole('button', {
        name: /Remove .+ from your collection/,
      })[0],
    );

    expect(document.activeElement).toBe(resultsRegion());
  });

  it('lands focus on the results region after a bulk Remove', async () => {
    const user = userEvent.setup();
    renderManagerV2();

    await user.click(screen.getByRole('button', { name: 'Select all 25' }));
    await user.click(screen.getByRole('button', { name: 'Remove flashcards' }));

    expect(
      await screen.findByText('25 flashcards removed from your collection.'),
    ).toBeInTheDocument();
    expect(document.activeElement).toBe(resultsRegion());
  });

  it('lands focus on the results region after Clear selection', async () => {
    const user = userEvent.setup();
    renderManagerV2();

    await user.click(screen.getByRole('button', { name: 'Select all 25' }));
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(
      screen.queryByRole('button', { name: 'Clear selection' }),
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(resultsRegion());
  });

  it('leaves focus alone when a non-destructive control is used', async () => {
    const user = userEvent.setup();
    renderManagerV2();

    const selectAll = screen.getByRole('button', { name: 'Select all 25' });
    await user.click(selectAll);

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Deselect all' }),
    );
  });

  it('announces the removal through a live region that was already mounted', async () => {
    const user = userEvent.setup();
    renderManagerV2();

    // Empty and mounted before the action, so the text arriving is a change a
    // screen reader will read out rather than a region appearing fully formed.
    const region = screen.getByRole('status');
    expect(region).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: 'Select all 25' }));
    await user.click(screen.getByRole('button', { name: 'Remove flashcards' }));

    expect(await screen.findByRole('status')).toBe(region);
    expect(region).toHaveTextContent(
      '25 flashcards removed from your collection.',
    );
  });
});
