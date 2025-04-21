import type { Dispatch, SetStateAction } from 'react';
import type { FilterConfig } from 'src/components/Table/types';
import React from 'react';
import { TextInput } from 'src/components/FormComponents';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

export default function FilterCoursesTable({
  filterConfig,
  setFilterConfig,
}: {
  filterConfig: FilterConfig;
  setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
}) {
  const { openContextual } = useContextualMenu();
  const handleFilterChange = (value: string) => {
    setFilterConfig({
      field: 'name',
      value,
      operator: 'contains',
    });
  };
  return (
    <div className="filter-container">
      <TextInput
        label="Filter by course name"
        value={filterConfig.value}
        onChange={handleFilterChange}
        editMode
      />
      <div className="buttonbox newCourseButtonWrapper">
        <button
          className="greenButton"
          type="button"
          onClick={() => openContextual('create-course')}
        >
          New Course
        </button>
      </div>
    </div>
  );
}
