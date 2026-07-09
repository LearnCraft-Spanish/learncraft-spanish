import type {
  FurnishedWeekWithCoach,
  UpdateWeekCommand,
} from '@learncraft-spanish/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import arrowUp from 'src/assets/icons/arrow-up.svg';
import { QuantifiedRecords } from 'src/components/Table/components';
import { useSrLessonsQuery } from 'src/hexagon/application/queries/useSrLessonsQuery';
import { useWeekMutations } from 'src/hexagon/application/queries/WeekQueries/useWeekMutations';
import { Pagination } from 'src/hexagon/interface/components/general';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import WeeksTableItem, {
  WeeksTableItemWithSiingleRecordEdit,
} from './WeeksTableItem';

function toUpdateWeekCommand(week: FurnishedWeekWithCoach): UpdateWeekCommand {
  const updateWeekCommand: UpdateWeekCommand = {
    weekId: week.weekId,
    notes: week.notes,
    holdWeek: week.holdWeek,
    recordComplete: week.recordComplete,
  };
  if (week.lesson) {
    updateWeekCommand.lesson = week.lesson;
  }
  return updateWeekCommand;
}

function mergeUpdateIntoWeek(
  week: FurnishedWeekWithCoach,
  updatedWeek: UpdateWeekCommand,
): FurnishedWeekWithCoach {
  return {
    ...week,
    notes: updatedWeek.notes,
    holdWeek: updatedWeek.holdWeek,
    recordComplete: updatedWeek.recordComplete,
    lesson: updatedWeek.lesson,
  };
}

function recordChanged(
  originalWeek: FurnishedWeekWithCoach | undefined,
  activeWeek: FurnishedWeekWithCoach,
): boolean {
  return (
    originalWeek?.notes !== activeWeek.notes ||
    originalWeek?.holdWeek !== activeWeek.holdWeek ||
    originalWeek?.recordComplete !== activeWeek.recordComplete ||
    originalWeek?.lesson?.srLessonId !== activeWeek.lesson?.srLessonId
  );
}

function validateRecordCompleteable(week: FurnishedWeekWithCoach): boolean {
  if (week.weekNumber === 0) {
    return true;
  }
  if (!week.lesson?.srLessonId) {
    return false;
  }
  if (
    week.privateCalls.length === 0 &&
    (week.notes ?? '').trim() === '' &&
    week.groupCalls.length === 0
  ) {
    return false;
  }

  return true;
}

function formatInvalidWeeks(invalidWeeks: FurnishedWeekWithCoach[]): string {
  return invalidWeeks
    .map(
      (week) =>
        `- ${week.student.fullName || 'Unknown student'} (Week ${week.weekNumber})`,
    )
    .join('\n');
}

type SortDirection = 'none' | 'ascending' | 'descending';

interface NewTableProps {
  weeks: FurnishedWeekWithCoach[] | undefined;
  tableEditMode: boolean;
  // setTableEditMode: (tableEditMode: boolean) => void;
  hiddenFields: string[];
  sortByStudent: boolean;
  handleUpdateSortByStudent: () => void;
  sortDirection: SortDirection;
}

export default function WeeksTable({
  weeks,
  tableEditMode,
  // setTableEditMode,
  hiddenFields,
  sortByStudent,
  handleUpdateSortByStudent,
  sortDirection,
}: NewTableProps) {
  const { closeModal, openModal } = useModal();
  const { data: srLessons } = useSrLessonsQuery();
  const { updateWeekMutation } = useWeekMutations();
  const [activeData, setActiveData] = useState<FurnishedWeekWithCoach[]>([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const effectiveTableEditMode = tableEditMode || bulkEditMode;

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

  const changedWeeks = useMemo(() => {
    return activeData.filter((week) =>
      recordChanged(
        displayOrderSegment.find((original) => original.weekId === week.weekId),
        week,
      ),
    );
  }, [activeData, displayOrderSegment]);

  const hasUnsavedChanges = changedWeeks.length > 0;

  const updateActiveDataWeek = useCallback((week: UpdateWeekCommand) => {
    setActiveData((prev) =>
      prev.map((activeWeek) =>
        activeWeek.weekId === week.weekId
          ? mergeUpdateIntoWeek(activeWeek, week)
          : activeWeek,
      ),
    );
  }, []);

  function handleRecordCompleteableChange(
    week: FurnishedWeekWithCoach,
    newValue: boolean,
  ): void {
    const updatedWeek = {
      ...week,
      recordComplete: newValue,
    };
    if (newValue && !validateRecordCompleteable(updatedWeek)) {
      openModal({
        title: 'Error',
        body: 'Cannot mark record as complete without a current lesson, a private or group call, or a note if no calls were made.',
        type: 'error',
      });
      return;
    }
    updateActiveDataWeek(toUpdateWeekCommand(updatedWeek));
  }

  function handleApplyChanges(): void {
    if (changedWeeks.length === 0) {
      toast.info('No changes to apply');
      return;
    }

    const invalidWeeks = changedWeeks.filter(
      (week) => week.recordComplete && !validateRecordCompleteable(week),
    );
    if (invalidWeeks.length > 0) {
      openModal({
        title: 'Cannot Complete Records',
        body: `The following student records cannot be marked as complete without a current lesson, a private or group call, or a note if no calls were made:\n\n${formatInvalidWeeks(invalidWeeks)}`,
        type: 'error',
      });
      return;
    }

    updateWeekMutation.mutate(changedWeeks.map(toUpdateWeekCommand), {
      onSuccess: () => {
        toast.success('Weeks updated successfully');
        setBulkEditMode(false);
      },
      onError: () => {
        toast.error('Failed to update weeks');
      },
    });
  }

  function disableBulkEditMode(): void {
    setBulkEditMode(false);
    setActiveData(displayOrderSegment);
    closeModal();
  }

  function handleDisableEditMode(): void {
    if (hasUnsavedChanges) {
      openModal({
        title: 'Unsaved Changes',
        body: 'You have unsaved changes. Are you sure you want to disable edit mode? All changes will be lost.',
        type: 'confirm',
        confirmFunction: () => disableBulkEditMode(),
      });
      return;
    }

    disableBulkEditMode();
  }

  /*      Edit Mode      */
  // const updateActiveDataWeek = useCallback((week: Week) => {
  //   setActiveData((prev) => {
  //     const newData = prev.map((w) =>
  //       w.recordId === week.recordId ? { ...w, ...week } : w,
  //     );
  //     setHasUnsavedChanges(true);
  //     return newData;
  //   });
  // }, []);

  // const recordChanged = useCallback(
  //   (week: Week) => {
  //     const prevWeek = displayOrderSegment.find(
  //       (w) => w.recordId === week.recordId,
  //     );
  //     if (
  //       prevWeek?.notes !== week.notes ||
  //       prevWeek?.holdWeek !== week.holdWeek ||
  //       prevWeek?.recordsComplete !== week.recordsComplete ||
  //       prevWeek?.currentLesson !== week.currentLesson
  //     ) {
  //       return true;
  //     }
  //     return false;
  //   },
  //   [displayOrderSegment],
  // );

  // Validate that records marked as complete meet the requirements
  // const validateRecordsCompleteable = useCallback(
  //   (changedWeeks: WeekWithFailedToUpdate[]) => {
  //     const invalidWeeks: WeekWithFailedToUpdate[] = [];

  //     changedWeeks.forEach((week) => {
  //       if (!week.recordsComplete) return; // Skip validation for weeks not marked complete

  //       // Skip week 0
  //       if (week.week === 0) return;

  //       // Need current lesson
  //       if (!week.currentLesson) {
  //         invalidWeeks.push(week);
  //         return;
  //       }

  //       // Need either private calls, group sessions, or notes
  //       // Foreign Key lookup, form data in backend
  //       const privateCalls = week

  //       // For group sessions, we need to check the group attendees to find sessions related to this week
  //       // Foreign Key lookup, form data in backend

  //       const groupSessionIds = groupAttendeesQuery.data
  //         ?.filter((attendee) => attendee.student === week.recordId)
  //         .map((attendee) => attendee.groupSession);

  //       // Foreign Key lookup, form data in backend
  //       const groupSessions = groupSessionsQuery.data?.filter((session) =>
  //         groupSessionIds?.includes(session.recordId),
  //       );

  //       if (
  //         (!privateCalls || privateCalls.length === 0) &&
  //         (!groupSessions || groupSessions.length === 0) &&
  //         week.notes === ''
  //       ) {
  //         invalidWeeks.push(week);
  //       }
  //     });

  //     return invalidWeeks;
  //   },
  //   [privateCallsQuery.data, groupSessionsQuery.data, groupAttendeesQuery.data],
  // );

  // const handleApplyChanges = useCallback(() => {
  //   const changedWeeks = activeData.filter((week) => recordChanged(week));

  //   if (changedWeeks.length === 0) {
  //     toast.info('No changes to apply');
  //     return;
  //   }

  //   // Validate completeable records
  //   const invalidWeeks = validateRecordsCompleteable(changedWeeks);
  //   if (invalidWeeks.length > 0) {
  //     // Format student names for display
  //     const studentNames = invalidWeeks
  //       .map((week) => {
  //         // Get student name or fallback to a default label
  //         let label = `Week ${week.week}`;

  //         // Try to find student info through getStudentFromMembershipId
  //         // Foreign Key lookup, orm data in backend
  //         const student = getStudentFromMembershipId(week.relatedMembership);
  //         if (student) {
  //           label = `${student.fullName} (Week ${week.week})`;
  //         } else {
  //           label = `Student ID: ${week.relatedMembership} (Week ${week.week})`;
  //         }

  //         return `- ${label}`;
  //       })
  //       .join('\n');

  //     openModal({
  //       title: 'Cannot Complete Records',
  //       body: `The following student records cannot be marked as complete without a current lesson, a private or group call, or a note if no calls were made:\n\n${studentNames}`,
  //       type: 'error',
  //     });
  //     return;
  //   }

  //   const weeksFormattedForUpdate: WeekForUpdate[] = changedWeeks.map(
  //     (week) => ({
  //       notes: week.notes,
  //       holdWeek: week.holdWeek,
  //       recordsComplete: week.recordsComplete,
  //       offTrack: week.offTrack,
  //       primaryCoachWhenCreated: week.primaryCoachWhenCreated,
  //       recordId: week.recordId,
  //       currentLesson: week.currentLesson ?? undefined,
  //     }),
  //   );

  //   updateManyWeeksMutation.mutate(weeksFormattedForUpdate, {
  //     onSuccess: (data: number[], variables: WeekForUpdate[]) => {
  //       if (data.length < changedWeeks.length) {
  //         toast.error('Some weeks failed to update');
  //         const identifyingFailedWeeks = displayOrderSegment.map((week) => {
  //           if (data.includes(week.recordId)) {
  //             return week;
  //           }
  //           const weekFromVariables = variables.find(
  //             (v) => v.recordId === week.recordId,
  //           );
  //           return { ...week, failedToUpdate: true, ...weekFromVariables };
  //         });
  //         setActiveData(identifyingFailedWeeks);
  //       } else {
  //         weeksQuery.refetch();
  //         setHasUnsavedChanges(false);
  //       }
  //     },
  //   });
  // }, [
  //   activeData,
  //   displayOrderSegment,
  //   recordChanged,
  //   validateRecordsCompleteable,
  //   updateManyWeeksMutation,
  //   weeksQuery,
  //   openModal,
  //   getStudentFromMembershipId,
  // ]);

  // const handleDisableEditMode = useCallback(() => {
  //   // Check if there are unsaved changes before disabling edit mode
  //   if (hasUnsavedChanges) {
  //     openModal({
  //       title: 'Unsaved Changes',
  //       body: 'You have unsaved changes. Are you sure you want to disable edit mode? All changes will be lost.',
  //       type: 'confirm',
  //       confirmFunction: () => {
  //         setTableEditMode(false);
  //         setActiveData(displayOrderSegment);
  //         setHasUnsavedChanges(false);
  //       },
  //     });
  //   } else {
  //     setTableEditMode(false);
  //     setActiveData(displayOrderSegment);
  //   }
  // }, [displayOrderSegment, setTableEditMode, hasUnsavedChanges, openModal]);

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
      // setHasUnsavedChanges(false);
    }
  }, [displayOrderSegment]);

  return (
    weeks && (
      // (isLoading ? (
      //   <Loading message={'Retrieving records data...'} />
      // ) : (
      <>
        {!effectiveTableEditMode && (
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
            {effectiveTableEditMode ? (
              <>
                <button
                  type="button"
                  onClick={handleApplyChanges}
                  className="greenButton"
                  disabled={!hasUnsavedChanges || updateWeekMutation.isPending}
                >
                  Apply Changes
                </button>
                <button type="button" onClick={handleDisableEditMode}>
                  Disable Edit Mode
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setBulkEditMode(true)}>
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
                {!effectiveTableEditMode && <th>Edit</th>}
              </tr>
            </thead>
            <tbody>
              {activeData.map((week) =>
                effectiveTableEditMode ? (
                  <WeeksTableItem
                    key={week.weekId}
                    week={week}
                    updateActiveDataWeek={updateActiveDataWeek}
                    editMode={effectiveTableEditMode}
                    hiddenFields={hiddenFields}
                    srLessons={srLessons}
                    handleRecordCompleteableChange={(newValue) =>
                      handleRecordCompleteableChange(week, newValue)
                    }
                  />
                ) : (
                  <WeeksTableItemWithSiingleRecordEdit
                    key={week.weekId}
                    week={week}
                    tableEditMode={effectiveTableEditMode}
                    hiddenFields={hiddenFields}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
      </>
    )
  );
}
