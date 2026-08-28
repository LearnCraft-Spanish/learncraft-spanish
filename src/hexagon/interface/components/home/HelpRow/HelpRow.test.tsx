import { HelpRow } from '@interface/components/home/HelpRow/HelpRow';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('help row', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the label and hint', () => {
    render(<HelpRow onGo={vi.fn()} />);

    expect(screen.getByText('Help & walkthroughs')).toBeInTheDocument();
    expect(screen.getByText('FAQ and short video guides')).toBeInTheDocument();
  });

  it('calls onGo when chosen', async () => {
    const user = userEvent.setup();
    const onGo = vi.fn();
    render(<HelpRow onGo={onGo} />);

    await user.click(
      screen.getByRole('button', { name: /Help & walkthroughs/ }),
    );

    expect(onGo).toHaveBeenCalledOnce();
  });
});
