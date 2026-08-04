import { useState } from 'react';

function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const generateMonthYears = (numMonthsToShow: number) => {
  const months = [];
  const currentDate = new Date();

  for (let i = 0; i < numMonthsToShow; i++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1,
    );
    months.push({
      name: `${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`,
      value: toYearMonth(date),
    });
  }

  return months;
};

export function getDefaultMonthYear(): string {
  return toYearMonth(new Date());
}

export default function MonthYearSelector({
  selectedMonthYear,
  setSelectedMonthYear,
}: {
  selectedMonthYear: string;
  setSelectedMonthYear: (monthYear: string) => void;
}) {
  const [numMonths, setNumMonths] = useState(12);
  const months = generateMonthYears(numMonths);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'loadMore') {
      setNumMonths((prev) => prev + 12);
      return;
    }
    setSelectedMonthYear(value);
  };

  return (
    <div className="monthSelectorContainer">
      <label className="monthSelectorLabel" htmlFor="monthSelector">
        Select Month:
      </label>
      <select
        id="monthSelector"
        value={selectedMonthYear}
        onChange={handleChange}
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.name}
          </option>
        ))}
        <option value="loadMore" className="loadMoreOption">
          Load More Months...
        </option>
      </select>
    </div>
  );
}
