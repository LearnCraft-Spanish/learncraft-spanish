import type { Dispatch, SetStateAction } from 'react';
import type { FilterConfig } from 'src/components/Table/types';

import { TextInput } from 'src/components/FormComponents/TextInput';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

export default function FilterStudentsTable({
  filterConfig,
  setFilterConfig,
}: {
  filterConfig: FilterConfig;
  setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
}) {
  const { openContextual } = useContextualMenu();
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
      <div className="buttonbox newStudentButtonWrapper">
        <button
          className="greenButton"
          type="button"
          onClick={() => openContextual('create-student')}
        >
          New Student
        </button>
      </div>
    </div>
  );
}
