import { Loading } from '@interface/components/Loading';
import Table from 'src/components/Table';
import BackButton from '../../general/BackButton';

import {
  CreateQuizGroup,
  EditQuizGroup,
  FilterQuizGroupsTable,
} from './components';
import { headers } from './constants';
import { filterFunction, renderQuizGroupRow, sortFunction } from './functions';

import useQuizGroupsTable from './useQuizGroupsTable';
import './QuizGroupsTable.scss';

export default function QuizGroupsTable() {
  const {
    quizGroupToEdit,
    quizGroupsTableQuery,
    states: { isLoading, isError, isSuccess },
    createQuizGroup,
  } = useQuizGroupsTable();

  return (
    <div>
      <BackButton />
      {isLoading && <Loading message="Loading Quiz Group Data..." />}
      {isError && (
        <div className="error-message">Error Loading Quiz Group Data</div>
      )}
      {isSuccess && (
        <>
          <h2>Quiz Groups Table</h2>
          <Table
            headers={headers}
            data={quizGroupsTableQuery.data ?? []}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterQuizGroupsTable}
            renderRow={(quizGroup) => renderQuizGroupRow(quizGroup)}
          />
          {quizGroupToEdit && <EditQuizGroup quizGroup={quizGroupToEdit} />}
          {createQuizGroup && <CreateQuizGroup />}
        </>
      )}
    </div>
  );
}
