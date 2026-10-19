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
        onOpenSettings={vi.fn()}
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
        onOpenSettings={vi.fn()}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Account' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the menu on click, showing full name, email, and Settings', async () => {
    const user = userEvent.setup();
    render(
      <AccountMenu
        studentName="Maria Silva"
        studentEmail="maria@example.com"
        onOpenSettings={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));

    expect(screen.getByRole('menu', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Settings' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: /Log out/ }),
    ).not.toBeInTheDocument();
  });

  it('calls onOpenSettings and closes when Settings is chosen', async () => {
    const user = userEvent.setup();
    const onOpenSettings = vi.fn();
    render(
      <AccountMenu
        studentName="Maria Silva"
        studentEmail="maria@example.com"
        onOpenSettings={onOpenSettings}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    await user.click(screen.getByRole('menuitem', { name: 'Settings' }));

    expect(onOpenSettings).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <AccountMenu
          studentName="Maria Silva"
          studentEmail="maria@example.com"
          onOpenSettings={vi.fn()}
        />
        <button type="button">elsewhere</button>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'elsewhere' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows who a coach is using the app as, between identity and actions', async () => {
    const user = userEvent.setup();
    render(
      <AccountMenu
        studentName="Coach Carla"
        studentEmail="carla@fake.not"
        onOpenSettings={vi.fn()}
        usingAs={{ name: 'Ana Ruiz', email: 'ana@fake.not' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));

    expect(screen.getByText('Coach Carla')).toBeInTheDocument();
    expect(screen.getByText('Using as')).toBeInTheDocument();
    expect(screen.getByText('Ana Ruiz')).toBeInTheDocument();
    expect(screen.getByText('ana@fake.not')).toBeInTheDocument();
  });

  it('puts "Use as student" above Settings for staff in their own view', async () => {
    const user = userEvent.setup();
    const onUseAsStudent = vi.fn();
    render(
      <AccountMenu
        studentName="Coach Carla"
        studentEmail="carla@fake.not"
        onOpenSettings={vi.fn()}
        onUseAsStudent={onUseAsStudent}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    const items = screen.getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Use as student',
      'Settings',
    ]);

    await user.click(items[0]!);

    expect(onUseAsStudent).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('offers Change student, Stop, and Settings, with no Log out, while using as a student', async () => {
    const user = userEvent.setup();
    const onChangeStudent = vi.fn();
    const onStop = vi.fn();
    const onOpenSettings = vi.fn();
    render(
      <AccountMenu
        studentName="Coach Carla"
        studentEmail="carla@fake.not"
        onOpenSettings={onOpenSettings}
        usingAs={{ name: 'Ana Ruiz', email: 'ana@fake.not' }}
        onChangeStudent={onChangeStudent}
        stopUsingAsStudent={{
          label: 'Stop using as student',
          caption: 'Back to your coach view',
          onSelect: onStop,
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(
      screen.queryByRole('menuitem', { name: /Log out/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual([
      'Change student',
      'Stop using as studentBack to your coach view',
      'Settings',
    ]);

    await user.click(screen.getByRole('menuitem', { name: /Change student/ }));
    expect(onChangeStudent).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Account' }));
    await user.click(
      screen.getByRole('menuitem', { name: /Stop using as student/ }),
    );
    expect(onStop).toHaveBeenCalledOnce();
    expect(onOpenSettings).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Account' }));
    await user.click(screen.getByRole('menuitem', { name: 'Settings' }));
    expect(onOpenSettings).toHaveBeenCalledOnce();
  });

  it('falls back to the email initial when the account has no name', () => {
    render(
      <AccountMenu
        studentName=""
        studentEmail="blake@fake.not"
        onOpenSettings={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Account' })).toHaveTextContent(
      'B',
    );
  });

  it('shows neither extra row without those props', async () => {
    const user = userEvent.setup();
    render(
      <AccountMenu
        studentName="Maria Silva"
        studentEmail="maria@example.com"
        onOpenSettings={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));

    expect(screen.queryByText('Using as')).not.toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <AccountMenu
        studentName="Maria Silva"
        studentEmail="maria@example.com"
        onOpenSettings={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
