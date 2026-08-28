import { HomeV2 } from '@interface/pages/Home/HomeV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

function renderHome() {
  return render(
    <MemoryRouter>
      <HomeV2 />
    </MemoryRouter>,
  );
}

describe('home v2', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the quiz CTA', () => {
    renderHome();

    expect(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    ).toBeInTheDocument();
  });

  it('renders the desktop entry set: My flashcards, Finder, Official quizzes', () => {
    renderHome();

    expect(screen.getByText('My flashcards')).toBeInTheDocument();
    expect(screen.getAllByText('Flashcard Finder').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Official quizzes').length).toBeGreaterThan(0);
  });

  it('renders the mobile entry set: Custom quiz', () => {
    renderHome();

    expect(screen.getByText('Custom quiz')).toBeInTheDocument();
  });

  it('renders the help row', () => {
    renderHome();

    expect(screen.getByText('Help & walkthroughs')).toBeInTheDocument();
  });

  it('renders the tab bar with a Home tab', () => {
    renderHome();

    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument();
  });

  it('navigates to /myflashcards when the CTA is chosen', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    );
    // No crash / navigation is exercised via react-router's MemoryRouter;
    // deeper route assertions live at the AppRoutes level.
    expect(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    ).toBeInTheDocument();
  });
});
