import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loading } from 'src/components/Loading';
import Table from 'src/components/Table';
import useCoursesTable from 'src/hooks/StudentRecordsData/useCoursesTable';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { CreateCourse, EditCourse } from './components/EditCourseView';
import FilterCoursesTable from './components/FilterCoursesTable';
import { filterFunction, renderCourseRow, sortFunction } from './functions';
import './CoursesTable.scss';

export default function CoursesTable() {
  const { coursesTableQuery } = useCoursesTable();
  const { contextual } = useContextualMenu();

  const courseToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-course-')) {
      return undefined;
    }

    const recordId = Number(contextual.split('edit-course-')[1]);
    return coursesTableQuery.data?.find(
      (course) => course.recordId === recordId,
    );
  }, [coursesTableQuery.data, contextual]);

  return (
    <div>
      <div className="back-button-container">
        <Link to="/database-tables" className="back-button">
          ← Back to Tables
        </Link>
      </div>
      {coursesTableQuery.isLoading && (
        <Loading message="Loading Course Data..." />
      )}
      {coursesTableQuery.isError && <div>Error Loading Course Data</div>}
      {coursesTableQuery.isSuccess && (
        <>
          <h2>Courses Table</h2>
          <Table
            headers={[
              { header: 'Edit Record', sortable: false },
              { header: 'Course Name', sortable: true, noWrap: true },
              { header: 'Membership Type', sortable: true },
              { header: 'Monthly Cost', sortable: true },
              { header: 'Weekly Private Calls', sortable: true },
              { header: 'Has Group Calls', sortable: true },
              { header: 'Weekly Time (mins)', sortable: true },
            ]}
            data={coursesTableQuery.data}
            renderRow={renderCourseRow}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterCoursesTable}
          />
          {courseToEdit && <EditCourse course={courseToEdit} />}
          {contextual === 'create-course' && <CreateCourse />}
        </>
      )}
    </div>
  );
}
