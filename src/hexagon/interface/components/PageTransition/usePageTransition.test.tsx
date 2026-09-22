import type { AnimationEvent, JSX, ReactNode } from 'react';
import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { usePageTransition } from '@interface/components/PageTransition/usePageTransition';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

function stubMedia(mobile: boolean, reducedMotion: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('max-width: 768px')
      ? mobile
      : query.includes('prefers-reduced-motion')
        ? reducedMotion
        : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

function wrapper({ children }: { children: ReactNode }): JSX.Element {
  return <MemoryRouter initialEntries={['/quizzes']}>{children}</MemoryRouter>;
}

describe('usePageTransition', () => {
  beforeEach(() => {
    resetMockUseStudentUiVersion();
    vi.unstubAllGlobals();
  });

  it('enables the slide only for mobile v2 without reduced motion', () => {
    stubMedia(true, false);
    overrideMockUseStudentUiVersion({ version: 'v2' });

    const { result } = renderHook(() => usePageTransition(), { wrapper });

    expect(result.current.enabled).toBe(true);
    expect(result.current.pathname).toBe('/quizzes');
  });

  it('stays off on desktop', () => {
    stubMedia(false, false);
    overrideMockUseStudentUiVersion({ version: 'v2' });

    const { result } = renderHook(() => usePageTransition(), { wrapper });

    expect(result.current.enabled).toBe(false);
  });

  it('stays off when the user prefers reduced motion', () => {
    stubMedia(true, true);
    overrideMockUseStudentUiVersion({ version: 'v2' });

    const { result } = renderHook(() => usePageTransition(), { wrapper });

    expect(result.current.enabled).toBe(false);
  });

  it('records a back ghost when the next path is the stack parent', () => {
    stubMedia(true, false);
    overrideMockUseStudentUiVersion({ version: 'v2' });
    const { result } = renderHook(() => usePageTransition(), { wrapper });

    act(() => {
      result.current.handleCaptured('<p>quizzes</p>', '/quizzes', '/');
    });

    expect(result.current.ghost).toEqual({
      html: '<p>quizzes</p>',
      direction: 'back',
    });
  });

  it('ignores an empty capture', () => {
    stubMedia(true, false);
    const { result } = renderHook(() => usePageTransition(), { wrapper });

    act(() => {
      result.current.handleCaptured('', '/quizzes', '/');
    });

    expect(result.current.ghost).toBeNull();
  });

  it('clears the ghost only when the stage itself finishes animating', () => {
    stubMedia(true, false);
    const { result } = renderHook(() => usePageTransition(), { wrapper });
    const stage = document.createElement('div');
    const child = document.createElement('span');

    act(() => {
      result.current.handleCaptured('<p>quizzes</p>', '/', '/quizzes');
    });
    expect(result.current.ghost?.direction).toBe('forward');

    act(() => {
      result.current.handleAnimationEnd({
        target: child,
        currentTarget: stage,
      } as unknown as AnimationEvent<HTMLDivElement>);
    });
    expect(result.current.ghost).not.toBeNull();

    act(() => {
      result.current.handleAnimationEnd({
        target: stage,
        currentTarget: stage,
      } as unknown as AnimationEvent<HTMLDivElement>);
    });
    expect(result.current.ghost).toBeNull();
  });
});
