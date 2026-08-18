import { Button } from '@interface/components/general/Buttons/Button/Button';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('button', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders its label', () => {
    render(<Button>Continue</Button>);
    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
  });

  it('calls onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    render(<Button onClick={onClick}>Continue</Button>);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<() => void>();
    render(
      <Button disabled onClick={onClick}>
        Continue
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
