import type { Week } from 'src/types/CoachingTypes';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import arrowUp from 'src/assets/icons/arrow-up.svg';
import Pagination from 'src/components/ExamplesTable/Pagination';
import { Loading } from 'src/components/Loading';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useBackendHelpers } from 'src/hooks/useBackend';
import QuantifiedRecords from '../quantifyingRecords';
import WeeksTableItem from './WeeksTableItem';
interface WeekWithFailedToUpdate extends Week {
  failedToUpdate?: boolean;
}

interface WeekForUpdate {
  notes: string;
  holdWeek: boolean;
  recordsComplete: boolean;
  offTrack: boolean;
  primaryCoachWhenCreated: string;
  recordId: number;
  currentLesson: number | undefined;
}

type SortDirection = 'none' | 'ascending' | 'descending';

interface NewTableProps {
  weeks: WeekWithFailedToUpdate[] | undefined;
  tableEditMode: boolean;
  setTableEditMode: (tableEditMode: boolean) => void;
  hiddenFields: string[];
  sortByStudent: boolean;
  handleUpdateSortByStudent: () => void;
  sortDirection: SortDirection;
}

export default function WeeksTable({
  weeks,
  tableEditMode,
  setTableEditMode,
  hiddenFields,
  sortByStudent,
  handleUpdateSortByStudent,
  sortDirection,
}: NewTableProps) {
  const {
    weeksQuery,
    groupSessionsQuery,
    groupAttendeesQuery,
    assignmentsQuery,
    privateCallsQuery,
  } = useCoaching();
  const { newPutFactory } = useBackendHelpers();

  const isLoading =
    weeksQuery.isLoading ||
    groupSessionsQuery.isLoading ||
    groupAttendeesQuery.isLoading ||
    assignmentsQuery.isLoading ||
    privateCallsQuery.isLoading;

  const [activeData, setActiveData] = useState<WeekWithFailedToUpdate[]>([]);

  const updateManyWeeksMutation = useMutation({
    mutationFn: (weeks: WeekForUpdate[]) => {
      const promise = newPutFactory<number[]>({
        path: `coaching/update-many-weeks`,
        body: weeks,
      });
      toast.promise(promise, {
        pending: 'Updating weeks...',
        error: 'Failed to update weeks',
        success: 'Weeks updated successfully',
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
    if (changedWeeks.length === 0) {
      toast.info('No changes to apply');
      return;
    }

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

    updateManyWeeksMutation.mutate(weeksFormattedForUpdate, {
      onSuccess: (data: number[], variables: WeekForUpdate[]) => {
        if (data.length < changedWeeks.length) {
          toast.error('Some weeks failed to update');
          const identifyingFailedWeeks = displayOrderSegment.map((week) => {
            if (data.includes(week.recordId)) {
              return week;
            }
            const weekFromVariables = variables.find(
              (v) => v.recordId === week.recordId,
            );
            return { ...week, failedToUpdate: true, ...weekFromVariables };
          });
          setActiveData(identifyingFailedWeeks);
        } else {
          weeksQuery.refetch();
        }
      },
    });
  }, [
    activeData,
    displayOrderSegment,
    recordChanged,
    updateManyWeeksMutation,
    weeksQuery,
  ]);

  const handleDisableEditMode = useCallback(() => {
    setTableEditMode(false);
    setActiveData(displayOrderSegment);
  }, [displayOrderSegment, setTableEditMode]);

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
        {!tableEditMode && (
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
          </>
        )}
        {activeData.length > 0 && (
          <div className="editModeToggle">
            {tableEditMode ? (
              <>
                <button
                  type="button"
                  onClick={handleApplyChanges}
                  className="greenButton"
                >
                  Apply Changes
                </button>
                <button type="button" onClick={handleDisableEditMode}>
                  Disable Edit Mode
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setTableEditMode(!tableEditMode)}
              >
                Enable Edit Mode
              </button>
            )}
          </div>
        )}
        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th onClick={handleUpdateSortByStudent} className="sortable">
                  <div className="thContentWrapper">
                    {sortByStudent && (
                      <img
                        src={arrowUp}
                        alt="arrow up"
                        style={{
                          width: 32,
                          height: 32,
                          transform:
                            sortDirection === 'descending'
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                        }}
                      />
                    )}
                    <div>Student</div>
                  </div>
                </th>
                <th>Assignments</th>
                <th>Group Calls</th>
                <th>Private Calls</th>
                <th>Notes</th>
                <th>Current Lesson</th>
                <th>Hold Week</th>
                <th>Records Complete</th>
              </tr>
            </thead>
            <tbody>
              {activeData.map((week) => (
                <WeeksTableItem
                  key={week.recordId}
                  week={week}
                  tableEditMode={tableEditMode}
                  updateActiveDataWeek={updateActiveDataWeek}
                  failedToUpdate={week.failedToUpdate}
                  hiddenFields={hiddenFields}
                />
              ))}
            </tbody>
          </table>
        </div>
      </>
    ))
  );
}
