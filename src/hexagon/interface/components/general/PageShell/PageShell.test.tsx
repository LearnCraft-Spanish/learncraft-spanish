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
});
