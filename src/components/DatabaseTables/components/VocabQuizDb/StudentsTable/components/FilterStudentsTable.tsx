import type { Dispatch, SetStateAction } from 'react';
import type { FilterConfig } from 'src/components/Table/types';

import { useEffect, useState } from 'react';
import {
  Dropdown,
  GenericDropdown,
  TextInput,
} from 'src/components/FormComponents';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useStudentsTable from '../useStudentsTable';

const cohortOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// Define filter field type for type safety
type FilterField = 'name' | 'program' | 'cohort';

export default function FilterStudentsTable({
  filterConfig,
  setFilterConfig,
}: {
  filterConfig: FilterConfig;
  setFilterConfig: Dispatch<SetStateAction<FilterConfig>>;
}) {
  const { openContextual } = useContextualMenu();
  const { programTableQuery } = useStudentsTable();

  // Create a state to track all filter values simultaneously
  const [filterValues, setFilterValues] = useState({
    name: '',
    program: '',
    cohort: '',
  });

  // Initialize filterValues from existing filterConfig if available
  useEffect(() => {
    // Prevent infinite loop by checking if we need to update
    const needsUpdate =
      // For multi-filter
      (filterConfig.field === 'multi-filter' && filterConfig.value) ||
      // For legacy single filter
      (filterConfig.field &&
        filterConfig.value &&
        (filterConfig.field === 'name' ||
          filterConfig.field === 'program' ||
          filterConfig.field === 'cohort'));

    if (!needsUpdate) return;

    if (filterConfig.field === 'multi-filter' && filterConfig.value) {
      try {
        const parsedFilters = JSON.parse(filterConfig.value);
        setFilterValues((prevValues) => {
          // Only update if values are different to prevent potential re-render cycles
          if (
            prevValues.name === (parsedFilters.name || '') &&
            prevValues.program === (parsedFilters.program || '') &&
            prevValues.cohort === (parsedFilters.cohort || '')
          ) {
            return prevValues;
          }

          return {
            name: parsedFilters.name || '',
            program: parsedFilters.program || '',
            cohort: parsedFilters.cohort || '',
          };
        });
      } catch {
        // If parsing fails, just use empty values
        setFilterValues({
          name: '',
          program: '',
          cohort: '',
        });
      }
    } else if (filterConfig.field && filterConfig.value) {
      // Handle legacy single filter configuration
      setFilterValues((prevValues) => {
        const newFilterValues = { ...prevValues };

        // Only set the value if the field is a valid filter field
        const field = filterConfig.field as FilterField;
        if (field === 'name' || field === 'program' || field === 'cohort') {
          newFilterValues[field] = filterConfig.value;
        }

        // Only update if values are different
        if (JSON.stringify(prevValues) === JSON.stringify(newFilterValues)) {
          return prevValues;
        }

        return newFilterValues;
      });
    }
  }, [filterConfig]); // Add filterConfig as a dependency

  // Update the filter configuration when any filter value changes
  const updateFilterConfig = (newValues: typeof filterValues) => {
    setFilterValues(newValues);

    // Only include filters with values
    const activeFilters = Object.fromEntries(
      Object.entries(newValues).filter(([_, value]) => value !== ''),
    );

    // If no filters are active, reset the filterConfig
    if (Object.keys(activeFilters).length === 0) {
      setFilterConfig({
        field: '',
        value: '',
        operator: '',
      });
      return;
    }

    // Update the filter configuration with all active filters
    setFilterConfig({
      field: 'multi-filter',
      value: JSON.stringify(activeFilters),
      operator: 'contains',
    });
  };

  const handleNameFilterChange = (value: string) => {
    updateFilterConfig({
      ...filterValues,
      name: value,
    });
  };

  const handleProgramFilterChange = (value: string) => {
    updateFilterConfig({
      ...filterValues,
      program: value,
    });
  };

  const handleCohortFilterChange = (value: string) => {
    updateFilterConfig({
      ...filterValues,
      cohort: value,
    });
  };

  const dataReady = programTableQuery.isSuccess;

  return (
    dataReady && (
      <div className="filter-container">
        <div className="filter-fields">
          <TextInput
            label="Filter by Name"
            value={filterValues.name}
            onChange={handleNameFilterChange}
            editMode
          />
          <GenericDropdown
            label="Filter by Program"
            selectedValue={filterValues.program}
            onChange={handleProgramFilterChange}
            options={programTableQuery.data?.map((program) => ({
              value: program.recordId.toString(),
              text: program.name,
            }))}
            editMode
          />
          <Dropdown
            label="Filter by Cohort"
            value={filterValues.cohort}
            onChange={handleCohortFilterChange}
            options={cohortOptions}
            editMode
          />
        </div>
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
    )
  );
}
