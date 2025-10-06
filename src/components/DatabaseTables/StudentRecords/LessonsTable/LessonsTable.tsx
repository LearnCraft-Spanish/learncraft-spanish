import { Loading } from '@interface/components/Loading';
import Table from 'src/components/Table';
import BackButton from '../../general/BackButton';

import { CreateLesson, EditLesson, FilterLessonsTable } from './components';
import { headers } from './constants';
import { filterFunction, renderLessonRow, sortFunction } from './functions';

import useLessonsTable from './useLessonsTable';
import './LessonsTable.scss';

export default function LessonsTable() {
  const {
    lessonToEdit,
    lessonsTableQuery,
    states: { isLoading, isError, isSuccess },
    createLesson,
  } = useLessonsTable();

  return (
    <div>
      <BackButton />
      {isLoading && <Loading message="Loading Lesson Data..." />}
      {isError && (
        <div className="error-message">Error Loading Lesson Data</div>
      )}
      {isSuccess && (
        <>
          <h2>Lessons Table</h2>
          <Table
            headers={headers}
            data={lessonsTableQuery.data ?? []}
            renderRow={renderLessonRow}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterLessonsTable}
          />
          {lessonToEdit && <EditLesson lesson={lessonToEdit} />}
          {createLesson && <CreateLesson />}
        </>
      )}
    </div>
  );
}
