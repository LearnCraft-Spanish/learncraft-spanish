import type { Week } from 'src/types/CoachingTypes';
import { useMemo } from 'react';
import ContextualControls from 'src/components/ContextualControls';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
export default function ViewWeekRecord({ week }: { week: Week | undefined }) {
  const { setContextualRef } = useContextualMenu();
  const { getStudentFromMembershipId } = useCoaching();

  const student = useMemo(
    () => getStudentFromMembershipId(week?.relatedMembership),
    [getStudentFromMembershipId, week?.relatedMembership],
  );

  if (!week) {
    console.error('Week record is undefined');
    return (
      <div className="contextualWrapper">
        <div className="contextual">
          <h3>Week record is undefined, please try again</h3>
        </div>
      </div>
    );
  }
  if (!student) {
    console.error('Student record is undefined');
    return (
      <div className="contextualWrapper">
        <div className="contextual">
          <h3>Student record is undefined, please try again</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="contextualWrapper" key={`week${week.recordId}`}>
      <div className="contextual" ref={setContextualRef}>
        <ContextualControls />
        <div className="lineWrapper">
          <p className="label">Student:</p>
          <p className="content">{student.fullName}</p>
        </div>
        <div className="lineWrapper">
          <p className="label">Email:</p>
          <p className="content">{student.email}</p>
        </div>
        <div className="lineWrapper">
          <p className="label">Time Zone:</p>
          <p className="content">{student.timeZone}</p>
        </div>
        {/* <div className="lineWrapper">
          <p className="label">Membership Level:</p>
          <p className="content">{student.currentLevel}</p>
        </div> */}
        <div className="lineWrapper">
          <p className="label">Primary Coach:</p>
          <p className="content">{student.primaryCoach.name}</p>
        </div>

        <div className="lineWrapper">
          <p className="label">Fluency Goal:</p>
          <p className="content">{student.fluencyGoal}</p>
        </div>
        <div className="lineWrapper">
          <p className="label">Starting Level:</p>
          <p className="content">{student.startingLevel}</p>
        </div>
        <div className="lineWrapper">
          <p className="label">Week #: </p>
          <p className="content"> {week.week}</p>
        </div>
        <div className="lineWrapper">
          <p className="label">Current Lesson: </p>
          <p className="content"> {week.currentLessonName}</p>
        </div>
      </div>
    </div>
  );
}
