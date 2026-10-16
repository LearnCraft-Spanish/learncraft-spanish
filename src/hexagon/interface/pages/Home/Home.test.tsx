import type { JSX } from 'react';
import {
  mockUseHomeView,
  overrideMockUseHomeView,
  resetMockUseHomeView,
} from '@application/useCases/useHomeView.mock';
import { mockUseStudentUiVersion } from '@application/useCases/useStudentUiVersion.mock';
import Home from '@interface/pages/Home/Home';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useHomeView', () => ({
  useHomeView: mockUseHomeView,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock('@interface/pages/Home/HomeV2', () => ({
  HomeV2: () => <div data-testid="home-v2" />,
}));

function PathReadout(): JSX.Element {
  const { pathname } = useLocation();
  return <div data-testid="path">{pathname}</div>;
}

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
      <PathReadout />
    </MemoryRouter>,
  );
}

const limitedHome = {
  ctas: [{ headline: 'Audio Quiz', path: '/customquiz' }],
  entries: [
    {
      icon: 'trophy' as const,
      title: 'Official quizzes',
      meta: 'Test yourself against a lesson quiz',
      path: '/officialquizzes',
    },
  ],
};

describe('home page', () => {
  afterEach(() => {
    resetMockUseHomeView();
    cleanup();
  });

  it('renders HomeV2 for a student or staff using the app as a student', () => {
    overrideMockUseHomeView({ view: 'student' });

    renderHome();

    expect(screen.getByTestId('home-v2')).toBeInTheDocument();
  });

  it('gives a limited user an Audio Quiz CTA then an Official quizzes menu option, and nothing else', () => {
    overrideMockUseHomeView({ view: 'limited', ...limitedHome });

    renderHome();

    const [cta, entry, ...rest] = screen.getAllByRole('button');
    expect(cta).toHaveAccessibleName('Audio Quiz');
    expect(entry).toHaveAccessibleName(/^Official quizzes/);
    expect(rest).toEqual([]);
    expect(
      screen.queryByText("Today's suggested tool"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('home-v2')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('takes a limited user to the official quizzes from the menu option', async () => {
    const user = userEvent.setup();
    overrideMockUseHomeView({ view: 'limited', ...limitedHome });

    renderHome();
    await user.click(screen.getByRole('button', { name: /Official quizzes/ }));

    expect(screen.getByTestId('path')).toHaveTextContent('/officialquizzes');
  });

  it('takes a free user to the official quizzes from their only CTA', async () => {
    const user = userEvent.setup();
    overrideMockUseHomeView({
      view: 'free',
      ctas: [{ headline: 'Official Quizzes', path: '/officialquizzes' }],
    });

    renderHome();
    await user.click(screen.getByRole('button', { name: 'Official Quizzes' }));

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByTestId('path')).toHaveTextContent('/officialquizzes');
  });

  it('renders only coaching tools for a coach in the staff view', () => {
    overrideMockUseHomeView({ view: 'staffTools', showAdminTools: false });

    renderHome();

    expect(screen.getByText('Coaching Tools')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Weekly Records Interface' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Admin Tools')).not.toBeInTheDocument();
    expect(screen.queryByTestId('home-v2')).not.toBeInTheDocument();
  });

  it('adds admin tools for an admin in the staff view', () => {
    overrideMockUseHomeView({ view: 'staffTools', showAdminTools: true });

    renderHome();

    expect(screen.getByText('Admin Tools')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Database Tables' }),
    ).toBeInTheDocument();
  });

  it('leads the staff view with a Student Tools section linking to Custom Quiz and the Finder', () => {
    overrideMockUseHomeView({ view: 'staffTools', showAdminTools: false });

    renderHome();

    const headings = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(headings.slice(0, 2)).toEqual(['Student Tools', 'Coaching Tools']);
    expect(screen.getByRole('link', { name: 'Custom Quiz' })).toHaveAttribute(
      'href',
      '/customquiz',
    );
    expect(
      screen.getByRole('link', { name: 'Find Flashcards' }),
    ).toHaveAttribute('href', '/flashcardfinder');
  });

  it('lists Custom Quiz above Find Flashcards in Student Tools', () => {
    overrideMockUseHomeView({ view: 'staffTools', showAdminTools: false });

    renderHome();

    const linkNames = screen
      .getAllByRole('link')
      .map((link) => link.textContent);
    expect(linkNames.slice(0, 3)).toEqual([
      'Custom Quiz',
      'Find Flashcards',
      'FrequenSay',
    ]);
  });

  it('shows no other student tools in the staff view', () => {
    overrideMockUseHomeView({ view: 'staffTools', showAdminTools: true });

    renderHome();

    for (const name of [
      /Quiz My Flashcards/,
      /Manage My Flashcards/,
      /Official Quizzes/,
      /Audio Quiz/,
      /How to Use This App/,
    ]) {
      expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
    }
  });
});
