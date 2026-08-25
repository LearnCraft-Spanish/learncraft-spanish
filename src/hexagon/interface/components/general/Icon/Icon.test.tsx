import { Icon } from '@interface/components/general/Icon/Icon';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('icon', () => {
  afterEach(() => {
    cleanup();
  });

  it('hides decorative icons from assistive technology', () => {
    const { container } = render(<Icon name="volume" />);
    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('exposes a labelled icon as an image', () => {
    render(<Icon name="volume" label="Play Spanish audio" />);

    const svg = screen.getByRole('img', { name: 'Play Spanish audio' });

    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('renders at the requested size', () => {
    const { container } = render(<Icon name="check" size="inline" />);

    expect(container.querySelector('svg')).toHaveAttribute('width', '14');
  });

  it('defaults to the medium size', () => {
    const { container } = render(<Icon name="check" />);

    expect(container.querySelector('svg')).toHaveAttribute('width', '18');
  });

  it('uses the outline stroke weight', () => {
    const { container } = render(<Icon name="bookmark" />);

    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '2');
  });
});
