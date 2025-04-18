import type { Dispatch, SetStateAction } from 'react';
import type { FilterConfig } from 'src/components/Table/types';
import { TextInput } from 'src/components/FormComponents/TextInput';

export default function FilterProgramsTable({
  filterConfig,
  setFilterConfig,
}: {
  filterConfig: FilterConfig;
  setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
}) {
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
