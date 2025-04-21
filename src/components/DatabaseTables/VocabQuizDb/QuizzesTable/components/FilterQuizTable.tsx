import type { Dispatch, SetStateAction } from 'react';
import type { FilterConfig } from 'src/components/Table/types';
import React from 'react';
import { TextInput } from 'src/components/FormComponents/TextInput';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

interface FilterQuizTableProps {
  filterConfig: FilterConfig;
  setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
}

export default function FilterQuizTable({
  filterConfig,
  setFilterConfig,
}: FilterQuizTableProps) {
  const { openContextual } = useContextualMenu();

  const handleNameFilterChange = (value: string) => {
    setFilterConfig({
      field: 'Quiz Nickname',
      value,
      operator: 'contains',
    });
  };

  return (
    <div className="filter-container">
      <TextInput
        label="Filter by Quiz Nickname"
        value={filterConfig.field === 'Quiz Nickname' ? filterConfig.value : ''}
        onChange={handleNameFilterChange}
        editMode
      />

      <button
        type="button"
        className="greenButton"
        onClick={() => openContextual('create-quiz')}
        data-action="create"
      >
        New Quiz Record
      </button>
    </div>
  );
}
