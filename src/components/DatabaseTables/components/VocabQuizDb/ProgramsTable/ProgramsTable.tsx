import { Loading } from 'src/components/Loading';
import Table from 'src/components/Table';
import BackButton from '../../general/BackButton';

import { EditProgramView, FilterProgramsTable } from './components';
import { headers } from './constants';
import { filterFunction, renderProgramRow, sortFunction } from './functions';

import useProgramsTable from './useProgramsTable';
import './ProgramsTable.scss';

export default function ProgramsTable() {
  const {
    programToEdit,
    programsTableQuery,
    states: { isLoading, isError, isSuccess },
  } = useProgramsTable();

  return (
    <div>
      <BackButton />
      {isLoading && <Loading message="Loading Program Data..." />}
      {isError && (
        <div className="error-message">Error Loading Program Data</div>
      )}
      {isSuccess && (
        <>
          <h2>Programs Table</h2>
          <Table
            headers={headers}
            data={programsTableQuery.data ?? []}
            sortFunction={sortFunction}
            filterFunction={filterFunction}
            filterComponent={FilterProgramsTable}
            renderRow={renderProgramRow}
          />
          {programToEdit && <EditProgramView program={programToEdit} />}
        </>
      )}
    </div>
  );
}
