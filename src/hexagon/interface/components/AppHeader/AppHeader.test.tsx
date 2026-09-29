import type { JSX, ReactNode } from 'react';
import {
  mockUseAppHeader,
  overrideMockUseAppHeader,
  resetMockUseAppHeader,
} from '@application/useCases/AppHeader/useAppHeader.mock';
import {
  mockUseStudentSelector,
  overrideMockUseStudentSelector,
  resetMockUseStudentSelector,
} from '@application/useCases/useStudentSelector/useStudentSelector.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { AppHeader } from '@interface/components/AppHeader/AppHeader';
import { setMobileStackOverride } from '@interface/hooks/useMobileStackChrome';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/AppHeader', () => ({
  useAppHeader: () => mockUseAppHeader,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

vi.mock('@application/useCases/useStudentSelector', () => ({
  useStudentSelector: mockUseStudentSelector,
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
    resetMockUseStudentUiVersion();
    resetMockUseStudentSelector();
    vi.unstubAllGlobals();
  });

  describe('coach/admin', () => {
    const staff = {
      isAuthenticated: true,
      isLoading: false,
      isStaff: true,
      studentName: 'Coach Carla',
      studentEmail: 'carla@fake.not',
    };

    it('replaces the student nav with "Use as student"', () => {
      overrideMockUseAppHeader({ ...staff, isUsingAsStudent: false });

      renderHeader(<a href="/flashcardfinder">Flashcard Finder</a>);

      expect(
        screen.getByRole('button', { name: 'Use as student' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Flashcard Finder' }),
      ).not.toBeInTheDocument();
    });

    it('opens the student picker from "Use as student"', async () => {
      overrideMockUseAppHeader({ ...staff, isUsingAsStudent: false });

      renderHeader();
      await userEvent.click(
        screen.getByRole('button', { name: 'Use as student' }),
      );

      expect(
        screen.getByRole('dialog', { name: 'Use as student' }),
      ).toBeInTheDocument();
    });

    it('keeps "Use as student" on mobile', () => {
      stubMobile(true);
      overrideMockUseAppHeader({ ...staff, isUsingAsStudent: false });

      renderHeader();

      expect(
        screen.getByRole('button', { name: 'Use as student' }),
      ).toBeInTheDocument();
    });

    it('shows the student nav and who they are using the app as', async () => {
      overrideMockUseAppHeader({
        ...staff,
        isUsingAsStudent: true,
        usingAs: { name: 'Ana Ruiz', email: 'ana@fake.not' },
      });

      renderHeader(<a href="/flashcardfinder">Flashcard Finder</a>);

      expect(
        screen.getByRole('link', { name: 'Flashcard Finder' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Use as student' }),
      ).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Account' }));
      expect(screen.getByText('Coach Carla')).toBeInTheDocument();
      expect(screen.getByText('Ana Ruiz')).toBeInTheDocument();
      expect(screen.getByText('ana@fake.not')).toBeInTheDocument();
    });

    it('opens the picker from the account menu\'s "Use as student"', async () => {
      overrideMockUseAppHeader({ ...staff, isUsingAsStudent: false });

      renderHeader();
      await userEvent.click(screen.getByRole('button', { name: 'Account' }));
      await userEvent.click(
        screen.getByRole('menuitem', { name: 'Use as student' }),
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(
        screen.getByRole('dialog', { name: 'Use as student' }),
      ).toBeInTheDocument();
    });

    it('opens the picker from "Change student"', async () => {
      overrideMockUseAppHeader({
        ...staff,
        isUsingAsStudent: true,
        usingAs: { name: 'Ana Ruiz', email: 'ana@fake.not' },
      });
      overrideMockUseStudentSelector({ isUsingAsStudent: true });

      renderHeader();
      await userEvent.click(screen.getByRole('button', { name: 'Account' }));
      await userEvent.click(
        screen.getByRole('menuitem', { name: 'Change student' }),
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(
        screen.getByRole('dialog', { name: 'Change student' }),
      ).toBeInTheDocument();
    });

    it('replaces Log out with a way back to the staff view, and goes home', async () => {
      const stopUsingAsStudent = vi.fn();
      const logout = vi.fn();
      overrideMockUseAppHeader({
        ...staff,
        staffRole: 'admin',
        isUsingAsStudent: true,
        usingAs: { name: 'Ana Ruiz', email: 'ana@fake.not' },
        stopUsingAsStudent,
        logout,
      });

      function PathReadout(): JSX.Element {
        const { pathname } = useLocation();
        return <div data-testid="path">{pathname}</div>;
      }
      render(
        <MemoryRouter initialEntries={['/flashcardfinder']}>
          <AppHeader />
          <PathReadout />
        </MemoryRouter>,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Account' }));
      expect(
        screen.queryByRole('menuitem', { name: /Log out/ }),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Back to your admin view')).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('menuitem', { name: /Stop using as student/ }),
      );

      expect(stopUsingAsStudent).toHaveBeenCalledOnce();
      expect(logout).not.toHaveBeenCalled();
      expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/);
    });
  });

  it('never shows staff controls to a student', async () => {
    overrideMockUseAppHeader({
      isAuthenticated: true,
      isLoading: false,
      isStaff: false,
      studentName: 'Maria Silva',
    });

    renderHeader(<a href="/flashcardfinder">Flashcard Finder</a>);
    await userEvent.click(screen.getByRole('button', { name: 'Account' }));

    expect(
      screen.queryByRole('button', { name: 'Use as student' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['Log out']);
    expect(screen.queryByText('Using as')).not.toBeInTheDocument();
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
    overrideMockUseStudentUiVersion({ version: 'v2' });
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
    overrideMockUseStudentUiVersion({ version: 'v2' });
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
    overrideMockUseStudentUiVersion({ version: 'v2' });
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
