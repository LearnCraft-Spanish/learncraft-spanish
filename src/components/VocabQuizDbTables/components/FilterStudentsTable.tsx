import type { Dispatch, SetStateAction } from 'react';
import { TextInput } from 'src/components/FormComponents/TextInput';

interface FilterConfig {
  field: string;
  value: string;
  operator: string;
}

interface FilterStudentsTableProps {
  filterConfig: FilterConfig;
  setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
}

export default function FilterStudentsTable({
  filterConfig,
  setFilterConfig,
}: FilterStudentsTableProps) {
  const handleNameFilterChange = (value: string) => {
    setFilterConfig({
      field: 'name',
      value,
      operator: 'contains',
    });
  };

  return (
    <div className="filter-container">
      <TextInput
        label="Filter by Name"
        value={filterConfig.field === 'name' ? filterConfig.value : ''}
        onChange={handleNameFilterChange}
        editMode
      />
    </div>
  );
}
