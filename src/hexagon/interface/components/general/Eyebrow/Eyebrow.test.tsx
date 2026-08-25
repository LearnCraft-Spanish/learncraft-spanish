import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('eyebrow', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its text', () => {
    render(<Eyebrow>Scope · Required</Eyebrow>);

    expect(screen.getByText('Scope · Required')).toBeInTheDocument();
  });

  it('renders as a span by default', () => {
    render(<Eyebrow>Tags</Eyebrow>);

    expect(screen.getByText('Tags').tagName).toBe('SPAN');
  });

  it('can render as a heading when it titles a section', () => {
    render(<Eyebrow as="h2">Tags</Eyebrow>);

    expect(screen.getByRole('heading', { name: 'Tags' })).toBeInTheDocument();
  });

  it('keeps medium weight and tight leading unless asked otherwise', () => {
    render(<Eyebrow>Flashcards</Eyebrow>);

    expect(screen.getByText('Flashcards').className).not.toMatch(/regular/);
    expect(screen.getByText('Flashcards').className).not.toMatch(/leadingBody/);
  });

  it('accepts regular weight and body leading', () => {
    render(
      <Eyebrow weight="regular" leading="body">
        Flashcards
      </Eyebrow>,
    );

    expect(screen.getByText('Flashcards').className).toMatch(/regular/);
    expect(screen.getByText('Flashcards').className).toMatch(/leadingBody/);
  });
});
