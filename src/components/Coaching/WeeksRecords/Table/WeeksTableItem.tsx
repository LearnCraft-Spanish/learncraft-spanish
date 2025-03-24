import type { Week } from 'src/types/CoachingTypes';
import { useMemo } from 'react';
import checkmark from 'src/assets/icons/checkmark_green.svg';
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
  tableEditMode,
  failedToUpdate,
  hiddenFields,
}: {
  week: WeekWithFailedToUpdate;
  updateActiveDataWeek: (week: Week) => void;
  tableEditMode: boolean;
  failedToUpdate: boolean | undefined;
  hiddenFields: string[];
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

  // const [notes, setNotes] = useState(week.notes);
  // const [holdWeek, setHoldWeek] = useState(week.holdWeek);
  // const [recordsComplete, setRecordsComplete] = useState(week.recordsComplete);
  // const [currentLesson, setCurrentLesson] = useState<string>(
  //   week.currentLesson ? week.currentLesson.toString() : '0',
  // );

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

  // const [editMode, setEditMode] = useState(false);

  // function cancelEdit() {
  //   setNotes(week.notes);
  //   setHoldWeek(week.holdWeek);
  //   setRecordsComplete(week.recordsComplete);
  //   setCurrentLesson(week.currentLesson ? week.currentLesson.toString() : '0');
  //   closeModal();
  //   setEditMode(false);
  // }

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
  // function handleSubmit() {
  //   // on no changes, do nothing
  //   if (
  //     notes === week.notes &&
  //     holdWeek === week.holdWeek &&
  //     recordsComplete === week.recordsComplete &&
  //     (week.currentLesson ? week.currentLesson.toString() : '0') ===
  //       currentLesson
  //   ) {
  //     toast.info('No changes detected');
  //     setEditMode(false);
  //     return;
  //   }

  //   if (recordsComplete) {
  //     if (!validateRecordCompleteable()) {
  //       openModal({
  //         title: 'Error',
  //         body: 'Cannot mark record as complete without a current lesson, a private or group call, or a note if no calls were made.',
  //         type: 'error',
  //       });
  //       return;
  //     }
  //   }

  //   updateWeekMutation.mutate(
  //     {
  //       notes,
  //       holdWeek,
  //       recordsComplete,
  //       offTrack: week.offTrack,
  //       primaryCoachWhenCreated: week.primaryCoachWhenCreated,
  //       recordId: week.recordId,
  //       currentLesson:
  //         currentLesson !== '0' ? Number.parseInt(currentLesson) : undefined,
  //     },
  //     {
  //       onSuccess: () => {
  //         setEditMode(false);
  //       },
  //     },
  //   );
  // }

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
          <AssignmentsCell
            assignments={assignments}
            tableEditMode={tableEditMode}
          />
        </td>
        <td>
          {groupSessions && (
            <GroupSessionsCell
              week={week}
              groupSessions={groupSessions}
              tableEditMode={tableEditMode}
            />
          )}
        </td>
        <td>
          {week.membershipCourseWeeklyPrivateCalls > 0 && (
            <PrivateCallsCell
              week={week}
              calls={privateCalls}
              tableEditMode={tableEditMode}
            />
          )}
        </td>
        <td className="notesCell">
          {tableEditMode ? (
            <textarea
              value={week.notes}
              onChange={(e) =>
                updateActiveDataWeek({ ...week, notes: e.target.value })
              }
              disabled={!tableEditMode}
            />
          ) : (
            <p>{week.notes}</p>
          )}
        </td>
        <td>
          {tableEditMode ? (
            // <select
            //   value={week.currentLesson ? week.currentLesson.toString() : '0'}
            //   onChange={(e) => {
            //     updateActiveDataWeek({
            //       ...week,
            //       currentLesson: Number.parseInt(e.target.value),
            //     });
            //   }}
            // >
            //   <option value={'0'}>Select Lesson</option>
            //   {studentRecordsLessonsQuery.data?.map((lesson) => (
            //     <option key={lesson.recordId} value={lesson.recordId}>
            //       {lesson.lessonName}
            //     </option>
            //   ))}
            // </select>
            <SearchableDropdown
              value={week.currentLesson ? week.currentLesson.toString() : '0'}
              valueText={week.currentLessonName}
              onChange={(value) =>
                updateActiveDataWeek({
                  ...week,
                  currentLesson: Number.parseInt(value),
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
          {tableEditMode ? (
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
          {tableEditMode ? (
            <Switch
              htmlFor={`recordCompleteable-${week.recordId}`}
              value={week.recordsComplete}
              onChange={() =>
                handleRecordCompleteableChange(!week.recordsComplete)
              }
            />
          ) : (
            // <input
            //   type="checkbox"
            //   checked={week.recordsComplete}
            //   onChange={() =>
            //     handleRecordCompleteableChange(!week.recordsComplete)
            //   }
            // />
            week.recordsComplete && (
              <img className="checkmark" src={checkmark} alt="Checkmark" />
            )
          )}
        </td>
        {/* <td>
          {editMode ? (
            <>
              <img
                src={x}
                alt="Cancel Edit"
                onClick={() =>
                  openModal({
                    title: 'Cancel Edit',
                    body: 'Are you sure you want to cancel your changes?',
                    type: 'confirm',
                    confirmFunction: () => cancelEdit(),
                  })
                }
              />
              <button type="button" onClick={handleSubmit}>
                Submit Changes
              </button>
            </>
          ) : (
            <img
              src={pencil}
              alt="Edit Record"
              onClick={() => setEditMode(true)}
            />
          )}
        </td> */}
      </tr>
    )
  );
}
