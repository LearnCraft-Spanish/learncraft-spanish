import {
  mockUseAppHeader,
  overrideMockUseAppHeader,
  resetMockUseAppHeader,
} from '@application/units/AppHeader/useAppHeader.mock';
import { AppHeader } from '@interface/components/AppHeader/AppHeader';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/units/AppHeader', () => ({
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

  it('shows exactly one header action when logged out', () => {
    overrideMockUseAppHeader({ isAuthenticated: false, isLoading: false });

    renderHeader();

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Log in/ })).toBeInTheDocument();
  });

  it('calls login when the Log in button is clicked', async () => {
    const user = userEvent.setup();
    const login = vi.fn();
    overrideMockUseAppHeader({
      isAuthenticated: false,
      isLoading: false,
      login,
    });

    renderHeader();
    await user.click(screen.getByRole('button', { name: /Log in/ }));

    expect(login).toHaveBeenCalledOnce();
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
