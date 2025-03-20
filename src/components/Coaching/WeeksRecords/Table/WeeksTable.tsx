import type { Week } from 'src/types/CoachingTypes';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Pagination from 'src/components/ExamplesTable/Pagination';
import { Loading } from 'src/components/Loading';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useBackendHelpers } from 'src/hooks/useBackend';
import QuantifiedRecords from '../quantifyingRecords';
import WeeksTableItem from './WeeksTableItem';

interface WeekForUpdate {
  notes: string;
  holdWeek: boolean;
  recordsComplete: boolean;
  offTrack: boolean;
  primaryCoachWhenCreated: string;
  recordId: number;
  currentLesson: number | undefined;
}
interface NewTableProps {
  weeks: Week[] | undefined;
}
export default function WeeksTable({ weeks }: NewTableProps) {
  const { weeksQuery } = useCoaching();
  const { newPutFactory } = useBackendHelpers();

  const isLoading = weeksQuery.isLoading;

  const [tableEditMode, setTableEditMode] = useState(false);
  const [activeData, setActiveData] = useState<Week[]>([]);

  const updateManyWeeksMutation = useMutation({
    mutationFn: (weeks: WeekForUpdate[]) => {
      const promise = newPutFactory({
        path: `coaching/update-many-weeks`,
        body: weeks,
      });
      return promise;
    },
  });

  /*      Pagination      */
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

  /*      Edit Mode      */
  const updateActiveDataWeek = useCallback((week: Week) => {
    setActiveData((prev) => {
      const newData = prev.map((w) =>
        w.recordId === week.recordId ? week : w,
      );
      return newData;
    });
  }, []);

  const recordChanged = useCallback(
    (week: Week) => {
      const prevWeek = displayOrderSegment.find(
        (w) => w.recordId === week.recordId,
      );
      if (
        prevWeek?.notes !== week.notes ||
        prevWeek?.holdWeek !== week.holdWeek ||
        prevWeek?.recordsComplete !== week.recordsComplete ||
        prevWeek?.currentLesson !== week.currentLesson
      ) {
        return true;
      }
      return false;
    },
    [displayOrderSegment],
  );

  const handleApplyChanges = useCallback(() => {
    const changedWeeks = activeData.filter((week) => recordChanged(week));

    // format the weeks to be of type WeekForUpdate
    const weeksFormattedForUpdate: WeekForUpdate[] = changedWeeks.map(
      (week) => ({
        notes: week.notes,
        holdWeek: week.holdWeek,
        recordsComplete: week.recordsComplete,
        offTrack: week.offTrack,
        primaryCoachWhenCreated: week.primaryCoachWhenCreated,
        recordId: week.recordId,
        currentLesson: week.currentLesson ?? undefined,
      }),
    );
    updateManyWeeksMutation.mutate(weeksFormattedForUpdate);
  }, [activeData, recordChanged, updateManyWeeksMutation]);

  /*      Pagination      */
  useEffect(() => {
    if (weeks && weeks.length < (page - 1) * itemsPerPage) {
      setPage(1);
    }
  }, [page, weeks]);

  /*      Edit Mode      */
  useEffect(() => {
    if (displayOrderSegment) {
      setActiveData(displayOrderSegment);
    }
  }, [displayOrderSegment]);

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
        <div className="editModeToggle">
          {tableEditMode ? (
            <div>
              <button type="button" onClick={handleApplyChanges}>
                Apply Changes
              </button>
              <button
                type="button"
                onClick={() => setTableEditMode(!tableEditMode)}
              >
                Disable Edit Mode
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setTableEditMode(!tableEditMode)}
            >
              Enable Edit Mode
            </button>
          )}
        </div>
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
                {/* <th>Edit Record</th> */}
              </tr>
            </thead>
            <tbody>
              {activeData.map((week) => (
                <WeeksTableItem
                  key={week.recordId}
                  week={week}
                  tableEditMode={tableEditMode}
                  updateActiveDataWeek={updateActiveDataWeek}
                />
              ))}
            </tbody>
          </table>
        </div>
      </>
    ))
  );
}
