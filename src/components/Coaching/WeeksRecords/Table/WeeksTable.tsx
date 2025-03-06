import type { Week } from 'src/types/CoachingTypes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Pagination from 'src/components/FlashcardFinder/Pagination';
import LoadingMessage from 'src/components/Loading';

import useCoaching from 'src/hooks/CoachingData/useCoaching';
import QuantifiedRecords from '../quantifyingRecords';
import WeeksTableItem from './WeeksTableItem';

interface NewTableProps {
  weeks: Week[] | undefined;
}
export default function WeeksTable({ weeks }: NewTableProps) {
  const { weeksQuery } = useCoaching();

  const isLoading = weeksQuery.isFetching;

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
      <LoadingMessage message={'Retrieving records data...'} />
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
      </>
    ))
  );
}
