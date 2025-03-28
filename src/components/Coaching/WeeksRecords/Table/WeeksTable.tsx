import type { GroupSession, Week } from 'src/types/CoachingTypes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GroupSessionView } from 'src/components/Coaching/WeeksRecords/Table/GroupSessionsCell';
import Pagination from 'src/components/ExamplesTable/Pagination';

import { Loading } from 'src/components/Loading';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import QuantifiedRecords from '../quantifyingRecords';
import ViewWeekRecord from '../ViewWeekRecord';
import { NewAssignmentView } from './AssignmentsCell';
import WeeksTableItem from './WeeksTableItem';

interface NewTableProps {
  weeks: Week[] | undefined;
  startDate: string;
}
export default function WeeksTable({ weeks, startDate }: NewTableProps) {
  const { weeksQuery } = useCoaching();
  const { contextual } = useContextualMenu();

  const isLoading = weeksQuery.isLoading;

  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const maxPage = Math.ceil(weeks ? weeks.length / itemsPerPage : 0);

  const displayOrderSegment = useMemo(() => {
    return weeks
      ? weeks.slice((page - 1) * itemsPerPage, page * itemsPerPage)
      : [];
  }, [weeks, page]);

  const nextPage = useCallback(() => {
    if (page >= maxPage) {
      return;
    }
    setPage(page + 1);
  }, [page, maxPage]);

  const previousPage = useCallback(() => {
    if (page <= 1) {
      return;
    }
    setPage(page - 1);
  }, [page]);

  useEffect(() => {
    if (weeks && weeks.length < (page - 1) * itemsPerPage) {
      setPage(1);
    }
  }, [page, weeks]);
  return (
    weeks &&
    (isLoading ? (
      <Loading message={'Retrieving records data...'} />
    ) : (
      <>
        <div className="numberShowing">
          <QuantifiedRecords
            currentPage={page}
            totalRecords={weeks.length}
            recordsPerPage={itemsPerPage}
          />
        </div>
        <Pagination
          page={page}
          maxPage={maxPage}
          nextPage={nextPage}
          previousPage={previousPage}
        />
        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Week Starts</th>
                <th>Assignments</th>
                <th>Group Calls</th>
                <th>Private Calls</th>
                <th>Notes</th>
                <th>Current Lesson </th>
                <th>Hold Week</th>
                <th>Records Complete?</th>
                <th>Edit Record</th>
              </tr>
            </thead>
            <tbody>
              {displayOrderSegment.map((week) => (
                <WeeksTableItem key={week.recordId} week={week} />
              ))}
            </tbody>
          </table>
        </div>
        {contextual.startsWith('week') && (
          <ViewWeekRecord
            week={weeks?.find(
              (week) => week.recordId === Number(contextual.split('week')[1]),
            )}
          />
        )}
        {contextual === 'newGroupSession' && (
          <GroupSessionView
            groupSession={{ recordId: -1 } as GroupSession}
            newRecord
          />
        )}
        {contextual === 'newAssignment' && (
          <NewAssignmentView weekStartsDefaultValue={startDate} />
        )}
      </>
    ))
  );
}
