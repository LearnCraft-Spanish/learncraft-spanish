import { handleRadioGroupKeyDown } from '@interface/components/customQuiz/SelectorCard/radioGroupKeyNav';
import { SelectorCard } from '@interface/components/customQuiz/SelectorCard/SelectorCard';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

function Group(): React.JSX.Element {
  const [selected, setSelected] = useState<'a' | 'b' | 'c'>('a');
  return (
    <div
      role="radiogroup"
      aria-label="Example"
      onKeyDown={handleRadioGroupKeyDown}
    >
      <SelectorCard
        icon="cards"
        label="A"
        selected={selected === 'a'}
        onSelect={() => setSelected('a')}
      />
      <SelectorCard
        icon="cards"
        label="B"
        selected={selected === 'b'}
        onSelect={() => setSelected('b')}
      />
      <SelectorCard
        icon="cards"
        label="C"
        selected={selected === 'c'}
        onSelect={() => setSelected('c')}
      />
    </div>
  );
}

describe('handleRadioGroupKeyDown', () => {
  it('moves selection to the next option on ArrowRight, wrapping at the end', async () => {
    const user = userEvent.setup();
    render(<Group />);

    screen.getByRole('radio', { name: 'A' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'B' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();

    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'A' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  });

  it('moves selection to the previous option on ArrowLeft, wrapping at the start', async () => {
    const user = userEvent.setup();
    render(<Group />);

    screen.getByRole('radio', { name: 'A' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'C' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
  });

  it('ignores keys other than the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Group />);

    screen.getByRole('radio', { name: 'A' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('radio', { name: 'A' })).toBeChecked();
  });
});
