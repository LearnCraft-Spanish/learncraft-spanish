import { useMemo, useState } from 'react';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useStudentsTable from 'src/hooks/VocabQuizDbData/useStudentsTable';
import { Loading } from '../Loading';
import EditStudentView from './components/EditStudentView';
import StudentTableRow from './components/StudentTableRow';
import Table from './components/Table';

type SortDirection = 'ascending' | 'descending' | 'none';

interface SortConfig {
  key: string;
  direction: SortDirection;
}

export default function VocabQuizDbTables() {
  const { studentsTableQuery } = useStudentsTable();
  const { contextual } = useContextualMenu();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: 'none',
  });

  const isLoading = studentsTableQuery.isLoading;
  const isError = studentsTableQuery.isError;
  const isSuccess = studentsTableQuery.isSuccess;

  const handleSort = (header: string) => {
    console.log('handleSort', header);
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

  return (
    <div>
      {isLoading && <Loading message="Loading StudentData..." />}
      {isError && <div>Error Loading Student Data </div>}
      {isSuccess && (
        <>
          <Table
            headers={['Edit Record', 'Name', 'Email', 'Cohort', 'Role']}
            data={sortedData}
            renderRow={StudentTableRow}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
          {contextual.startsWith('edit-student-') && (
            <EditStudentView
              student={sortedData.find(
                (student) =>
                  student.recordId ===
                  Number(contextual.split('edit-student-')[1]),
              )}
            />
          )}
        </>
      )}
    </div>
  );
}
