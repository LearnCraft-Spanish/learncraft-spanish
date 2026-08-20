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
});
