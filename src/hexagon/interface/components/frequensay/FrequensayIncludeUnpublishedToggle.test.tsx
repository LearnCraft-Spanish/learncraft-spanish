import { overrideMockUseIncludeUnpublished } from '@application/coordinators/hooks/useIncludeUnpublished.mock';
import { FrequensayIncludeUnpublishedToggle } from '@interface/components/frequensay/FrequensayIncludeUnpublishedToggle';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('frequensayIncludeUnpublishedToggle', () => {
  it('does not render for non-admins', () => {
    overrideMockUseIncludeUnpublished({ isAdmin: false });
    render(<FrequensayIncludeUnpublishedToggle />);

    expect(
      screen.queryByText(/Include unpublished courses and lessons/i),
    ).not.toBeInTheDocument();
  });

  it('renders for admins and updates includeUnpublished when toggled', () => {
    const updateIncludeUnpublished = vi.fn();
    overrideMockUseIncludeUnpublished({
      isAdmin: true,
      includeUnpublished: false,
      updateIncludeUnpublished,
    });

    render(<FrequensayIncludeUnpublishedToggle />);

    expect(
      screen.getByText(/Include unpublished courses and lessons/i),
    ).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: 'includeUnpublished',
    });
    fireEvent.click(checkbox);

    expect(updateIncludeUnpublished).toHaveBeenCalledWith(true);
  });
});
