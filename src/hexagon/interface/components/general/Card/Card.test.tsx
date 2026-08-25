import {
  Card,
  CardFooterStrip,
  CardSection,
  CardSectionHeader,
} from '@interface/components/general/Card/Card';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import styles from './Card.module.scss';

describe('card', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its children', () => {
    render(
      <Card>
        <span>body</span>
      </Card>,
    );

    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('clips overflowing descendants by default', () => {
    const { container } = render(
      <Card>
        <span>body</span>
      </Card>,
    );

    expect(container.firstElementChild).toHaveClass(styles.card);
    expect(container.firstElementChild).not.toHaveClass(styles.unclipped);
  });

  it('lets descendants paint outside when clip is false', () => {
    const { container } = render(
      <Card clip={false}>
        <span>body</span>
      </Card>,
    );

    expect(container.firstElementChild).toHaveClass(styles.unclipped);
  });
});

describe('card section', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its children', () => {
    render(
      <CardSection>
        <span>filters</span>
      </CardSection>,
    );

    expect(screen.getByText('filters')).toBeInTheDocument();
  });
});

describe('card section header', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the eyebrow as a heading', () => {
    render(<CardSectionHeader eyebrow="Tags" />);

    expect(screen.getByRole('heading', { name: 'Tags' })).toBeInTheDocument();
  });

  it('renders a trailing action when given one', () => {
    render(
      <CardSectionHeader
        eyebrow="Tags"
        action={<button>Clear 3 tags</button>}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Clear 3 tags' }),
    ).toBeInTheDocument();
  });
});

describe('card footer strip', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its children', () => {
    render(
      <CardFooterStrip>
        <span>options</span>
      </CardFooterStrip>,
    );

    expect(screen.getByText('options')).toBeInTheDocument();
  });
});
