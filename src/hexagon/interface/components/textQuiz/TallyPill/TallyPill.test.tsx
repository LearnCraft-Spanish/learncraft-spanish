import { TallyPill } from '@interface/components/textQuiz/TallyPill/TallyPill';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('TallyPill', () => {
  it('exposes the count under the accessible tally name', () => {
    render(
      <TallyPill
        tone="error"
        icon="x"
        count={7}
        label="7 cards graded hard"
        side="left"
      />,
    );

    expect(
      screen.getByRole('status', { name: '7 cards graded hard' }),
    ).toHaveTextContent('7');
  });

  it('renders a success tally on the right edge', () => {
    render(
      <TallyPill
        tone="success"
        icon="check"
        count={0}
        label="0 cards graded easy"
        side="right"
      />,
    );

    expect(
      screen.getByRole('status', { name: '0 cards graded easy' }),
    ).toHaveTextContent('0');
  });
});
