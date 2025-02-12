import { useCallback, useMemo, useState } from 'react';
import type { Week } from 'src/types/CoachingTypes';
import Pagination from 'src/components/FlashcardFinder/Pagination';
import QuantifiedRecords from '../quantifyingRecords';

import WeeksTableItem from './WeeksTableItem';
interface NewTableProps {
  weeks: Week[] | undefined;
}
export default function WeeksTable({ weeks }: NewTableProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

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

  return (
    weeks && (
      <>
        <div className="numberShowing">
          {/* THIS NEEDS TO HAVE A CASE FOR 0 EXAMPLES */}
          <QuantifiedRecords
            currentPage={page}
            totalRecords={weeks.length}
            recordsPerPage={itemsPerPage}
          />
        </div>
        {/* WARNING: this does not update approcatly when on page 2, and we update filters to get <50 records! */}
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
    )
  );
}
