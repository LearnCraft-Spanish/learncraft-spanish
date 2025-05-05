import type { Week } from 'src/types/CoachingTypes';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import checkmark from 'src/assets/icons/checkmark_green.svg';
import pencil from 'src/assets/icons/pencil.svg';

import x from 'src/assets/icons/x_dark.svg';
import { SearchableDropdown, Switch } from 'src/components/FormComponents';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useModal } from 'src/hooks/useModal';

import AssignmentsCell from './AssignmentsCell';

import GroupSessionsCell from './GroupSessionsCell';
import PrivateCallsCell from './PrivateCallsCell';
import StudentCell from './StudentCell';

interface WeekWithFailedToUpdate extends Week {
  failedToUpdate?: boolean;
}

export default function WeeksTableItem({
  week,
  updateActiveDataWeek,
  editMode,
  failedToUpdate,
  hiddenFields,
  allowSingleRecordUpdate,
  toggleEditMode,
  cancelEdit,
  handleSubmit,
}: {
  week: WeekWithFailedToUpdate;
  updateActiveDataWeek: (week: Week) => void;
  editMode: boolean;
  failedToUpdate: boolean | undefined;
  hiddenFields: string[];
  allowSingleRecordUpdate?: boolean;
  toggleEditMode?: () => void;
  cancelEdit?: () => void;
  handleSubmit?: () => void;
}) {
  const {
    studentRecordsLessonsQuery,
    getAssignmentsFromWeekRecordId,
    getGroupSessionsFromWeekRecordId,
    getPrivateCallsFromWeekRecordId,
    getStudentFromMembershipId,
  } = useCoaching();
  const { openModal } = useModal();

  const dataReady = studentRecordsLessonsQuery.isSuccess;
  // Foreign Key lookup, form data in backend
  const assignments = useMemo(
    () => getAssignmentsFromWeekRecordId(week.recordId),
    [getAssignmentsFromWeekRecordId, week.recordId],
  );
  // Foreign Key lookup, form data in backend
  const groupSessions = useMemo(
    () => getGroupSessionsFromWeekRecordId(week.recordId),
    [getGroupSessionsFromWeekRecordId, week.recordId],
  );
  // Foreign Key lookup, form data in backend
  const privateCalls = useMemo(
    () => getPrivateCallsFromWeekRecordId(week.recordId),
    [getPrivateCallsFromWeekRecordId, week.recordId],
  );

  // This is the same logic as the formula for record Completeable in the database
  function validateRecordCompleteable() {
    if (week.week === 0) {
      return true;
    }
    if (!week.currentLesson) {
      return false;
    }
    if (
      privateCalls?.length === 0 &&
      week.notes === '' &&
      groupSessions?.length === 0
    ) {
      return false;
    }

    return true;
  }

  const handleRecordCompleteableChange = (newValue: boolean) => {
    if (newValue) {
      if (!validateRecordCompleteable()) {
        openModal({
          title: 'Error',
          body: 'Cannot mark record as complete without a current lesson, a private or group call, or a note if no calls were made.',
          type: 'error',
        });
        return;
      }
    }
    updateActiveDataWeek({
      ...week,
      recordsComplete: newValue,
    });
  };

  return (
    dataReady && (
      <tr className={failedToUpdate ? 'failedToUpdate' : ''}>
        <td>
          <StudentCell
            week={week}
            // Foreign Key lookup, form data in backend
            student={getStudentFromMembershipId(week.relatedMembership)}
            hiddenFields={hiddenFields}
          />
        </td>
        {/* <td>{week.weekStarts.toString()}</td> */}
        <td>
          <AssignmentsCell assignments={assignments} tableEditMode={editMode} />
        </td>
        <td>
          {groupSessions && (
            <GroupSessionsCell
              week={week}
              groupSessions={groupSessions}
              tableEditMode={editMode}
            />
          )}
        </td>
        <td>
          {/* We should only show the private calls if:
          - the student has private calls
          OR
          - they have valid bundle credits

          We should implement this when we update the data parsing to be handleled on the backend
           */}
          <PrivateCallsCell
            week={week}
            calls={privateCalls}
            tableEditMode={editMode}
            // Foreign Key lookup, form data in backend
            student={getStudentFromMembershipId(week.relatedMembership)}
          />
        </td>
        <td className="notesCell">
          {editMode ? (
            <textarea
              value={week.notes}
              onChange={(e) =>
                updateActiveDataWeek({ ...week, notes: e.target.value })
              }
              disabled={!editMode}
            />
          ) : (
            <p>{week.notes}</p>
          )}
        </td>
        <td>
          {editMode ? (
            <SearchableDropdown
              value={week.currentLesson ? week.currentLesson.toString() : '0'}
              valueText={week.currentLessonName}
              onChange={(value) =>
                updateActiveDataWeek({
                  ...week,
                  currentLesson: value ? Number.parseInt(value) : undefined,
                  currentLessonName:
                    studentRecordsLessonsQuery.data?.find(
                      (lesson) => lesson.recordId === Number.parseInt(value),
                    )?.lessonName ?? '',
                })
              }
              options={
                studentRecordsLessonsQuery.data?.map((lesson) => ({
                  label: lesson.lessonName,
                  value: lesson.recordId.toString(),
                })) || []
              }
            />
          ) : (
            week.currentLessonName
          )}
        </td>
        <td className="checkboxCell">
          {editMode ? (
            <Switch
              htmlFor={`holdWeek-${week.recordId}`}
              value={week.holdWeek}
              onChange={() =>
                updateActiveDataWeek({ ...week, holdWeek: !week.holdWeek })
              }
            />
          ) : (
            week.holdWeek && (
              <img className="checkmark" src={checkmark} alt="Checkmark" />
            )
          )}
        </td>
        <td className="checkboxCell">
          {editMode ? (
            <Switch
              htmlFor={`recordCompleteable-${week.recordId}`}
              value={week.recordsComplete}
              onChange={() =>
                handleRecordCompleteableChange(!week.recordsComplete)
              }
            />
          ) : (
            week.recordsComplete && (
              <img className="checkmark" src={checkmark} alt="Checkmark" />
            )
          )}
        </td>
        {allowSingleRecordUpdate && (
          <td className="editIconCell">
            {editMode ? (
              <>
                <img
                  src={x}
                  alt="Cancel Edit"
                  onClick={cancelEdit}
                  className="cancelEditIcon"
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="submitEditButton"
                >
                  Submit Changes
                </button>
              </>
            ) : (
              <img
                src={pencil}
                className="editIconRowRecord"
                alt="Edit Record"
                onClick={() => toggleEditMode?.()}
              />
            )}
          </td>
        )}
      </tr>
    )
  );
}

interface WeekWithFailedToUpdate extends Week {
  failedToUpdate?: boolean;
}

export function WeeksTableItemWithSiingleRecordEdit({
  week,
  updateActiveDataWeek,
  tableEditMode,
  failedToUpdate,
  hiddenFields,
  allowSingleRecordUpdate,
}: {
  week: WeekWithFailedToUpdate;
  updateActiveDataWeek: (week: Week) => void;
  tableEditMode: boolean;
  failedToUpdate: boolean | undefined;
  hiddenFields: string[];
  allowSingleRecordUpdate?: boolean;
}) {
  const {
    studentRecordsLessonsQuery,
    updateWeekMutation,
    getPrivateCallsFromWeekRecordId,
    getGroupSessionsFromWeekRecordId,
  } = useCoaching();
  const { closeModal, openModal } = useModal();

  const dataReady = studentRecordsLessonsQuery.isSuccess;

  const [editMode, setEditMode] = useState(tableEditMode);
  const [localWeek, setLocalWeek] = useState<Week>({ ...week });

  // This is the same logic as validateRecordCompleteable in WeeksTableItem
  function validateRecordCompleteable() {
    if (week.week === 0) {
      return true;
    }
    if (!localWeek.currentLesson || localWeek.currentLesson === 0) {
      return false;
    }

    const privateCalls = getPrivateCallsFromWeekRecordId(week.recordId);
    const groupSessions = getGroupSessionsFromWeekRecordId(week.recordId);

    if (
      privateCalls?.length === 0 &&
      localWeek.notes === '' &&
      groupSessions?.length === 0
    ) {
      return false;
    }

    return true;
  }

  function captureCancelEdit() {
    if (
      localWeek.notes === week.notes &&
      localWeek.holdWeek === week.holdWeek &&
      localWeek.recordsComplete === week.recordsComplete &&
      localWeek.currentLesson === week.currentLesson
    ) {
      toast.info('No changes detected');
      setEditMode(false);
      return;
    }
    openModal({
      title: 'Cancel Edit',
      body: 'Are you sure you want to cancel your changes?',
      type: 'confirm',
      confirmFunction: () => cancelEdit(),
    });
  }

  function cancelEdit() {
    setLocalWeek({
      ...week,
    });
    closeModal();
    setEditMode(false);
  }

  function handleSubmit() {
    // on no changes, do nothing
    if (
      localWeek.notes === week.notes &&
      localWeek.holdWeek === week.holdWeek &&
      localWeek.recordsComplete === week.recordsComplete &&
      localWeek.currentLesson === week.currentLesson
    ) {
      toast.info('No changes detected');
      setEditMode(false);
      return;
    }

    // Validate record completeable
    if (localWeek.recordsComplete && !validateRecordCompleteable()) {
      openModal({
        title: 'Error',
        body: 'Cannot mark record as complete without a current lesson, a private or group call, or a note if no calls were made.',
        type: 'error',
      });
      return;
    }
    updateWeekMutation.mutate(
      {
        notes: localWeek.notes,
        holdWeek: localWeek.holdWeek,
        recordsComplete: localWeek.recordsComplete,
        offTrack: week.offTrack,
        primaryCoachWhenCreated: week.primaryCoachWhenCreated,
        recordId: week.recordId,
        currentLesson: localWeek.currentLesson ?? undefined,
      },
      {
        onSuccess: () => {
          setEditMode(false);
        },
      },
    );
  }

  const handleDataUpdate = (week: Week) => {
    // Handle updating the data object for the current item

    // If table edit mode is active, also update the activeData in the parent component
    if (tableEditMode) {
      updateActiveDataWeek(week);
    }

    setLocalWeek(week);
  };

  // Create a modifiedWeek object that combines dataObject properties with week
  const modifiedWeek = {
    ...week,
    notes: localWeek.notes,
    holdWeek: localWeek.holdWeek,
    recordsComplete: localWeek.recordsComplete,
    currentLesson: localWeek.currentLesson,
    currentLessonName: localWeek.currentLessonName,
  };

  function toggleEditMode() {
    setEditMode(!editMode);

    // When enabling edit mode, scroll the table wrapper to the far right
    if (!editMode) {
      setTimeout(() => {
        const tableWrapper = document.querySelector('.tableWrapper');
        if (tableWrapper) {
          tableWrapper.scrollLeft = tableWrapper.scrollWidth;
        }
      }, 50); // Small delay to ensure DOM has updated with the wider content
    }
  }

  return (
    dataReady && (
      <WeeksTableItem
        week={modifiedWeek}
        updateActiveDataWeek={handleDataUpdate}
        editMode={tableEditMode || editMode}
        failedToUpdate={failedToUpdate}
        hiddenFields={hiddenFields}
        allowSingleRecordUpdate={allowSingleRecordUpdate}
        toggleEditMode={toggleEditMode}
        cancelEdit={captureCancelEdit}
        handleSubmit={handleSubmit}
      />
    )
  );
}
