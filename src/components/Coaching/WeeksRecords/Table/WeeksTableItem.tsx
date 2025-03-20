import type { Week } from 'src/types/CoachingTypes';
import { useMemo } from 'react';
import checkmark from 'src/assets/icons/checkmark_green.svg';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useModal } from 'src/hooks/useModal';

import AssignmentsCell from './AssignmentsCell';
import GroupSessionsCell from './GroupSessionsCell';
import PrivateCallsCell from './PrivateCallsCell';
import StudentCell from './StudentCell';

export default function WeeksTableItem({
  week,
  updateActiveDataWeek,
  tableEditMode,
}: {
  week: Week;
  updateActiveDataWeek: (week: Week) => void;
  tableEditMode: boolean;
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
    if (week.currentLesson === 0) {
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
      <tr>
        <td>
          <StudentCell
            week={week}
            student={getStudentFromMembershipId(week.relatedMembership)}
          />
        </td>
        <td>{week.weekStarts.toString()}</td>
        <td>
          <AssignmentsCell assignments={assignments} />
        </td>
        <td>
          {groupSessions && (
            <GroupSessionsCell week={week} groupSessions={groupSessions} />
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
        <td>
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
            <select
              value={week.currentLesson ? week.currentLesson.toString() : '0'}
              onChange={(e) => {
                updateActiveDataWeek({
                  ...week,
                  currentLesson: Number.parseInt(e.target.value),
                });
              }}
            >
              <option value={'0'}>Select Lesson</option>
              {studentRecordsLessonsQuery.data?.map((lesson) => (
                <option key={lesson.recordId} value={lesson.recordId}>
                  {lesson.lessonName}
                </option>
              ))}
            </select>
          ) : (
            week.currentLessonName
          )}
        </td>
        <td>
          {tableEditMode ? (
            <input
              type="checkbox"
              checked={week.holdWeek}
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
        <td>
          {tableEditMode ? (
            <input
              type="checkbox"
              checked={week.recordsComplete}
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
