import type { UseHomeScreenReturn } from '@application/useCases/useHomeScreen';
import {
  mockUseHomeScreen,
  overrideMockUseHomeScreen,
  resetMockUseHomeScreen,
} from '@application/useCases/useHomeScreen/useHomeScreen.mock';
import { DEFAULT_HOME_PRESET } from '@domain/homePresets/homePresets';
import { HomeV2 } from '@interface/pages/Home/HomeV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useHomeScreen', () => ({
  useHomeScreen: mockUseHomeScreen,
  default: mockUseHomeScreen,
}));

vi.mock('@interface/components/Loading', () => ({
  Loading: ({ message }: { message: string }) => <div>{message}</div>,
}));

const readyPreset: UseHomeScreenReturn = {
  cta: {
    headline: 'Official Quiz',
    eyebrow: "Today's suggested tool",
    path: '/officialquizzes',
  },
  entries: [
    {
      icon: 'brain',
      title: 'Quiz my flashcards',
      meta: "Review the cards you've saved",
      path: '/myflashcards',
    },
    {
      icon: 'checklist',
      title: 'Custom quiz',
      meta: 'Build a quiz from any lesson range',
      path: '/customquiz',
    },
    {
      icon: 'search',
      title: 'Flashcard Finder',
      meta: 'Search the full course catalog',
      path: '/flashcardfinder',
    },
  ],
  isLoading: false,
  error: null,
};

function renderHome() {
  return render(
    <MemoryRouter>
      <HomeV2 />
    </MemoryRouter>,
  );
}

function renderHomeWithRoutes() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomeV2 />} />
        <Route
          path="/officialquizzes"
          element={<div>Official quizzes page</div>}
        />
        <Route path="/myflashcards" element={<div>My flashcards page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('home v2', () => {
  afterEach(() => {
    resetMockUseHomeScreen();
    cleanup();
  });

  it('shows a loading state while the home screen resolves', () => {
    overrideMockUseHomeScreen({
      cta: DEFAULT_HOME_PRESET.cta,
      entries: DEFAULT_HOME_PRESET.entries,
      isLoading: true,
      error: null,
    });

    renderHome();

    expect(screen.getByText('Loading home...')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Official Quiz/ }),
    ).not.toBeInTheDocument();
  });

  it('renders the CTA from the resolved preset', () => {
    overrideMockUseHomeScreen(readyPreset);
    renderHome();

    expect(
      screen.getByRole('button', { name: /Official Quiz/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Today's suggested tool")).toBeInTheDocument();
  });

  it('renders the preset entries in order', () => {
    overrideMockUseHomeScreen(readyPreset);
    renderHome();

    expect(screen.getByText('Quiz my flashcards')).toBeInTheDocument();
    expect(screen.getByText('Custom quiz')).toBeInTheDocument();
    expect(screen.getByText('Flashcard Finder')).toBeInTheDocument();
  });

  it('renders the help row', () => {
    overrideMockUseHomeScreen(readyPreset);
    renderHome();

    expect(screen.getByText('Help & walkthroughs')).toBeInTheDocument();
  });

  it('navigates to the CTA path when the CTA is chosen', async () => {
    const user = userEvent.setup();
    overrideMockUseHomeScreen(readyPreset);
    renderHomeWithRoutes();

    await user.click(screen.getByRole('button', { name: /Official Quiz/ }));

    expect(screen.getByText('Official quizzes page')).toBeInTheDocument();
  });

  it('navigates to an entry path when that entry is chosen', async () => {
    const user = userEvent.setup();
    overrideMockUseHomeScreen(readyPreset);
    renderHomeWithRoutes();

    await user.click(
      screen.getByRole('button', { name: /Quiz my flashcards/ }),
    );

    expect(screen.getByText('My flashcards page')).toBeInTheDocument();
  });
});
