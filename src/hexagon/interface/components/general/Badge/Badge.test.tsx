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

  it('defaults to the label tone', () => {
    render(<Badge>Admin only</Badge>);

    expect(screen.getByText('Admin only').className).toContain('label');
  });

  it('applies the requested tone', () => {
    render(<Badge tone="error">Incomplete</Badge>);

    expect(screen.getByText('Incomplete').className).toContain('error');
  });

  it('drops to the small size inside a menu row', () => {
    render(<Badge size="sm">Admin only</Badge>);

    expect(screen.getByText('Admin only').className).toContain('sm');
  });
});
