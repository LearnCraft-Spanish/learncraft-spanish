import { BrandMark } from '@interface/components/general/BrandMark/BrandMark';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('brand mark', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders at the requested size', () => {
    const { container } = render(
      <BrandMark size={22} color="var(--lcs-color-on-action)" />,
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('width', '22');
    expect(svg).toHaveAttribute('height', '22');
  });

  it('applies the given color to its strokes', () => {
    const { container } = render(
      <BrandMark size={340} color="var(--lcs-color-on-surface-dark)" />,
    );

    expect(container.querySelector('g')).toHaveAttribute(
      'stroke',
      'var(--lcs-color-on-surface-dark)',
    );
  });

  it('is always hidden from assistive technology', () => {
    const { container } = render(
      <BrandMark size={22} color="var(--lcs-color-on-action)" />,
    );

    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
