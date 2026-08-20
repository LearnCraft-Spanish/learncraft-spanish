import { Badge } from '@interface/components/general/Badge/Badge';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

describe('badge', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its text', () => {
    render(<Badge>Admin only</Badge>);

    expect(screen.getByText('Admin only')).toBeInTheDocument();
  });

  it('renders a compact sm pill', () => {
    render(
      <Badge size="sm" compact>
        Admin only
      </Badge>,
    );

    expect(screen.getByText('Admin only')).toBeInTheDocument();
  });
});
