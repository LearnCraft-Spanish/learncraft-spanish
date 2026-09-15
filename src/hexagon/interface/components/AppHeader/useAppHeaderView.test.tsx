import type { ReactNode } from 'react';
import {
  overrideMockFeatureFlagAdapter,
  resetMockFeatureFlagAdapter,
} from '@application/adapters/featureFlagAdapter.mock';
import {
  mockUseAppHeader,
  overrideMockUseAppHeader,
  resetMockUseAppHeader,
} from '@application/useCases/AppHeader/useAppHeader.mock';
import { useAppHeaderView } from '@interface/components/AppHeader/useAppHeaderView';
import { setMobileStackOverride } from '@interface/hooks/useMobileStackChrome';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

function wrapperFor(path: string) {
  return function RouterWrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;
  };
}

describe('useAppHeaderView', () => {
  beforeEach(() => {
    resetMockUseAppHeader();
    overrideMockUseAppHeader({ isAuthenticated: true, isLoading: false });
  });

  afterEach(() => {
    setMobileStackOverride(null);
    resetMockFeatureFlagAdapter();
    vi.unstubAllGlobals();
  });

  it('does not expose stack chrome on desktop', () => {
    stubMobile(false);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });

    const { result } = renderHook(() => useAppHeaderView(), {
      wrapper: wrapperFor('/quizzes'),
    });

    expect(result.current.stack).toBeNull();
  });

  it('does not expose stack chrome on mobile Home', () => {
    stubMobile(true);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });

    const { result } = renderHook(() => useAppHeaderView(), {
      wrapper: wrapperFor('/'),
    });

    expect(result.current.stack).toBeNull();
  });

  it('exposes the path-map title and parent back on a mobile stack screen', () => {
    stubMobile(true);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });

    const { result } = renderHook(() => useAppHeaderView(), {
      wrapper: wrapperFor('/quizzes'),
    });

    expect(result.current.stack?.title).toBe('Quizzes');
    expect(typeof result.current.stack?.onBack).toBe('function');
  });

  it('lets an in-page override replace the title and back handler', () => {
    stubMobile(true);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
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
