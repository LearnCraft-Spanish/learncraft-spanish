import type { Week } from '../../../types/CoachingTypes';
import ContextualControlls from '../../ContextualControlls';
import { useContextualMenu } from '../../../hooks/useContextualMenu';
import useCoaching from '../../../hooks/useCoaching';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';
export default function ViewWeekRecord({ week }: { week: Week | undefined }) {
  const { setContextualRef } = useContextualMenu();
  const { getStudentFromMembershipId } = useCoaching();

  if (!week) {
    return <div>No week data</div>;
  }
  return (
    <div className="contextualWrapper" key={`week${week.recordId}`}>
      <div className="contextual" ref={setContextualRef}>
        <ContextualControlls />
        <h3>
          {`${getStudentFromMembershipId(week.relatedMembership)?.fullName} ${week.level} Week ${week.week}`}
        </h3>
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
          <input type="checkbox" readOnly checked={week.checklistComplete} />
        </div>
        <div className="lineWrapper">
          <p className="label">Notes: </p>
          <p className="content"> {week.notes}</p>
        </div>
        <div className="checkboxWrapper">
          <p className="label">Off Track? </p>
          <input type="checkbox" readOnly checked={week.offTrack} />
        </div>
        <div className="lineWrapper">
          <p className="label">Membership - End Date: </p>
          <p className="content"> {week.membershipEndDate.toString()}</p>
        </div>
        <div className="checkboxWrapper">
          <p className="label">Membership - on Hold </p>
          <input type="checkbox" readOnly checked={week.membershipOnHold} />
        </div>
        <div className="checkboxWrapper">
          <p className="label">Records Complete? </p>
          <input type="checkbox" readOnly checked={week.recordsComplete} />
        </div>
        <div className="lineWrapper">
          <p className="label">Records Complete Ref: </p>
          <p className="content"> {week.recordsCompleteRef}</p>
        </div>
        <div className="checkboxWrapper">
          <p className="label">Record Completeable? </p>
          <input type="checkbox" readOnly checked={week.recordCompletable} />
        </div>
        <div className="lineWrapper">
          <label className="label">Membership - Student - Member Until: </label>
          <p className="content">
            {week.membershipStudentMemberUntil.toString()}
          </p>
        </div>
        <div className="checkboxWrapper">
          <p className="label">Ending this Week? </p>
          <input type="checkbox" readOnly checked={week.endingThisWeek} />
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
