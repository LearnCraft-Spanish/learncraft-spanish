import type { ReactNode } from 'react';
import {
  mockUseAppHeader,
  overrideMockUseAppHeader,
  resetMockUseAppHeader,
} from '@application/useCases/AppHeader/useAppHeader.mock';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { useAppHeaderView } from '@interface/components/AppHeader/useAppHeaderView';
import { setMobileStackOverride } from '@interface/hooks/useMobileStackChrome';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/AppHeader', () => ({
  useAppHeader: () => mockUseAppHeader,
}));

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

function stubMobile(matches: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches && query.includes('max-width: 768px'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function wrapperFor(path: string) {
  return function RouterWrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;
  };
}

describe('useAppHeaderView', () => {
  beforeEach(() => {
    resetMockUseAppHeader();
    overrideMockUseAppHeader({
      isAuthenticated: true,
      isLoading: false,
      isSignedIn: true,
    });
  });

  afterEach(() => {
    setMobileStackOverride(null);
    resetMockUseStudentUiVersion();
    vi.unstubAllGlobals();
  });

  it('does not expose stack chrome on desktop', () => {
    stubMobile(false);
    overrideMockUseStudentUiVersion({ version: 'v2' });

    const { result } = renderHook(() => useAppHeaderView(), {
      wrapper: wrapperFor('/quizzes'),
    });

    expect(result.current.stack).toBeNull();
  });

  it('does not expose stack chrome on mobile Home', () => {
    stubMobile(true);
    overrideMockUseStudentUiVersion({ version: 'v2' });

    const { result } = renderHook(() => useAppHeaderView(), {
      wrapper: wrapperFor('/'),
    });

    expect(result.current.stack).toBeNull();
  });

  it('does not expose stack chrome on mobile before login', () => {
    stubMobile(true);
    overrideMockUseAppHeader({ isAuthenticated: false, isSignedIn: false });

    const { result } = renderHook(() => useAppHeaderView(), {
      wrapper: wrapperFor('/officialquizzes'),
    });

    expect(result.current.stack).toBeNull();
  });

  it('exposes the path-map title and parent back on a mobile stack screen', () => {
    stubMobile(true);
    overrideMockUseStudentUiVersion({ version: 'v2' });

    const { result } = renderHook(() => useAppHeaderView(), {
      wrapper: wrapperFor('/quizzes'),
    });

    expect(result.current.stack?.title).toBe('Quizzes');
    expect(typeof result.current.stack?.onBack).toBe('function');
  });

  describe('showUseAsStudentButton', () => {
    it('shows the header button on the home menu and keeps the account offer everywhere else', () => {
      overrideMockUseAppHeader({
        isStaff: true,
        showUseAsStudent: true,
        showStudentNav: false,
      });

      const home = renderHook(() => useAppHeaderView(), {
        wrapper: wrapperFor('/'),
      });
      expect(home.result.current.showUseAsStudent).toBe(true);
      expect(home.result.current.showUseAsStudentButton).toBe(true);
      expect(home.result.current.showStudentNav).toBe(false);

      for (const path of ['/admin-dashboard', '/coaching-dashboard']) {
        const { result } = renderHook(() => useAppHeaderView(), {
          wrapper: wrapperFor(path),
        });
        expect(result.current.showUseAsStudent).toBe(true);
        expect(result.current.showUseAsStudentButton).toBe(false);
        expect(result.current.showStudentNav).toBe(false);
      }
    });

    it('stays off on home when use-as-student is not offered', () => {
      overrideMockUseAppHeader({
        showUseAsStudent: false,
        showStudentNav: true,
      });

      const { result } = renderHook(() => useAppHeaderView(), {
        wrapper: wrapperFor('/'),
      });

      expect(result.current.showUseAsStudentButton).toBe(false);
      expect(result.current.showStudentNav).toBe(true);
    });
  });

  it('lets an in-page override replace the title and back handler', () => {
    stubMobile(true);
    overrideMockUseStudentUiVersion({ version: 'v2' });
    const onBack = vi.fn();
    setMobileStackOverride({ title: 'Text Quiz', onBack });

    const { result } = renderHook(() => useAppHeaderView(), {
      wrapper: wrapperFor('/customquiz'),
    });

    expect(result.current.stack?.title).toBe('Text Quiz');
    result.current.stack?.onBack();
    expect(onBack).toHaveBeenCalledOnce();
  });
});
