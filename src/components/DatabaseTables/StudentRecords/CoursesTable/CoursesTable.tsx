import { Loading } from 'src/components/Loading';
import Table from 'src/components/Table';
import BackButton from '../../general/BackButton';

import { CreateCourse, EditCourse, FilterCoursesTable } from './components';
import { headers } from './constants';
import { filterFunction, renderCourseRow, sortFunction } from './functions';

import useCoursesTable from './useCoursesTable';
import './CoursesTable.scss';

export default function CoursesTable() {
  const {
    courseToEdit,
    coursesTableQuery,
    states: { isLoading, isError, isSuccess },
    createCourse,
  } = useCoursesTable();

  return (
    <div>
      <BackButton />

      {isLoading && <Loading message="Loading Course Data..." />}
      {isError && (
        <div className="error-message">Error Loading Course Data</div>
      )}
      {isSuccess && (
        <>
          <h2>Courses Table</h2>
          <Table
            headers={headers}
            data={coursesTableQuery.data ?? []}
            renderRow={renderCourseRow}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterCoursesTable}
          />
          {courseToEdit && <EditCourse course={courseToEdit} />}
          {createCourse && <CreateCourse />}
        </>
      )}
    </div>
  );
}
