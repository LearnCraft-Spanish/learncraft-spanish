import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Loading } from 'src/components/Loading';
import Table from 'src/components/Table';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useProgramsTable from 'src/hooks/VocabQuizDbData/useProgramsTable';
import EditProgramView from './components/EditProgramView';
import { renderProgramRow, sortFunction } from './functions';
import './ProgramsTable.scss';

export default function ProgramsTable() {
  const { programsTableQuery } = useProgramsTable();
  const { contextual } = useContextualMenu();

  const programToEdit = useMemo(() => {
    if (!contextual.startsWith('edit-program-')) {
      return undefined;
    }

    const recordId = Number(contextual.split('edit-program-')[1]);
    return programsTableQuery.data?.find(
      (program) => program.recordId === recordId,
    );
  }, [programsTableQuery.data, contextual]);

  return (
    <div>
      <div className="back-button-container">
        <Link to="/vocab-quiz-db-tables" className="back-button">
          ← Back to Tables
        </Link>
      </div>
      {programsTableQuery.isLoading && (
        <Loading message="Loading Program Data..." />
      )}
      {programsTableQuery.isError && <div>Error Loading Program Data</div>}
      {programsTableQuery.isSuccess && (
        <>
          <h2>Programs Table</h2>
          <Table
            headers={[
              { header: 'Edit Record', sortable: false },
              { header: 'Name', sortable: true, noWrap: true },
              { header: 'Cohort A Current', sortable: true },
              { header: 'Cohort B Current', sortable: true },
              { header: 'Cohort C Current', sortable: true },
              { header: 'Cohort D Current', sortable: true },
              { header: 'Cohort E Current', sortable: true },
              { header: 'Cohort F Current', sortable: true },
              { header: 'Cohort G Current', sortable: true },
              { header: 'Cohort H Current', sortable: true },
              { header: 'Cohort I Current', sortable: true },
              { header: 'Cohort J Current', sortable: true },
            ]}
            data={programsTableQuery.data}
            renderRow={renderProgramRow}
            sortFunction={sortFunction}
            // filterFunction={filterFunction}
            // filterComponent={FilterProgramsTable}
          />
          {programToEdit && <EditProgramView program={programToEdit} />}
        </>
      )}
    </div>
  );
}
