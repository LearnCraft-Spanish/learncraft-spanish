import { IconTile } from '@interface/components/general/IconTile/IconTile';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('icon tile', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a decorative glyph', () => {
    const { container } = render(<IconTile icon="filter" />);

    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('defaults to the action tint', () => {
    const { container } = render(<IconTile icon="filter" />);

    expect(container.firstElementChild?.className).toContain('action');
  });

  it('applies the requested tint', () => {
    const { container } = render(<IconTile icon="userStar" tone="warning" />);

    expect(container.firstElementChild?.className).toContain('warning');
  });

  it('tones the glyph to match its tile', () => {
    const { container } = render(<IconTile icon="language" tone="label" />);

    expect(container.querySelector('svg')?.getAttribute('class')).toContain(
      'onLabel',
    );
  });
});
