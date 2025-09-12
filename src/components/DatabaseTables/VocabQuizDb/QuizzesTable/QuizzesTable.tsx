import { Loading } from '@interface/components/Loading';
import Table from 'src/components/Table';
import BackButton from '../../general/BackButton';

import { CreateQuiz, EditQuiz, FilterQuizTable } from './components';
import { headers } from './constants';
import { filterFunction, renderQuizRow, sortFunction } from './functions';

import useQuizTable from './useQuizTable';
import './QuizzesTable.scss';

export default function QuizzesTable() {
  const {
    quizToEdit,
    quizTableQuery,
    states: { isLoading, isError, isSuccess },
    createQuiz,
  } = useQuizTable();

  return (
    <div>
      <BackButton />
      {isLoading && <Loading message="Loading Quiz Data..." />}
      {isError && <div className="error-message">Error Loading Quiz Data </div>}
      {isSuccess && (
        <>
          <h2>Quizzes Table</h2>
          <Table
            headers={headers}
            data={quizTableQuery.data ?? []}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterQuizTable}
            renderRow={(quiz) => renderQuizRow(quiz)}
          />
          {quizToEdit && <EditQuiz quiz={quizToEdit} />}
          {createQuiz && <CreateQuiz />}
        </>
      )}
    </div>
  );
}
