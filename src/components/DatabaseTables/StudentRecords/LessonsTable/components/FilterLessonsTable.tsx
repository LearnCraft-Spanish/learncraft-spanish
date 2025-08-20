import type { Dispatch, SetStateAction } from 'react';
import type { FilterConfig } from 'src/components/Table/types';
import { TextInput } from 'src/components/FormComponents';
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
        label="Filter by lesson name"
        value={filterConfig.value}
        onChange={handleFilterChange}
        editMode
      />
      <div className="buttonbox newLessonButtonWrapper">
        <button
          className="greenButton"
          type="button"
          onClick={() => openContextual('create-lesson')}
        >
          New Lesson
        </button>
      </div>
    </div>
  );
}
