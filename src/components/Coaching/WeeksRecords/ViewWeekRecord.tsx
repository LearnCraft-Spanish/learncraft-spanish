import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import type { Week } from '../../../types/CoachingTypes';
import ContextualControlls from '../../ContextualControlls';
export default function ViewWeekRecord({ week }: { week: Week | undefined }) {
  const { setContextualRef } = useContextualMenu();
  const { getStudentFromMembershipId } = useCoaching();

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
        {/* <div>------ Attendees Section Goes Here ------</div> */}
        {/* list attendees (i think its all group attendees records associated with week) */}
        {/* add attendee (seems to be creating a group attendee record, connecting an existing group session record with an existing student week record. in QB in both dropdown inputs it has the option to add a new group session/student) */}
        {/* Number of Group Calls */}
        <div className="lineWrapper">
          <p className="label">Number of Group Calls: </p>
          <p className="content"> {week.numberOfGroupCalls}</p>
        </div>
        {/* Group Call Comments */}
        <div className="lineWrapper">
          <p className="label">Group Call Comments: </p>
          <p className="content"> {week.groupCallComments}</p>
        </div>
        {/* Private Call Ratings */}
        <div className="lineWrapper">
          <p className="label">Private Call Ratings: </p>
          <p className="content"> {week.privateCallRatings}</p>
        </div>
        {/* Assignment Ratings */}
        <div className="lineWrapper">
          <p className="label">Assignment Ratings: </p>
          <p className="content"> {week.assignmentRatings}</p>
        </div>
        {/* # of calls (private & group) */}
        <div className="lineWrapper">
          <p className="label">Number of Calls (private & group): </p>
          <p className="content">{week.OfCallsPrivateGroup}</p>
        </div>
        {/* bad record? *chexkbox* */}
        <div className="checkboxWrapper">
          <p className="label">Bad Record? </p>
          <input type="checkbox" readOnly checked={week.badRecord} />
        </div>
        {/* primary coach (when created) */}
        <div className="lineWrapper">
          <p className="label">Primary Coach (when created): </p>
          <p className="content"> {week.primaryCoachWhenCreated}</p>
        </div>
        {/* Hold Week *checkbox* */}
        <div className="checkboxWrapper">
          <p className="label">Hold Week</p>
          <input type="checkbox" readOnly checked={week.holdWeek} />
        </div>
        {/* membership - course - has group calls *check or x, not an input* */}
        <div className="checkboxWrapper">
          <p className="label">Membership - Course - has group calls? </p>
          <p className="content">
            {week.membershipCourseHasGroupCalls ? '✅' : '❌'}
          </p>
        </div>
        {/* membership - course - weekly private calls */}
        <div className="lineWrapper">
          <p className="label">Membership - Course - Weekly Private Calls: </p>
          <p className="content">{week.membershipCourseWeeklyPrivateCalls}</p>
        </div>
        {/* bundle credits used */}
        <div className="lineWrapper">
          <p className="label">Bundle Credits Used: </p>
          <p className="content">{week.bundleCreditsUsed}</p>
        </div>
        {/* membership - student - call credits remaining */}
        <div className="lineWrapper">
          <p className="label">
            Membership - Student - Call Credits Remaining:
          </p>
          <p className="content">
            {week.membershipStudentCallCreditsRemaining}
          </p>
        </div>
        {/* blank user */}
        {/* <div className="lineWrapper">
          <p className="label">Blank User: </p>
          <p className="content">{week.blankUser ? week.blankUser.name : ''}</p>
        </div> */}
      </div>
    </div>
  );
}
