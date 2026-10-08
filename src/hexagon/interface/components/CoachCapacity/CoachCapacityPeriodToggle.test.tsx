import { CoachCapacityPeriodToggle } from '@interface/components/CoachCapacity/CoachCapacityPeriodToggle';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('coach capacity period toggle', () => {
  it('labels the two periods without dates and marks the selected one', () => {
    render(
      <CoachCapacityPeriodToggle period="twoWeeksOut" onSelect={vi.fn()} />,
    );

    const group = screen.getByRole('group', { name: 'Report period' });
    expect(
      within(group)
        .getAllByRole('button')
        .map((button) => [
          button.textContent,
          button.getAttribute('aria-pressed'),
        ]),
    ).toEqual([
      ['Today', 'false'],
      ['Two Weeks Out', 'true'],
    ]);
  });

  it.each([
    { label: 'Today', period: 'today' },
    { label: 'Two Weeks Out', period: 'twoWeeksOut' },
  ] as const)('selects $period on $label', ({ label, period }) => {
    const onSelect = vi.fn();
    render(<CoachCapacityPeriodToggle period="today" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(period);
  });
});
