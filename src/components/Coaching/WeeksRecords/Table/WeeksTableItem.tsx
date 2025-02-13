import type { Week } from 'src/types/CoachingTypes';
import checkmark from 'src/assets/icons/checkmark_green.svg';
import pencil from 'src/assets/icons/pencil.svg';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import useWeeks from 'src/hooks/CoachingData/useWeeks';
import { useModal } from 'src/hooks/useModal';

import AssignmentsCell from './AssignmentsCell';
import GroupSessionsCell from './GroupSessions/GroupSessionsCell';
import PrivateCallsCell from './PrivateCallsCell';
import StudentCell from './StudentCell';

export default function WeeksTableItem({ week }: { week: Week }) {
  const {
    studentRecordsLessonsQuery,
    getAssignmentsFromWeekRecordId,
    getGroupSessionsFromWeekRecordId,
    getPrivateCallsFromWeekRecordId,
    getStudentFromMembershipId,
  } = useCoaching();
  const { updateWeekMutation } = useWeeks();

  const { openModal } = useModal();

  const dataReady = studentRecordsLessonsQuery.isSuccess;

  const [notes, setNotes] = useState(week.notes);
  const [holdWeek, setHoldWeek] = useState(week.holdWeek);
  const [recordsComplete, setRecordsComplete] = useState(week.recordsComplete);
  const [currentLesson, setCurrentLesson] = useState<string | undefined>(
    week.currentLesson ? week.currentLesson.toString() : undefined,
  );

  const [editMode, setEditMode] = useState(false);

  function validateRecordCompleteable() {
    if (week.week === 0) {
      return true;
    }
    if (week.currentLesson === 0 || null) {
      return false;
    }
    if (
      week.privateCallsCompleted === 0 &&
      notes === '' &&
      week.numberOfGroupCalls === 0
    ) {
      return false;
    }

    return true;
  }
  function handleSubmit() {
    // on no changes, do nothing
    if (
      notes === week.notes &&
      holdWeek === week.holdWeek &&
      recordsComplete === week.recordsComplete
    ) {
      toast.info('No changes detected');
      setEditMode(false);
      return;
    }

    if (recordsComplete) {
      if (!validateRecordCompleteable()) {
        openModal({
          title: 'Error',
          body: 'Cannot mark record as complete without a current lesson, a private or group call, or a note if no calls were made.',
          type: 'error',
        });
        return;
      }
    }

    updateWeekMutation.mutate({
      notes,
      holdWeek,
      recordsComplete,
      offTrack: week.offTrack,
      primaryCoachWhenCreated: week.primaryCoachWhenCreated,
      recordId: week.recordId,
      currentLesson: currentLesson ? Number.parseInt(currentLesson) : undefined,
    });
    setEditMode(false);
  }

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
          <AssignmentsCell
            week={week}
            assignments={getAssignmentsFromWeekRecordId(week.recordId)}
          />
        </td>
        <td>
          {week.numberOfGroupCalls > 0 && (
            <GroupSessionsCell
              week={week}
              groupSessions={getGroupSessionsFromWeekRecordId(week.recordId)}
            />
          )}
        </td>
        <td>
          {week.membershipCourseWeeklyPrivateCalls > 0 && (
            <PrivateCallsCell
              week={week}
              calls={getPrivateCallsFromWeekRecordId(week.recordId)}
            />
          )}
        </td>
        <td>
          {editMode ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!editMode}
            />
          ) : (
            <p>{notes}</p>
          )}
        </td>
        <td>
          {editMode ? (
            <select
              value={currentLesson}
              onChange={(e) => {
                setCurrentLesson(e.target.value);
              }}
            >
              <option value={undefined}>Select Lesson</option>
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
          {editMode ? (
            <input
              type="checkbox"
              checked={holdWeek}
              onChange={() => setHoldWeek(!holdWeek)}
            />
          ) : (
            holdWeek && (
              <img className="checkmark" src={checkmark} alt="Checkmark" />
            )
          )}
        </td>
        <td>
          {editMode ? (
            <input
              type="checkbox"
              checked={recordsComplete}
              onChange={() => setRecordsComplete(!recordsComplete)}
            />
          ) : (
            recordsComplete && (
              <img className="checkmark" src={checkmark} alt="Checkmark" />
            )
          )}
        </td>
        <td>
          {editMode ? (
            <button type="button" onClick={handleSubmit}>
              Submit Changes
            </button>
          ) : (
            <img
              src={pencil}
              alt="Edit Record"
              onClick={() => setEditMode(true)}
            />
          )}
        </td>
      </tr>
    )
  );
}
