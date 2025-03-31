import type { FlashcardStudent } from 'src/types/interfaceDefinitions';
import type { FilterConfig, SortConfig } from './types';
import { useCallback, useMemo, useState } from 'react';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useStudentsTable from 'src/hooks/VocabQuizDbData/useStudentsTable';
import { Loading } from '../Loading';
import { CreateStudent, EditStudent } from './components/EditStudentView';
import FilterStudentsTable from './components/FilterStudentsTable';
import StudentTableRow from './components/StudentTableRow';
import Table from './components/Table';

export default function VocabQuizDbTables() {
  const { studentsTableQuery, cohortFieldOptionsQuery, programTableQuery } =
    useStudentsTable();

  const { contextual, openContextual } = useContextualMenu();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: 'none',
  });

  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    field: '',
    value: '',
    operator: '',
  });

  const isLoading =
    studentsTableQuery.isLoading ||
    cohortFieldOptionsQuery.isLoading ||
    programTableQuery.isLoading;
  const isError =
    studentsTableQuery.isError ||
    cohortFieldOptionsQuery.isError ||
    programTableQuery.isError;
  const isSuccess =
    studentsTableQuery.isSuccess &&
    cohortFieldOptionsQuery.isSuccess &&
    programTableQuery.isSuccess;

  const handleSort = (header: string) => {
    setSortConfig((currentConfig) => {
      // If clicking a different header, start with ascending
      if (currentConfig.key !== header) {
        return {
          key: header,
          direction: 'ascending',
        };
      }

      // If clicking the same header, cycle through: ascending -> descending -> none
      switch (currentConfig.direction) {
        case 'ascending':
          return {
            key: header,
            direction: 'descending',
          };
        case 'descending':
          return {
            key: '',
            direction: 'none',
          };
        case 'none':
        default:
          return {
            key: header,
            direction: 'ascending',
          };
      }
    });
  };

  const sortedData = useMemo(() => {
    if (!studentsTableQuery.data || sortConfig.direction === 'none') {
      return studentsTableQuery.data || [];
    }

    const sorted = [...studentsTableQuery.data];
    sorted.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      // Map the header to the corresponding field
      switch (sortConfig.key) {
        case 'Name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'Email':
          aValue = a.emailAddress.toLowerCase();
          bValue = b.emailAddress.toLowerCase();
          break;
        case 'Program':
          aValue = a.relatedProgram.toString();
          bValue = b.relatedProgram.toString();
          break;
        case 'Cohort':
          aValue = a.cohort?.toLowerCase() || '';
          bValue = b.cohort?.toLowerCase() || '';
          break;
        case 'Role':
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (sortConfig.direction === 'ascending') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return sorted;
  }, [studentsTableQuery.data, sortConfig]);

  const filteredAndSortedData = useMemo(() => {
    if (!filterConfig.field || !filterConfig.value) {
      return sortedData;
    }

    return sortedData.filter((student) => {
      if (filterConfig.field === 'name') {
        return student.name
          .toLowerCase()
          .includes(filterConfig.value.toLowerCase());
      }
      return true;
    });
  }, [sortedData, filterConfig]);

  const renderStudentRow = useCallback(
    (student: FlashcardStudent) => {
      const programName = programTableQuery.data?.find(
        (program) => program.recordId === student.relatedProgram,
      )?.name;

      return (
        <StudentTableRow
          key={student.recordId}
          student={student}
          programName={programName}
        />
      );
    },
    [programTableQuery.data],
  );

  const studentToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-student-')) {
      return undefined;
    }

    const recordId = Number(contextual.split('edit-student-')[1]);
    return filteredAndSortedData.find(
      (student) => student.recordId === recordId,
    );
  }, [filteredAndSortedData, contextual]);

  return (
    <div>
      {isLoading && <Loading message="Loading StudentData..." />}
      {isError && <div>Error Loading Student Data </div>}
      {isSuccess && (
        <>
          <FilterStudentsTable
            filterConfig={filterConfig}
            setFilterConfig={setFilterConfig}
          />
          <div className="buttonbox">
            <button
              className="greenButton"
              type="button"
              onClick={() => openContextual('create-student')}
            >
              New Student
            </button>
          </div>
          <Table
            headers={[
              'Edit Record',
              'Name',
              'Email',
              'Program',
              'Cohort',
              'Role',
            ]}
            data={filteredAndSortedData}
            renderRow={renderStudentRow}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          {studentToEdit && <EditStudent student={studentToEdit} />}
          {contextual === 'create-student' && <CreateStudent />}
        </>
      )}
    </div>
  );
}
