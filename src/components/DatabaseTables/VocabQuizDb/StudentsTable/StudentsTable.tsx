import { Loading } from '@interface/components/Loading';
import Table from 'src/components/Table';
import BackButton from '../../general/BackButton';

import { CreateStudent, EditStudent, FilterStudentsTable } from './components';
import { headers } from './constants';
import { filterFunction, renderStudentRow, sortFunction } from './functions';

import useStudentsTable from './useStudentsTable';
import './StudentsTable.scss';

export default function StudentsTable() {
  const {
    studentToEdit,
    programTableQuery,
    studentsTableQuery,
    states: { isLoading, isError, isSuccess },
    createStudent,
  } = useStudentsTable();

  return (
    <div>
      <BackButton />
      {isLoading && <Loading message="Loading StudentData..." />}
      {isError && (
        <div className="error-message">Error Loading Student Data </div>
      )}
      {isSuccess && (
        <>
          <h2>Students Table</h2>
          <Table
            headers={headers}
            data={studentsTableQuery.data ?? []}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterStudentsTable}
            renderRow={(student) =>
              renderStudentRow(student, programTableQuery.data ?? [])
            }
          />
          {studentToEdit && <EditStudent student={studentToEdit} />}
          {createStudent && <CreateStudent />}
        </>
      )}
    </div>
  );
}
