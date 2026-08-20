import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('page shell', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its children', () => {
    render(
      <PageShell>
        <span>content</span>
      </PageShell>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('centers children inside a measured column', () => {
    render(
      <PageShell>
        <span>content</span>
      </PageShell>,
    );

    const column = screen.getByText('content').parentElement;

    expect(column?.className).toContain('column');
  });

  it('does not reserve bottom bar space by default', () => {
    render(
      <PageShell>
        <span>content</span>
      </PageShell>,
    );

    const root = screen.getByText('content').parentElement?.parentElement;

    expect(root?.className).not.toContain('reserveBottomBar');
  });

  it('reserves bottom bar space when asked', () => {
    render(
      <PageShell reserveBottomBar>
        <span>content</span>
      </PageShell>,
    );

    const root = screen.getByText('content').parentElement?.parentElement;

    expect(root?.className).toContain('reserveBottomBar');
  });
});
