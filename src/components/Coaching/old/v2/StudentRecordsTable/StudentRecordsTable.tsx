import TableHeaderRow from './TableHeaderRow';
import TableRow from './TableRow';
import type {
  Week,
  Call,
  GroupSession,
  Assignment,
  Lesson,
  Membership,
  Coach,
  Course,
} from '../CoachingTypes';

interface StudentRecordsTableProps {
  weeksToDisplay: Week[];
  weekGetsPrivateCalls: (weekId: number) => boolean;
  weekGetsGroupCalls: (weekId: number) => boolean;
  getGroupSessionsFromWeekId: (weekId: number) => (GroupSession | undefined)[];
  getAssignmentsFromWeekId: (weekId: number) => Assignment[];
  getLessonFromRecordId: (recordId: number) => Lesson | undefined;
  memberships: { current: Membership[] };
  openStudentPopup: (recordId: number) => void;
  getStudentFromMembershipId: (membershipId: number) => any;
  getCourseFromMembershipId: (membershipId: number) => any;
  filterByCoach: Coach | undefined;
  filterByCourse: Course | undefined;
  filterByWeeksAgo: number;
  currentAttendee: { current: any };
  openGroupSessionPopup: (recordId: number) => void;
  getAttendeeWeeksFromGroupSessionId: (
    groupSessionId: number,
  ) => (Week | undefined)[] | undefined;
  students: { current: any[] };
  openAttendeePopup: (stringId: string) => void;
  openAssignmentPopup: (recordId: number) => void;
  getMembershipFromWeekId: (weekId: number) => Membership | undefined;
}
export default function StudentRecordsTable({
  weeksToDisplay,
  memberships,
  openStudentPopup,
  getStudentFromMembershipId,
  getCourseFromMembershipId,
  filterByCoach,
  filterByCourse,
  filterByWeeksAgo,
  currentAttendee,
  openGroupSessionPopup,
  getAttendeeWeeksFromGroupSessionId,
  students,
  openAttendeePopup,
  openAssignmentPopup,
  getMembershipFromWeekId,
  weekGetsGroupCalls,
  weekGetsPrivateCalls,
  getGroupSessionsFromWeekId,
  getAssignmentsFromWeekId,
  getLessonFromRecordId,
}: StudentRecordsTableProps) {
  return (
    <table className="studentRecords">
      <thead>
        <TableHeaderRow
          weeksToDisplay={weeksToDisplay}
          weekGetsPrivateCalls={weekGetsPrivateCalls}
          weekGetsGroupCalls={weekGetsGroupCalls}
        />
      </thead>
      <tbody>
        <TableRow
          weeksToDisplay={weeksToDisplay}
          weekGetsPrivateCalls={weekGetsPrivateCalls}
          weekGetsGroupCalls={weekGetsGroupCalls}
          getGroupSessionsFromWeekId={getGroupSessionsFromWeekId}
          getAssignmentsFromWeekId={getAssignmentsFromWeekId}
          getLessonFromRecordId={getLessonFromRecordId}
          memberships={memberships}
          openStudentPopup={openStudentPopup}
          getStudentFromMembershipId={getStudentFromMembershipId}
          getCourseFromMembershipId={getCourseFromMembershipId}
          filterByCoach={filterByCoach}
          filterByCourse={filterByCourse}
          filterByWeeksAgo={filterByWeeksAgo}
          currentAttendee={currentAttendee}
          openGroupSessionPopup={openGroupSessionPopup}
          getAttendeeWeeksFromGroupSessionId={
            getAttendeeWeeksFromGroupSessionId
          }
          students={students}
          openAttendeePopup={openAttendeePopup}
          openAssignmentPopup={openAssignmentPopup}
          getMembershipFromWeekId={getMembershipFromWeekId}
        />
      </tbody>
    </table>
  );
}
