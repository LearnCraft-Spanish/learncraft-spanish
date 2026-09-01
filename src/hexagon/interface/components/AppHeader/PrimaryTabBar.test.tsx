import { PrimaryTabBar } from '@interface/components/AppHeader/PrimaryTabBar';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

function renderWithRoutes(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<PrimaryTabBar />} />
        <Route path="/flashcardfinder" element={<PrimaryTabBar />} />
        <Route path="/quizzes" element={<PrimaryTabBar />} />
        <Route path="/manage-flashcards" element={<PrimaryTabBar />} />
        <Route path="/manage-flashcards/sub" element={<PrimaryTabBar />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('primary tab bar', () => {
  it('renders a tab for Home, Finder, Quiz, and Cards', () => {
    renderWithRoutes('/');

    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finder' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quiz' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cards' })).toBeInTheDocument();
  });

  it('marks Home active at the root path only', () => {
    renderWithRoutes('/');

    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Cards' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marks Cards active on the flashcard manager route', () => {
    renderWithRoutes('/manage-flashcards');

    expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('marks Cards active on a nested flashcard manager route', () => {
    renderWithRoutes('/manage-flashcards/sub');

    expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('navigates when a tab is chosen', async () => {
    const user = userEvent.setup();
    renderWithRoutes('/');

    await user.click(screen.getByRole('button', { name: 'Cards' }));

    expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
