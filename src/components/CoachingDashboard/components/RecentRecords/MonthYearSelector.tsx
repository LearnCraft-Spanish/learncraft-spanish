import { useState } from 'react';

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
      value: `${String(date.getMonth() + 1).padStart(2, '0')}:${date.getFullYear()}`,
    });
  }

  return months;
};

export default function MonthYearSelector({
  selectedMonthYear,
  setSelectedMonthYear,
}: {
  selectedMonthYear: string;
  setSelectedMonthYear: (monthYear: string) => void;
}) {
  const [numMonths, setNumMonths] = useState(12); // Start with 12 months
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
