import { Skeleton } from '@interface/components/general/Skeleton/Skeleton';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Skeleton.module.scss';

describe('skeleton', () => {
  afterEach(() => {
    cleanup();
  });

  it('announces what is loading', () => {
    render(<Skeleton label="Loading examples" />);

    const status = screen.getByRole('status', { name: 'Loading examples' });

    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('renders three bars by default', () => {
    render(<Skeleton label="Loading examples" />);

    expect(
      screen.getByRole('status', { name: 'Loading examples' }).children,
    ).toHaveLength(3);
  });

  it('renders the requested number of bars', () => {
    render(<Skeleton label="Loading examples" count={6} />);

    expect(
      screen.getByRole('status', { name: 'Loading examples' }).children,
    ).toHaveLength(6);
  });

  it('keeps default bars full width', () => {
    render(<Skeleton label="Loading examples" />);

    expect(
      screen.getByRole('status', { name: 'Loading examples' }),
    ).not.toHaveClass(styles.rows);
  });

  it('renders row placeholders instead of a full-width grate', () => {
    render(<Skeleton label="Loading examples" variant="rows" />);

    expect(
      screen.getByRole('status', { name: 'Loading examples' }),
    ).toHaveClass(styles.rows);
  });
});
