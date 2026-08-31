import { LoggedOut } from '@interface/components/LoggedOut/LoggedOut';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('logged out screen', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the log-in prompt', () => {
    render(<LoggedOut onLogIn={vi.fn()} />);

    expect(
      screen.getByText('Please log in to use this app'),
    ).toBeInTheDocument();
  });

  it('calls onLogIn when the log in button is clicked', async () => {
    const user = userEvent.setup();
    const onLogIn = vi.fn();
    render(<LoggedOut onLogIn={onLogIn} />);

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(onLogIn).toHaveBeenCalledOnce();
  });
});
