import type { JSX } from 'react';
import {
  overrideMockFeatureFlagAdapter,
  resetMockFeatureFlagAdapter,
} from '@application/adapters/featureFlagAdapter.mock';
import { PageTransition } from '@interface/components/PageTransition/PageTransition';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

function HomeProbe(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div>
      <span>home body</span>
      <button type="button" onClick={() => navigate('/quizzes')}>
        go quizzes
      </button>
    </div>
  );
}

function QuizzesProbe(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div>
      <span>quizzes body</span>
      <button type="button" onClick={() => navigate('/')}>
        go home
      </button>
    </div>
  );
}

function renderTransition(initialPath = '/'): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomeProbe />} />
          <Route path="/quizzes" element={<QuizzesProbe />} />
        </Routes>
      </PageTransition>
    </MemoryRouter>,
  );
}

describe('pageTransition', () => {
  afterEach(() => {
    cleanup();
    resetMockFeatureFlagAdapter();
    vi.unstubAllGlobals();
  });

  it('does not clone the outgoing page on desktop', async () => {
    stubMedia(false, false);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
    const user = userEvent.setup();
    renderTransition();

    await user.click(screen.getByRole('button', { name: 'go quizzes' }));

    expect(screen.queryByText('home body')).not.toBeInTheDocument();
    expect(screen.getByText('quizzes body')).toBeInTheDocument();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('clones the outgoing page and marks a forward slide', async () => {
    stubMedia(true, false);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
    const user = userEvent.setup();
    renderTransition();

    await user.click(screen.getByRole('button', { name: 'go quizzes' }));

    expect(screen.getByText('quizzes body')).toBeInTheDocument();
    const ghost = document.querySelector('[aria-hidden="true"]');
    expect(ghost).not.toBeNull();
    expect(ghost?.textContent).toContain('home body');
  });

  it('clones the outgoing page and marks a back slide', async () => {
    stubMedia(true, false);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
    const user = userEvent.setup();
    renderTransition('/quizzes');

    await user.click(screen.getByRole('button', { name: 'go home' }));

    expect(screen.getByText('home body')).toBeInTheDocument();
    const ghost = document.querySelector('[aria-hidden="true"]');
    expect(ghost).not.toBeNull();
    expect(ghost?.textContent).toContain('quizzes body');
  });

  it('skips the clone when reduced motion is requested', async () => {
    stubMedia(true, true);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
    const user = userEvent.setup();
    renderTransition();

    await user.click(screen.getByRole('button', { name: 'go quizzes' }));

    expect(screen.queryByText('home body')).not.toBeInTheDocument();
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('clears the ghost when the outgoing animation ends', async () => {
    stubMedia(true, false);
    overrideMockFeatureFlagAdapter({
      isEnabled: (flag) => flag === 'ui.student.home.v2',
    });
    const user = userEvent.setup();
    renderTransition();

    await user.click(screen.getByRole('button', { name: 'go quizzes' }));
    const ghost = document.querySelector('[aria-hidden="true"]');
    expect(ghost).not.toBeNull();

    fireEvent.animationEnd(ghost!);

    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});
