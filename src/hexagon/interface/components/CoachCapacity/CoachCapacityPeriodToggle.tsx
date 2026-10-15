import type { CoachCapacityPeriod } from '@domain/functions/coachCapacity';
import type { JSX } from 'react';
import styles from './CoachCapacityPeriodToggle.module.scss';

const periodOptions: { period: CoachCapacityPeriod; label: string }[] = [
  { period: 'today', label: 'Today' },
  { period: 'twoWeeksOut', label: 'Two Weeks Out' },
];

export interface CoachCapacityPeriodToggleProps {
  period: CoachCapacityPeriod;
  onSelect: (period: CoachCapacityPeriod) => void;
}

export function CoachCapacityPeriodToggle({
  period,
  onSelect,
}: CoachCapacityPeriodToggleProps): JSX.Element {
  return (
    <div className={styles.root} role="group" aria-label="Report period">
      {periodOptions.map((option) => {
        const selected = option.period === period;
        return (
          <button
            key={option.period}
            type="button"
            className={selected ? styles.selected : styles.option}
            aria-pressed={selected}
            onClick={() => onSelect(option.period)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
