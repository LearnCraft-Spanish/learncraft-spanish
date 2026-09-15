import type { JSX, ReactNode } from 'react';
import {
  overrideMockFeatureFlagAdapter,
  resetMockFeatureFlagAdapter,
} from '@application/adapters/featureFlagAdapter.mock';
import {
  mockUseAppHeader,
  overrideMockUseAppHeader,
  resetMockUseAppHeader,
} from '@application/useCases/AppHeader/useAppHeader.mock';
import { AppHeader } from '@interface/components/AppHeader/AppHeader';
import { setMobileStackOverride } from '@interface/hooks/useMobileStackChrome';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/AppHeader', () => ({
  useAppHeader: () => mockUseAppHeader,
}));

function stubMobile(matches: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches && query.includes('max-width: 768px'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function renderHeader(children?: ReactNode, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppHeader>{children}</AppHeader>
    </MemoryRouter>,
  );
}

describe('component AppHeader', () => {
  beforeEach(() => {
    resetMockUseAppHeader();
  });

  afterEach(() => {
    setMobileStackOverride(null);
    resetMockFeatureFlagAdapter();
    vi.unstubAllGlobals();
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

  it('shows back and the page title on a mobile stack screen, without the account menu', async () => {
    stubMobile(true);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
    overrideMockUseAppHeader({
      isAuthenticated: true,
      isLoading: false,
      studentName: 'Maria Silva',
      studentEmail: 'maria@example.com',
    });

    renderHeader(undefined, '/quizzes');

    expect(
      screen.getByRole('heading', { name: 'Quizzes' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Account' }),
    ).not.toBeInTheDocument();
  });

  it('calls an in-page override when the stack back button is pressed', async () => {
    stubMobile(true);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
    overrideMockUseAppHeader({ isAuthenticated: true, isLoading: false });
    const onBack = vi.fn();
    setMobileStackOverride({ title: 'Choose tags', onBack });

    renderHeader(undefined, '/customquiz');

    expect(
      screen.getByRole('heading', { name: 'Choose tags' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('navigates to the parent path when stack back is pressed', async () => {
    stubMobile(true);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
    overrideMockUseAppHeader({ isAuthenticated: true, isLoading: false });

    function PathReadout(): JSX.Element {
      const { pathname } = useLocation();
      return <div data-testid="path">{pathname}</div>;
    }

    render(
      <MemoryRouter initialEntries={['/quizzes']}>
        <AppHeader />
        <PathReadout />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/');
  });
});
