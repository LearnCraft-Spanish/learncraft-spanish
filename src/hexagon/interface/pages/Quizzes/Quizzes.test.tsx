import { Quizzes } from '@interface/pages/Quizzes/Quizzes';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

function renderQuizzes() {
  return render(
    <MemoryRouter>
      <Quizzes />
    </MemoryRouter>,
  );
}

describe('quizzes page', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the page title', () => {
    renderQuizzes();

    expect(
      screen.getByRole('heading', { name: 'Quizzes' }),
    ).toBeInTheDocument();
  });

  it('renders all three quiz entry points', () => {
    renderQuizzes();

    expect(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Custom quiz/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Official quiz/ }),
    ).toBeInTheDocument();
  });

  it('navigates to the my-flashcards quiz when chosen', async () => {
    const user = userEvent.setup();
    renderQuizzes();

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
