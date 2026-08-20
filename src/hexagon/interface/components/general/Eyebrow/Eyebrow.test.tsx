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
});
