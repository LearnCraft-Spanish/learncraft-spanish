import {
  mockUseHomeView,
  overrideMockUseHomeView,
  resetMockUseHomeView,
} from '@application/useCases/useHomeView.mock';
import { mockUseStudentUiVersion } from '@application/useCases/useStudentUiVersion.mock';
import Home from '@interface/pages/Home/Home';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useHomeView', () => ({
  useHomeView: mockUseHomeView,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock('src/sections/Menu', () => ({
  default: () => <div data-testid="legacy-menu" />,
}));

vi.mock('@interface/pages/Home/HomeV2', () => ({
  HomeV2: () => <div data-testid="home-v2" />,
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );
}

describe('home page', () => {
  afterEach(() => {
    resetMockUseHomeView();
    cleanup();
  });

  it('renders the legacy Menu when the student UI is v1', () => {
    renderHome();

    expect(screen.getByTestId('legacy-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('home-v2')).not.toBeInTheDocument();
  });

  it('renders HomeV2 for a v2 student or staff using the app as a student', () => {
    overrideMockUseHomeView({ view: 'studentV2' });

    renderHome();

    expect(screen.getByTestId('home-v2')).toBeInTheDocument();
    expect(screen.queryByTestId('legacy-menu')).not.toBeInTheDocument();
  });

  it('renders only coaching tools for a coach in the staff view', () => {
    overrideMockUseHomeView({ view: 'staffTools', showAdminTools: false });

    renderHome();

    expect(screen.getByText('Coaching Tools')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Weekly Records Interface' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Admin Tools')).not.toBeInTheDocument();
    expect(screen.queryByTestId('legacy-menu')).not.toBeInTheDocument();
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

  it('never shows student tools in the staff view', () => {
    overrideMockUseHomeView({ view: 'staffTools', showAdminTools: true });

    renderHome();

    for (const name of [
      /Quiz My Flashcards/,
      /Manage My Flashcards/,
      /Official Quizzes/,
      /Custom Quiz/,
      /Audio Quiz/,
      /Find Flashcards/,
      /How to Use This App/,
    ]) {
      expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
    }
  });
});
