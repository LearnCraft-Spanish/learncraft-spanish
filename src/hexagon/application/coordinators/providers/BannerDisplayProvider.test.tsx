import type { ReactNode } from 'react';
import {
  mockCookieAdapter,
  resetMockCookieAdapter,
} from '@application/adapters/cookieAdapter.mock';
import { useBannerDisplay } from '@application/coordinators/hooks/useBannerDisplay';
import { BannerDisplayProvider } from '@application/coordinators/providers/BannerDisplayProvider';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/cookieAdapter', () => ({
  CookieAdapter: () => mockCookieAdapter,
}));

const COOKIE_NAME = 'coachingBannerSeen';

function createWrapper(initialPath = '/') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <BannerDisplayProvider>{children}</BannerDisplayProvider>
      </MemoryRouter>
    );
  };
}

// Exposes banner state and navigation from inside the provider tree
function useBannerAndNavigate() {
  return { banner: useBannerDisplay(), navigate: useNavigate() };
}

describe('bannerDisplayProvider', () => {
  beforeEach(() => {
    resetMockCookieAdapter();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial visibility', () => {
    it('shows the banner when the user has not seen it before', () => {
      const { result } = renderHook(() => useBannerDisplay(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isBannerVisible).toBe(true);
    });

    it('hides the banner when the user has already seen it', () => {
      mockCookieAdapter.setCookie(COOKIE_NAME, 'true', new Date());

      const { result } = renderHook(() => useBannerDisplay(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isBannerVisible).toBe(false);
    });
  });

  describe('closeBanner', () => {
    it('hides the banner and remembers that the user has seen it', () => {
      const { result } = renderHook(() => useBannerDisplay(), {
        wrapper: createWrapper(),
      });

      act(() => result.current.closeBanner());

      expect(result.current.isBannerVisible).toBe(false);
      expect(mockCookieAdapter.getCookie(COOKIE_NAME)).toBe('true');
    });

    it('keeps the banner hidden until midnight on the day after next', () => {
      // Seen Tuesday 8am: expires Thursday midnight (see the doc comment on
      // getCoachingBannerCookieExpiration)
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 0, 6, 8, 0, 0));
      const { result } = renderHook(() => useBannerDisplay(), {
        wrapper: createWrapper(),
      });

      act(() => result.current.closeBanner());

      expect(mockCookieAdapter.setCookie).toHaveBeenCalledWith(
        COOKIE_NAME,
        'true',
        new Date(2026, 0, 8, 0, 0, 0, 0),
      );
    });
  });

  describe('navigating away from the page the user landed on', () => {
    it('hides the banner and remembers that the user has seen it', () => {
      const { result } = renderHook(() => useBannerAndNavigate(), {
        wrapper: createWrapper('/landing'),
      });
      expect(result.current.banner.isBannerVisible).toBe(true);

      act(() => result.current.navigate('/somewhere-else'));

      expect(result.current.banner.isBannerVisible).toBe(false);
      expect(mockCookieAdapter.getCookie(COOKIE_NAME)).toBe('true');
    });

    it('keeps the banner while the user stays on the landing page', () => {
      const { result } = renderHook(() => useBannerAndNavigate(), {
        wrapper: createWrapper('/landing'),
      });

      // Navigating to the same path is not leaving the landing page
      act(() => result.current.navigate('/landing'));

      expect(result.current.banner.isBannerVisible).toBe(true);
      expect(mockCookieAdapter.getCookie(COOKIE_NAME)).toBeNull();
    });
  });
});
