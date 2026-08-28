import { AccountMenu } from '@interface/components/AppHeader/AccountMenu';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('account menu', () => {
  afterEach(() => {
    cleanup();
  });

  it('has an accessible name of Account and starts closed', () => {
    render(
      <AccountMenu
        studentName="Maria Silva"
        studentEmail="maria@example.com"
        onLogOut={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('advertises the menu on the trigger', () => {
    render(
      <AccountMenu
        studentName="Maria Silva"
        studentEmail="maria@example.com"
        onLogOut={vi.fn()}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Account' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the menu on click, showing full name, email, and Log out', async () => {
    const user = userEvent.setup();
    render(
      <AccountMenu
        studentName="Maria Silva"
        studentEmail="maria@example.com"
        onLogOut={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));

    expect(screen.getByRole('menu', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /Log out/ }),
    ).toBeInTheDocument();
  });

  it('calls onLogOut and closes when Log out is chosen', async () => {
    const user = userEvent.setup();
    const onLogOut = vi.fn();
    render(
      <AccountMenu
        studentName="Maria Silva"
        studentEmail="maria@example.com"
        onLogOut={onLogOut}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    await user.click(screen.getByRole('menuitem', { name: /Log out/ }));

    expect(onLogOut).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <AccountMenu
          studentName="Maria Silva"
          studentEmail="maria@example.com"
          onLogOut={vi.fn()}
        />
        <button type="button">elsewhere</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'elsewhere' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <AccountMenu
        studentName="Maria Silva"
        studentEmail="maria@example.com"
        onLogOut={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
