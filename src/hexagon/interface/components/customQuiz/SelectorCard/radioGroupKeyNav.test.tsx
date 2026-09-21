import { handleRadioGroupKeyDown } from '@interface/components/customQuiz/SelectorCard/radioGroupKeyNav';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

function renderGroup(onSelect = vi.fn()): void {
  render(
    <div role="radiogroup" onKeyDown={handleRadioGroupKeyDown}>
      {['A', 'B', 'C'].map((label) => (
        <button
          key={label}
          type="button"
          role="radio"
          onClick={() => onSelect(label)}
        >
          {label}
        </button>
      ))}
    </div>,
  );
}

describe('handleRadioGroupKeyDown', () => {
  it('moves selection to the next radio on ArrowRight', () => {
    const onSelect = vi.fn();
    renderGroup(onSelect);
    const [first, second] = screen.getAllByRole('radio');
    first.focus();

    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });

    expect(document.activeElement).toBe(second);
    expect(onSelect).toHaveBeenCalledWith('B');
  });

  it('wraps from the first radio to the last on ArrowUp', () => {
    const onSelect = vi.fn();
    renderGroup(onSelect);
    const radios = screen.getAllByRole('radio');
    radios[0].focus();

    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowUp' });

    expect(document.activeElement).toBe(radios[2]);
    expect(onSelect).toHaveBeenCalledWith('C');
  });

  it('ignores keys that are not arrows', () => {
    const onSelect = vi.fn();
    renderGroup(onSelect);
    const [first] = screen.getAllByRole('radio');
    first.focus();

    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'Enter' });

    expect(document.activeElement).toBe(first);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does nothing when focus is outside the radio group', () => {
    const onSelect = vi.fn();
    renderGroup(onSelect);

    fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
