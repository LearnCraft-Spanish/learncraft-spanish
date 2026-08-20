import {
  Card,
  CardFooterStrip,
  CardSection,
  CardSectionHeader,
} from '@interface/components/general/Card/Card';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

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

  it('has no hover lift at rest', () => {
    const { container } = render(
      <Card>
        <span>body</span>
      </Card>,
    );

    expect(container.firstElementChild?.className).not.toContain('interactive');
  });

  it('lifts on hover when it is interactive', () => {
    const { container } = render(
      <Card interactive>
        <span>body</span>
      </Card>,
    );

    expect(container.firstElementChild?.className).toContain('interactive');
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

  it('draws a divider only when asked', () => {
    const { container } = render(
      <>
        <CardSection>
          <span>first</span>
        </CardSection>
        <CardSection divided>
          <span>second</span>
        </CardSection>
      </>,
    );

    const [first, second] = Array.from(container.children);

    expect(first.className).not.toContain('divided');
    expect(second.className).toContain('divided');
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
