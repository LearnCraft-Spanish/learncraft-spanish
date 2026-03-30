import ToggleSwitch from '@interface/components/general/ToggleSwitch/ToggleSwitch';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function renderToggleSwitch(overrides: Record<string, unknown> = {}) {
  const defaultProps = {
    id: 'audioOnly',
    ariaLabel: 'audio-only toggle',
    label: 'Audio only',
    checked: false,
    onChange: vi.fn(),
    ...overrides,
  };

  return {
    ...render(<ToggleSwitch {...defaultProps} />),
    props: defaultProps,
  };
}

describe('toggleSwitch', () => {
  it('renders label text and a checkbox with expected attributes', () => {
    renderToggleSwitch({
      checked: true,
    });

    const checkbox = screen.getByRole('checkbox', {
      name: 'audio-only toggle',
    }) as HTMLInputElement;

    expect(screen.getByText('Audio only')).toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute('id', 'audioOnly');
    expect(checkbox).toHaveAttribute('name', 'audioOnly');
  });

  it('calls onChange when the user toggles the switch', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderToggleSwitch({
      onChange,
    });

    await user.click(
      screen.getByRole('checkbox', {
        name: 'audio-only toggle',
      }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('applies wrapper id and disabled state when provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = renderToggleSwitch({
      wrapperId: 'audioOnlyWrapper',
      disabled: true,
      onChange,
    });

    const wrapper = container.querySelector('#audioOnlyWrapper');
    const checkbox = screen.getByRole('checkbox', {
      name: 'audio-only toggle',
    });

    expect(wrapper).toBeInTheDocument();
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets visual state color based on checked prop', () => {
    const { rerender } = render(
      <ToggleSwitch
        id="audioOnly"
        ariaLabel="audio-only toggle"
        label="Audio only"
        checked={false}
        onChange={vi.fn()}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: 'audio-only toggle',
    });
    expect(checkbox).toHaveAttribute(
      'style',
      expect.stringContaining('background-color: darkred;'),
    );

    rerender(
      <ToggleSwitch
        id="audioOnly"
        ariaLabel="audio-only toggle"
        label="Audio only"
        checked
        onChange={vi.fn()}
      />,
    );

    expect(checkbox).toHaveAttribute(
      'style',
      expect.stringContaining('background-color: darkgreen;'),
    );
  });
});
