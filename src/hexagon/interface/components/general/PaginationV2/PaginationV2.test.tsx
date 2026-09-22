import { PaginationV2 } from '@interface/components/general/PaginationV2/PaginationV2';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './PaginationV2.module.scss';

describe('pagination v2', () => {
  afterEach(() => {
    cleanup();
  });

  it('marks the current page', () => {
    render(<PaginationV2 page={3} pageCount={10} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('moves to a chosen page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn<(page: number) => void>();
    render(
      <PaginationV2 page={3} pageCount={10} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Page 4' }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('steps forward and back', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn<(page: number) => void>();
    render(
      <PaginationV2 page={3} pageCount={10} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await user.click(screen.getByRole('button', { name: 'Previous page' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
  });

  it('keeps the ends in place rather than removing them', () => {
    render(<PaginationV2 page={1} pageCount={10} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Previous page' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Next page' }),
    ).not.toBeDisabled();
  });

  it('disables the next arrow on the last page', () => {
    render(<PaginationV2 page={10} pageCount={10} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('elides the runs between the ends and the current page', () => {
    render(<PaginationV2 page={5} pageCount={10} onPageChange={vi.fn()} />);

    expect(
      screen
        .getAllByRole('button', { name: /^Page / })
        .map((b) => b.textContent),
    ).toEqual(['1', '4', '5', '6', '10']);
  });

  it('lists every page when they all fit', () => {
    render(<PaginationV2 page={2} pageCount={3} onPageChange={vi.fn()} />);

    expect(
      screen
        .getAllByRole('button', { name: /^Page / })
        .map((b) => b.textContent),
    ).toEqual(['1', '2', '3']);
  });

  it('renders a single page without duplicating it', () => {
    render(<PaginationV2 page={1} pageCount={1} onPageChange={vi.fn()} />);

    expect(screen.getAllByRole('button', { name: /^Page / })).toHaveLength(1);
  });

  it('shows the range label when given one', () => {
    render(
      <PaginationV2
        page={1}
        pageCount={10}
        onPageChange={vi.fn()}
        rangeLabel="1–25 of 342"
      />,
    );

    expect(screen.getByText('1–25 of 342')).toBeInTheDocument();
  });

  it('wraps unavailable ends in parchment rather than fading them', () => {
    render(
      <PaginationV2
        page={1}
        pageCount={10}
        onPageChange={vi.fn()}
        unavailableTreatment="parchment"
      />,
    );

    const previous = screen.getByRole('button', { name: 'Previous page' });
    const next = screen.getByRole('button', { name: 'Next page' });

    expect(previous).toBeDisabled();
    expect(previous.parentElement).toHaveClass(styles.parchmentEnd);
    expect(next).not.toBeDisabled();
    expect(next.parentElement).not.toHaveClass(styles.parchmentEnd);
  });

  it('fades unavailable ends by default', () => {
    render(<PaginationV2 page={1} pageCount={10} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Previous page' }).parentElement,
    ).not.toHaveClass(styles.parchmentEnd);
  });
});
