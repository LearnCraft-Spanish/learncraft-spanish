import { useMemo } from 'react';
import { Loading } from 'src/components/Loading';
import Table from 'src/components/Table';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useStudentsTable from 'src/hooks/VocabQuizDbData/useStudentsTable';
import { CreateStudent, EditStudent, FilterStudentsTable } from './components';
import { filterFunction, renderStudentRow, sortFunction } from './functions';

export default function VocabQuizDbTables() {
  const { studentsTableQuery, programTableQuery } = useStudentsTable();
  const { contextual } = useContextualMenu();

  const studentToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-student-')) {
      return undefined;
    }

    const recordId = Number(contextual.split('edit-student-')[1]);
    return studentsTableQuery.data?.find(
      (student) => student.recordId === recordId,
    );
  }, [studentsTableQuery.data, contextual]);

  return (
    <div>
      {studentsTableQuery.isLoading && (
        <Loading message="Loading StudentData..." />
      )}
      {studentsTableQuery.isError && <div>Error Loading Student Data </div>}
      {studentsTableQuery.isSuccess && (
        <>
          <Table
            headers={[
              { header: 'Edit Record', sortable: false },
              { header: 'Name', sortable: true },
              { header: 'Email', sortable: true },
              { header: 'Program', sortable: true },
              { header: 'Cohort', sortable: true },
              { header: 'Role', sortable: true },
            ]}
            data={studentsTableQuery.data}
            renderRow={(student) =>
              renderStudentRow(student, programTableQuery.data)
            }
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterStudentsTable}
          />
          {studentToEdit && <EditStudent student={studentToEdit} />}
          {contextual === 'create-student' && <CreateStudent />}
        </>
      )}
    </div>
  );
}
