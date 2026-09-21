import { KeyboardHints } from '@interface/components/textQuiz/KeyboardHints/KeyboardHints';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('keyboard hints', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows previous, flip, and next for a non-SRS quiz', () => {
    render(<KeyboardHints srs={false} />);

    expect(screen.getByText('previous')).toBeTruthy();
    expect(screen.getByText('flip')).toBeTruthy();
    expect(screen.getByText('next')).toBeTruthy();
    expect(screen.getByText('↑')).toBeTruthy();
    expect(screen.queryByText('hard')).toBeNull();
    expect(screen.queryByText('easy')).toBeNull();
    expect(screen.queryByText('space')).toBeNull();
  });

  it('adds 1 hard and 2 easy on an SRS quiz, alongside previous / flip / next', () => {
    render(<KeyboardHints srs />);

    expect(screen.getByText('previous')).toBeTruthy();
    expect(screen.getByText('flip')).toBeTruthy();
    expect(screen.getByText('next')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('hard')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('easy')).toBeTruthy();
    expect(screen.queryByText('space')).toBeNull();
  });
});
