import { Loading } from '@interface/components/Loading';
import Table from 'src/components/Table';
import BackButton from '../../general/BackButton';

import { CreateLesson, EditLesson, FilterLessonsTable } from './components';
import { headers } from './constants';
import { filterFunction, renderLessonRow, sortFunction } from './functions';

import useVqdLessonsTable from './useVqdLessonsTable';
import './VqdLessonsTable.scss';

export default function VqdLessonsTable() {
  const {
    lessonToEdit,
    vqdLessonsTableQuery,
    states: { isLoading, isError, isSuccess },
    createLesson,
  } = useVqdLessonsTable();

  return (
    <div>
      <BackButton />
      {isLoading && <Loading message="Loading Lesson Data..." />}
      {isError && (
        <div className="error-message">Error Loading Lesson Data</div>
      )}
      {isSuccess && (
        <>
          <h2>Vocab/Quiz DB Lessons Table</h2>
          <Table
            headers={headers}
            data={vqdLessonsTableQuery.data ?? []}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterLessonsTable}
            renderRow={(lesson) => renderLessonRow(lesson)}
          />
          {lessonToEdit && <EditLesson lesson={lessonToEdit} />}
          {createLesson && <CreateLesson />}
        </>
      )}
    </div>
  );
}
