import type { FurnishedWeekWithCoach } from 'src/types/CoachingTypes';

import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
export default function ViewWeekRecord({
  week,
}: {
  week: FurnishedWeekWithCoach | undefined;
}) {
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
  if (!week.student) {
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
    <ContextualView key={`week${week.recordId}`}>
      <div className="lineWrapper">
        <p className="label">Student:</p>
        <p className="content">{week.student.fullName}</p>
      </div>
      <div className="lineWrapper">
        <p className="label">Email:</p>
        <p className="content">{student.email}</p>
      </div>
      <div className="lineWrapper">
        <p className="label">Time Zone:</p>
        <p className="content">{student.timeZone}</p>
      </div>
      <div className="lineWrapper">
        <p className="label">Pronouns:</p>
        <p className="content">{student.pronoun}</p>
      </div>
      <div className="lineWrapper">
        <p className="label">Learning Disabilities:</p>
        <p className="content">{student.learningDisabilities}</p>
      </div>

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
    </ContextualView>
  );
}
