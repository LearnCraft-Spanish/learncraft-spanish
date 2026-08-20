import { TextInput } from '@interface/components/general/TextInput/TextInput';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('text input', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows its value', () => {
    render(<TextInput id="tags" value="verbs" onChange={vi.fn()} />);

    expect(screen.getByDisplayValue('verbs')).toBeInTheDocument();
  });

  it('reports each keystroke', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: string) => void>();
    render(<TextInput id="tags" value="" onChange={onChange} />);

    await user.type(screen.getByRole('textbox'), 'a');

    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('renders a placeholder', () => {
    render(
      <TextInput
        id="tags"
        value=""
        onChange={vi.fn()}
        placeholder="Search tags"
      />,
    );

    expect(screen.getByPlaceholderText('Search tags')).toBeInTheDocument();
  });

  it('insets the text when it has a leading icon', () => {
    const { container } = render(
      <TextInput id="tags" value="" onChange={vi.fn()} leadingIcon="search" />,
    );

    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('marks itself invalid for assistive technology', () => {
    render(<TextInput id="tags" value="" onChange={vi.fn()} invalid />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not report changes while disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value: string) => void>();
    render(<TextInput id="tags" value="" onChange={onChange} disabled />);

    await user.type(screen.getByRole('textbox'), 'a');

    expect(onChange).not.toHaveBeenCalled();
  });
});
