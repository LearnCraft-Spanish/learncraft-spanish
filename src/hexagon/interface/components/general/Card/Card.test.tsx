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
