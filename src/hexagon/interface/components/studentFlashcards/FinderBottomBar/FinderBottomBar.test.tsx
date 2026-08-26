import { FinderBottomBar } from '@interface/components/studentFlashcards/FinderBottomBar/FinderBottomBar';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './FinderBottomBar.module.scss';

describe('finder bottom bar', () => {
  afterEach(() => {
    cleanup();
  });

  it('keeps an empty live region mounted when there is no notice and no selection', () => {
    const { container } = render(
      <FinderBottomBar
        notice={null}
        onDismissNotice={vi.fn()}
        selectedCount={0}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    // The region has to exist before the text does, or the announcement is
    // lost. It must cost nothing visually while it waits.
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(container).not.toHaveTextContent(/\S/);
    expect(container.firstElementChild).not.toHaveClass(styles.slab);
    expect(
      screen.queryByRole('button', { name: 'Collect flashcards' }),
    ).not.toBeInTheDocument();
  });

  it('announces a notice through the region that was already there', () => {
    const { rerender } = render(
      <FinderBottomBar notice={null} selectedCount={0} />,
    );

    const region = screen.getByRole('status');
    expect(region).toBeEmptyDOMElement();

    rerender(
      <FinderBottomBar
        notice="25 flashcards removed from your collection."
        selectedCount={0}
      />,
    );

    // Same node, now populated: that is what NVDA, JAWS, and VoiceOver read.
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toHaveTextContent(
      '25 flashcards removed from your collection.',
    );
  });

  it('treats an empty notice as absent', () => {
    const { container } = render(
      <FinderBottomBar
        notice=""
        onDismissNotice={vi.fn()}
        selectedCount={0}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    expect(container).not.toHaveTextContent(/\S/);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(container.firstElementChild).not.toHaveClass(styles.slab);
  });

  it('shows only the notice layer', () => {
    render(
      <FinderBottomBar
        notice="Filters applied to your flashcards."
        onDismissNotice={vi.fn()}
        selectedCount={0}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Filters applied to your flashcards.',
    );
    expect(
      screen.getByRole('button', { name: 'Dismiss' }).parentElement,
    ).toHaveClass(styles.dismiss);
    expect(
      screen.queryByRole('button', { name: 'Collect flashcards' }),
    ).not.toBeInTheDocument();
  });

  it('dismisses the notice', async () => {
    const user = userEvent.setup();
    const onDismissNotice = vi.fn<() => void>();
    render(
      <FinderBottomBar
        notice="5 examples copied to clipboard."
        onDismissNotice={onDismissNotice}
        selectedCount={0}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismissNotice).toHaveBeenCalledOnce();
  });

  it('shows a plural selection label', () => {
    const { container } = render(
      <FinderBottomBar
        notice={null}
        onDismissNotice={vi.fn()}
        selectedCount={3}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    expect(container).toHaveTextContent('3 flashcards selected');
    expect(
      screen.getByRole('button', { name: 'Clear selection' }).parentElement,
    ).toHaveClass(styles.clear);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('shows a singular selection label', () => {
    const { container } = render(
      <FinderBottomBar
        notice={null}
        onDismissNotice={vi.fn()}
        selectedCount={1}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    expect(container).toHaveTextContent('1 flashcard selected');
  });

  it('clears the selection', async () => {
    const user = userEvent.setup();
    const onClearSelection = vi.fn<() => void>();
    render(
      <FinderBottomBar
        notice={null}
        onDismissNotice={vi.fn()}
        selectedCount={2}
        onClearSelection={onClearSelection}
        onCollect={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onClearSelection).toHaveBeenCalledOnce();
  });

  it('collects the selected flashcards', async () => {
    const user = userEvent.setup();
    const onCollect = vi.fn<() => void>();
    render(
      <FinderBottomBar
        notice={null}
        onDismissNotice={vi.fn()}
        selectedCount={2}
        onClearSelection={vi.fn()}
        onCollect={onCollect}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Collect flashcards' }),
    );

    expect(onCollect).toHaveBeenCalledOnce();
  });

  it('stacks the notice above the selection layer', () => {
    render(
      <FinderBottomBar
        notice="Quiz created from 12 examples."
        onDismissNotice={vi.fn()}
        selectedCount={2}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    const notice = screen.getByRole('status');
    const add = screen.getByRole('button', { name: 'Collect flashcards' });

    expect(notice).toHaveTextContent('Quiz created from 12 examples.');
    expect(
      notice.compareDocumentPosition(add) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('paints notice and selection as layers of one slab', () => {
    const { container } = render(
      <FinderBottomBar
        notice="Quiz created from 12 examples."
        onDismissNotice={vi.fn()}
        selectedCount={2}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    const slab = container.firstElementChild;
    const notice = screen.getByRole('status');
    const selection = screen.getByText('2 flashcards selected').closest('div');

    expect(slab).toHaveClass(styles.slab);
    expect(slab?.childElementCount).toBe(2);
    expect(slab?.firstElementChild).toBe(notice);
    expect(slab).toContainElement(
      screen.getByRole('button', { name: 'Collect flashcards' }),
    );
    expect(selection).not.toBe(notice);
  });

  it('keeps the selection when the notice is an empty string', () => {
    const { container } = render(
      <FinderBottomBar
        notice=""
        onDismissNotice={vi.fn()}
        selectedCount={4}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    expect(container).toHaveTextContent('4 flashcards selected');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('renders nothing visible when no notice and no selection are passed', () => {
    const { container } = render(<FinderBottomBar />);

    expect(container).not.toHaveTextContent(/\S/);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('labels the bulk action for the manager', async () => {
    const user = userEvent.setup();
    const onCollect = vi.fn<() => void>();
    render(
      <FinderBottomBar
        notice={null}
        onDismissNotice={vi.fn()}
        selectedCount={2}
        onClearSelection={vi.fn()}
        onCollect={onCollect}
        primaryActionLabel="Remove flashcards"
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Collect flashcards' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove flashcards' }));

    expect(onCollect).toHaveBeenCalledOnce();
  });

  it('dismisses a notice when no dismiss handler is provided', async () => {
    const user = userEvent.setup();
    render(<FinderBottomBar notice="Filters applied to your flashcards." />);

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
  });
});
