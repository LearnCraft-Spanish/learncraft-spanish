import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loading } from 'src/components/Loading';
import Table from 'src/components/Table';
import useLessonsTable from 'src/hooks/StudentRecordsData/useLessonsTable';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { CreateLesson, EditLesson } from './components/EditLessonView';
import FilterLessonsTable from './components/FilterLessonsTable';
import { filterFunction, renderLessonRow, sortFunction } from './functions';
import './LessonsTable.scss';

export default function LessonsTable() {
  const { lessonsTableQuery } = useLessonsTable();
  const { contextual } = useContextualMenu();

  const lessonToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-lesson-')) {
      return undefined;
    }

    const recordId = Number(contextual.split('edit-lesson-')[1]);
    return lessonsTableQuery.data?.find(
      (lesson) => lesson.recordId === recordId,
    );
  }, [lessonsTableQuery.data, contextual]);

  return (
    <div>
      <div className="back-button-container">
        <Link to="/database-tables" className="back-button">
          ← Back to Tables
        </Link>
      </div>
      {lessonsTableQuery.isLoading && (
        <Loading message="Loading Lesson Data..." />
      )}
      {lessonsTableQuery.isError && <div>Error Loading Lesson Data</div>}
      {lessonsTableQuery.isSuccess && (
        <>
          <h2>Lessons Table</h2>
          <Table
            headers={[
              { header: 'Edit Record', sortable: false },
              { header: 'Lesson Name', sortable: true, noWrap: true },
              { header: 'Week Ref', sortable: true },
              { header: 'Type', sortable: true },
            ]}
            data={lessonsTableQuery.data}
            renderRow={renderLessonRow}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterLessonsTable}
          />
          {lessonToEdit && <EditLesson lesson={lessonToEdit} />}
          {contextual === 'create-lesson' && <CreateLesson />}
        </>
      )}
    </div>
  );
}
