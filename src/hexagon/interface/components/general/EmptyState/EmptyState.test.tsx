import { EmptyState } from '@interface/components/general/EmptyState/EmptyState';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('empty state', () => {
  afterEach(() => {
    cleanup();
  });

  it('states what is missing and what to do', () => {
    render(
      <EmptyState
        icon="searchOff"
        title="No examples match these filters"
        guidance="Try widening the lesson range or removing a tag."
      />,
    );

    expect(
      screen.getByText('No examples match these filters'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Try widening the lesson range or removing a tag.'),
    ).toBeInTheDocument();
  });

  it('renders a decorative glyph', () => {
    const { container } = render(
      <EmptyState
        icon="searchOff"
        title="Nothing here"
        guidance="Try again."
      />,
    );

    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('renders an action when given one', () => {
    render(
      <EmptyState
        icon="searchOff"
        title="Nothing here"
        guidance="Try again."
        action={<button>Reset all filters</button>}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Reset all filters' }),
    ).toBeInTheDocument();
  });
});
