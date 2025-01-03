import type { Week } from '../CoachingTypes';
import ContextualControlls from '../../contextualControlls';
import { useContextualMenu } from '../../../hooks/useContextualMenu';
export default function ViewWeekRecord({ week }: { week: Week }) {
  const { setContextualRef } = useContextualMenu();
  return (
    <div className="contextualWrapper">
      <div className="contextual" ref={setContextualRef}>
        <ContextualControlls />
        <div className="lineWrapper">
          <p className="label">Related Membership: </p>
          <p className="content"> {week.relatedMembership}</p>
        </div>
        <div className="lineWrapper">
          <p className="label">Week #: </p>
          <p className="content"> {week.week}</p>
        </div>
        <div className="lineWrapper">
          <p className="label">Current Lesson Name: </p>
          <p className="content"> {week.currentLessonName}</p>
        </div>
        <div className="lineWrapper">
          <p className="label">Current Lesson: </p>
          <p className="content"> {week.currentLesson}</p>
        </div>
        <div className="checkboxWrapper">
          <p className="label">Checklist complete? </p>
          <input type="checkbox" checked={week.checklistComplete} />
        </div>
        <div className="lineWrapper">
          <p className="label">Notes: </p>
          <p className="content"> {week.notes}</p>
        </div>
        <div className="checkboxWrapper">
          <p className="label">Off Track? </p>
          <input type="checkbox" checked={week.offTrack} />
        </div>
        <div className="lineWrapper">
          <p className="label">Membership - End Date: </p>
          <p className="content"> {week.membershipEndDate.toString()}</p>
        </div>
        <div className="checkboxWrapper">
          <p className="label">Membership - on Hold </p>
          <input type="checkbox" checked={week.membershipOnHold} />
        </div>
        <div className="checkboxWrapper">
          <p className="label">Records Complete? </p>
          <input type="checkbox" checked={week.recordsComplete} />
        </div>
        <div className="lineWrapper">
          <p className="label">Records Complete Ref: </p>
          <p className="content"> {week.recordsCompleteRef}</p>
        </div>
        <div className="checkboxWrapper">
          <p className="label">Record Completeable? </p>
          <input type="checkbox" checked={week.recordCompletable} />
        </div>
        <div className="lineWrapper">
          <p className="label">Membership - Student - Member Until: </p>
          <p className="content">
            {' '}
            {week.membershipStudentMemberUntil.toString()}
          </p>
        </div>
        <div className="checkboxWrapper">
          <p className="label">Ending this Week? </p>
          <input type="checkbox" checked={week.endingThisWeek} />
        </div>
        <div className="lineWrapper">
          <p className="label">Combined Key for Uniques: </p>
          <p className="content"> {week.combinedKeyForUniques}</p>
        </div>
        {/* Attendees SECTION goes here */}
        <div>------ Attendees Section Goes Here ------</div>
      </div>
    </div>
  );
}
