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

  it('is a primary button at the standalone size by default', () => {
    render(<Button>Continue</Button>);

    const className = screen.getByRole('button', {
      name: 'Continue',
    }).className;

    expect(className).toContain('primary');
    expect(className).toContain('md');
  });

  it('applies the requested variant and size', () => {
    render(
      <Button variant="secondary" size="sm">
        Do more with these
      </Button>,
    );

    const className = screen.getByRole('button', {
      name: 'Do more with these',
    }).className;

    expect(className).toContain('secondary');
    expect(className).toContain('sm');
  });

  it('supports the on-dark tone', () => {
    render(
      <Button variant="secondary" tone="onDark">
        Change student
      </Button>,
    );

    expect(
      screen.getByRole('button', { name: 'Change student' }).className,
    ).toContain('onDark');
  });

  it('drops a ghost button to the muted color when asked', () => {
    render(
      <Button variant="ghost" muted>
        Reset all filters
      </Button>,
    );

    expect(
      screen.getByRole('button', { name: 'Reset all filters' }).className,
    ).toContain('muted');
  });

  it('renders leading and trailing icons as decoration', () => {
    const { container } = render(
      <Button leadingIcon="bolt" trailingIcon="chevronDown">
        Do more with these
      </Button>,
    );

    const glyphs = container.querySelectorAll('svg');

    expect(glyphs).toHaveLength(2);
    expect(glyphs[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the label as the accessible name when it has icons', () => {
    render(<Button leadingIcon="bookmark">Verbs</Button>);

    expect(screen.getByRole('button', { name: 'Verbs' })).toBeInTheDocument();
  });
});
