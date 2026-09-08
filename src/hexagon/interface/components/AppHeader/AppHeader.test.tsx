import {
  mockUseAppHeader,
  overrideMockUseAppHeader,
  resetMockUseAppHeader,
} from '@application/useCases/AppHeader/useAppHeader.mock';
import { AppHeader } from '@interface/components/AppHeader/AppHeader';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/AppHeader', () => ({
  useAppHeader: () => mockUseAppHeader,
}));

function renderHeader(children?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AppHeader>{children}</AppHeader>
    </MemoryRouter>,
  );
}

describe('component AppHeader', () => {
  beforeEach(() => {
    resetMockUseAppHeader();
  });

  it('renders the wordmark', () => {
    renderHeader();

    expect(screen.getByText('LEARNCRAFT')).toBeInTheDocument();
  });

  it('links the brand (logo + wordmark) to the home page', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: /LEARNCRAFT/ })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('renders no header action when logged out (Log in lives on the LoggedOut screen)', () => {
    overrideMockUseAppHeader({ isAuthenticated: false, isLoading: false });

    renderHeader();

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: /Log in/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the account trigger when logged in, and no Log in button', () => {
    overrideMockUseAppHeader({
      isAuthenticated: true,
      isLoading: false,
      studentName: 'Maria Silva',
      studentEmail: 'maria@example.com',
    });

    renderHeader();

    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Log in/ }),
    ).not.toBeInTheDocument();
  });

  it('shows no lesson, card, or due count anywhere in the header', () => {
    overrideMockUseAppHeader({ isAuthenticated: true, isLoading: false });

    renderHeader();

    expect(screen.queryByText(/lesson/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/due/i)).not.toBeInTheDocument();
  });

  it('shows neither Log in nor the account trigger while auth is loading', () => {
    overrideMockUseAppHeader({ isAuthenticated: false, isLoading: true });

    renderHeader();

    expect(
      screen.queryByRole('button', { name: /Log in/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Account' }),
    ).not.toBeInTheDocument();
  });

  it('renders centered nav children when given', () => {
    overrideMockUseAppHeader({ isAuthenticated: false, isLoading: false });

    renderHeader(<a href="/flashcardfinder">Flashcard Finder</a>);

    expect(
      screen.getByRole('link', { name: 'Flashcard Finder' }),
    ).toBeInTheDocument();
  });
});
