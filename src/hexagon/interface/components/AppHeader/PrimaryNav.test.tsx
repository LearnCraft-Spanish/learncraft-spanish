import { PrimaryNav } from '@interface/components/AppHeader/PrimaryNav';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import styles from './PrimaryNav.module.scss';

describe('primary nav', () => {
  it('renders a link for Home, Flashcard Finder, My flashcards, and Quizzes', () => {
    render(
      <MemoryRouter>
        <PrimaryNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Flashcard Finder' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'My flashcards' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Quizzes' })).toBeInTheDocument();
  });

  it('marks Home as the active link at the root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PrimaryNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass(
      styles.linkActive,
    );
  });

  it('marks a different link active without matching Home', () => {
    render(
      <MemoryRouter initialEntries={['/flashcardfinder']}>
        <PrimaryNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Flashcard Finder' })).toHaveClass(
      styles.linkActive,
    );
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass(
      styles.linkActive,
    );
  });
});
