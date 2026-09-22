import { Quizzes } from '@interface/pages/Quizzes/Quizzes';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

function renderQuizzes() {
  return render(
    <MemoryRouter>
      <Quizzes />
    </MemoryRouter>,
  );
}

function renderQuizzesWithRoutes() {
  return render(
    <MemoryRouter initialEntries={['/quizzes']}>
      <Routes>
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/myflashcards" element={<div>My flashcards page</div>} />
        <Route path="/customquiz" element={<div>Custom quiz page</div>} />
        <Route
          path="/officialquizzes"
          element={<div>Official quizzes page</div>}
        />
      </Routes>
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

  it('navigates to /myflashcards when the my-flashcards quiz is chosen', async () => {
    const user = userEvent.setup();
    renderQuizzesWithRoutes();

    await user.click(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    );

    expect(screen.getByText('My flashcards page')).toBeInTheDocument();
  });

  it('navigates to /customquiz when the custom quiz is chosen', async () => {
    const user = userEvent.setup();
    renderQuizzesWithRoutes();

    await user.click(screen.getByRole('button', { name: /Custom quiz/ }));

    expect(screen.getByText('Custom quiz page')).toBeInTheDocument();
  });

  it('navigates to /officialquizzes when the official quiz is chosen', async () => {
    const user = userEvent.setup();
    renderQuizzesWithRoutes();

    await user.click(screen.getByRole('button', { name: /Official quiz/ }));

    expect(screen.getByText('Official quizzes page')).toBeInTheDocument();
  });
});
