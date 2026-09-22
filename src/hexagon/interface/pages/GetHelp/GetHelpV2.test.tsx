import { GetHelpV2 } from '@interface/pages/GetHelp/GetHelpV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

function renderGetHelp() {
  return render(
    <MemoryRouter>
      <GetHelpV2 />
    </MemoryRouter>,
  );
}

function renderGetHelpWithRoutes() {
  return render(
    <MemoryRouter initialEntries={['/get-help']}>
      <Routes>
        <Route path="/get-help" element={<GetHelpV2 />} />
        <Route path="/get-help/vocab" element={<div>Vocab lookup page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('get help hub v2', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the page title', () => {
    renderGetHelp();

    expect(
      screen.getByRole('heading', { name: 'Help & walkthroughs' }),
    ).toBeInTheDocument();
  });

  it('renders all three help entry points', () => {
    renderGetHelp();

    expect(
      screen.getByRole('button', { name: /Vocab lookup/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Getting started with the app/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Using search features/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /Recommended daily routine/,
      }),
    ).toBeInTheDocument();
  });

  it('navigates to /get-help/vocab when vocab lookup is chosen', async () => {
    const user = userEvent.setup();
    renderGetHelpWithRoutes();

    await user.click(screen.getByRole('button', { name: /Vocab lookup/ }));

    expect(screen.getByText('Vocab lookup page')).toBeInTheDocument();
  });

  it('opens the getting-started video in a new tab', () => {
    renderGetHelp();

    const link = screen.getByRole('link', {
      name: /Getting started with the app/,
    });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens the flashcard-finder video in a new tab', () => {
    renderGetHelp();

    const link = screen.getByRole('link', {
      name: /Flashcard finder & custom quizzing/,
    });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
