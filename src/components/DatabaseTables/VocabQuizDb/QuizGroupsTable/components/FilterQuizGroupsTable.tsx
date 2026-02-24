import type { Dispatch, SetStateAction } from 'react';
import type { FilterConfig } from 'src/components/Table/types';
import { TextInput } from '@interface/components/FormComponents';
import React from 'react';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

interface FilterQuizGroupsTableProps {
  filterConfig: FilterConfig;
  setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
}

export default function FilterQuizGroupsTable({
  filterConfig,
  setFilterConfig,
}: FilterQuizGroupsTableProps) {
  const { openContextual } = useContextualMenu();

  const handleNameFilterChange = (value: string) => {
    setFilterConfig({
      field: 'Name',
      value,
      operator: 'contains',
    });
  };

  const handleUrlSlugFilterChange = (value: string) => {
    setFilterConfig({
      field: 'URL Slug',
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
        label="Filter by Name"
        value={filterConfig.field === 'Name' ? filterConfig.value : ''}
        onChange={handleNameFilterChange}
        editMode
      />

      <TextInput
        label="Filter by URL Slug"
        value={filterConfig.field === 'URL Slug' ? filterConfig.value : ''}
        onChange={handleUrlSlugFilterChange}
        editMode
      />

      <TextInput
        label="Filter by Program Name"
        value={filterConfig.field === 'Program Name' ? filterConfig.value : ''}
        onChange={handleProgramNameFilterChange}
        editMode
      />

      <button
        type="button"
        className="greenButton"
        onClick={() => openContextual('create-quiz-group')}
        data-action="create"
      >
        New Quiz Group Record
      </button>
    </div>
  );
}
