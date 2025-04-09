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

  const assignments = useMemo(
    () => getAssignmentsFromWeekRecordId(week.recordId),
    [getAssignmentsFromWeekRecordId, week.recordId],
  );
  const groupSessions = useMemo(
    () => getGroupSessionsFromWeekRecordId(week.recordId),
    [getGroupSessionsFromWeekRecordId, week.recordId],
  );
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
          <td>
            {editMode ? (
              <>
                <img src={x} alt="Cancel Edit" onClick={cancelEdit} />
                <button type="button" onClick={handleSubmit}>
                  Submit Changes
                </button>
              </>
            ) : (
              <img
                src={pencil}
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

  const [editMode, setEditMode] = useState(false);

  // Update the data object to include all required Week properties
  const [dataObject, setDataObject] = useState({
    ...week,
  });

  // This is the same logic as validateRecordCompleteable in WeeksTableItem
  function validateRecordCompleteable() {
    if (week.week === 0) {
      return true;
    }
    if (!dataObject.currentLesson || dataObject.currentLesson === 0) {
      return false;
    }

    const privateCalls = getPrivateCallsFromWeekRecordId(week.recordId);
    const groupSessions = getGroupSessionsFromWeekRecordId(week.recordId);

    if (
      privateCalls?.length === 0 &&
      dataObject.notes === '' &&
      groupSessions?.length === 0
    ) {
      return false;
    }

    return true;
  }

  function captureCancelEdit() {
    if (
      dataObject.notes === week.notes &&
      dataObject.holdWeek === week.holdWeek &&
      dataObject.recordsComplete === week.recordsComplete &&
      dataObject.currentLesson === week.currentLesson
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
    setDataObject({
      ...week,
    });
    closeModal();
    setEditMode(false);
  }

  function handleSubmit() {
    // on no changes, do nothing
    if (
      dataObject.notes === week.notes &&
      dataObject.holdWeek === week.holdWeek &&
      dataObject.recordsComplete === week.recordsComplete &&
      dataObject.currentLesson === week.currentLesson
    ) {
      toast.info('No changes detected');
      setEditMode(false);
      return;
    }

    // Validate record completeable
    if (dataObject.recordsComplete && !validateRecordCompleteable()) {
      openModal({
        title: 'Error',
        body: 'Cannot mark record as complete without a current lesson, a private or group call, or a note if no calls were made.',
        type: 'error',
      });
      return;
    }
    updateWeekMutation.mutate(
      {
        notes: dataObject.notes,
        holdWeek: dataObject.holdWeek,
        recordsComplete: dataObject.recordsComplete,
        offTrack: week.offTrack,
        primaryCoachWhenCreated: week.primaryCoachWhenCreated,
        recordId: week.recordId,
        currentLesson: dataObject.currentLesson ?? undefined,
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

    setDataObject(week);
  };

  // Create a modifiedWeek object that combines dataObject properties with week
  const modifiedWeek = {
    ...week,
    notes: dataObject.notes,
    holdWeek: dataObject.holdWeek,
    recordsComplete: dataObject.recordsComplete,
    currentLesson: dataObject.currentLesson,
    currentLessonName: dataObject.currentLessonName,
  };

  return (
    dataReady && (
      <WeeksTableItem
        week={modifiedWeek}
        updateActiveDataWeek={handleDataUpdate}
        editMode={tableEditMode || editMode}
        failedToUpdate={failedToUpdate}
        hiddenFields={hiddenFields}
        allowSingleRecordUpdate={allowSingleRecordUpdate}
        toggleEditMode={() => setEditMode(!editMode)}
        cancelEdit={captureCancelEdit}
        handleSubmit={handleSubmit}
      />
    )
  );
}
