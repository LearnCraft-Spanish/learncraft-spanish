import { FinderBottomBar } from '@interface/components/studentFlashcards/FinderBottomBar/FinderBottomBar';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './FinderBottomBar.module.scss';

/** FixedBottomStack is `position: fixed`; jsdom reports that as inaccessible. */
const hidden = { hidden: true } as const;

describe('finder bottom bar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders nothing when there is no notice and no selection', () => {
    const { container } = render(
      <FinderBottomBar
        notice={null}
        onDismissNotice={vi.fn()}
        selectedCount={0}
        onClearSelection={vi.fn()}
        onCollect={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('status', hidden)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Collect flashcards', ...hidden }),
    ).not.toBeInTheDocument();
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

    expect(container).toBeEmptyDOMElement();
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

    expect(screen.getByRole('status', hidden)).toHaveTextContent(
      'Filters applied to your flashcards.',
    );
    expect(
      screen.getByRole('button', { name: 'Dismiss', ...hidden }).parentElement,
    ).toHaveClass(styles.dismiss);
    expect(
      screen.queryByRole('button', { name: 'Collect flashcards', ...hidden }),
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

    await user.click(
      screen.getByRole('button', { name: 'Dismiss', ...hidden }),
    );

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
      screen.getByRole('button', { name: 'Clear selection', ...hidden })
        .parentElement,
    ).toHaveClass(styles.clear);
    expect(screen.queryByRole('status', hidden)).not.toBeInTheDocument();
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

    await user.click(
      screen.getByRole('button', { name: 'Clear selection', ...hidden }),
    );

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
      screen.getByRole('button', { name: 'Collect flashcards', ...hidden }),
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

    const notice = screen.getByRole('status', hidden);
    const add = screen.getByRole('button', {
      name: 'Collect flashcards',
      ...hidden,
    });

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
    const notice = screen.getByRole('status', hidden);
    const selection = screen.getByText('2 flashcards selected').closest('div');

    expect(slab?.childElementCount).toBe(2);
    expect(slab?.firstElementChild).toBe(notice);
    expect(slab).toContainElement(
      screen.getByRole('button', { name: 'Collect flashcards', ...hidden }),
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
    expect(screen.queryByRole('status', hidden)).not.toBeInTheDocument();
  });

  it('renders nothing when only the unused flashcards query is passed', () => {
    const { container } = render(<FinderBottomBar flashcardsQuery={{}} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('dismisses a notice when no dismiss handler is provided', async () => {
    const user = userEvent.setup();
    render(<FinderBottomBar notice="Filters applied to your flashcards." />);

    await user.click(
      screen.getByRole('button', { name: 'Dismiss', ...hidden }),
    );
  });
});
