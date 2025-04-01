import { useState } from 'react';

const months = [
  {
    name: 'January',
    value: 0,
  },
  {
    name: 'February',
    value: 1,
  },
  {
    name: 'March',
    value: 2,
  },
  {
    name: 'April',
    value: 3,
  },
  {
    name: 'May',
    value: 4,
  },
  {
    name: 'June',
    value: 5,
  },
  {
    name: 'July',
    value: 6,
  },
  {
    name: 'August',
    value: 7,
  },
  {
    name: 'September',
    value: 8,
  },
  {
    name: 'October',
    value: 9,
  },
  {
    name: 'November',
    value: 10,
  },
  {
    name: 'December',
    value: 11,
  },
];

export default function MonthSelector({
  selectedMonth,
  setSelectedMonth,
}: {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
}) {
  return (
    <div>
      <label htmlFor="month-selector">Select Month</label>
      <select
        id="month-selector"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.name}
          </option>
        ))}
      </select>
    </div>
  );
}
