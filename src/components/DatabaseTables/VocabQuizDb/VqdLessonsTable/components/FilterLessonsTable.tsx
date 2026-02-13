import type { Dispatch, SetStateAction } from 'react';
import type { FilterConfig } from 'src/components/Table/types';
import { TextInput } from '@interface/components/FormComponents';
import React from 'react';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

interface FilterLessonsTableProps {
  filterConfig: FilterConfig;
  setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
}

export default function FilterLessonsTable({
  filterConfig,
  setFilterConfig,
}: FilterLessonsTableProps) {
  const { openContextual } = useContextualMenu();

  const handleLessonFilterChange = (value: string) => {
    setFilterConfig({
      field: 'Lesson',
      value,
      operator: 'contains',
    });
  };

  const handleSubtitleFilterChange = (value: string) => {
    setFilterConfig({
      field: 'Subtitle',
      value,
      operator: 'contains',
    });
  };

  const handleProgramNameFilterChange = (value: string) => {
    setFilterConfig({
      field: 'Program Name',
      value,
      operator: 'contains',
    });
  };

  return (
    <div className="filter-container">
      <TextInput
        label="Filter by Lesson"
        value={filterConfig.field === 'Lesson' ? filterConfig.value : ''}
        onChange={handleLessonFilterChange}
        editMode
      />

      <TextInput
        label="Filter by Subtitle"
        value={filterConfig.field === 'Subtitle' ? filterConfig.value : ''}
        onChange={handleSubtitleFilterChange}
        editMode
      />

      <TextInput
        label="Filter by Program Name"
        value={
          filterConfig.field === 'Program Name' ? filterConfig.value : ''
        }
        onChange={handleProgramNameFilterChange}
        editMode
      />

      <button
        type="button"
        className="greenButton"
        onClick={() => openContextual('create-vqd-lesson')}
        data-action="create"
      >
        New Lesson Record
      </button>
    </div>
  );
}
