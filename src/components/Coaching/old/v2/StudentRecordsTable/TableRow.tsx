import StudentCell from './StudentCell';
import CallsCell from './CallsCell';
import GroupSessionsCell from './GroupSessionsCell';
import AssignmentsCell from './AssignmentsCell';
import type {
  Week,
  Lesson,
  Membership,
  Student,
  GroupSession,
  Coach,
  Course,
} from '../CoachingTypes';

interface TableRowProps {
  weeksToDisplay: Week[];
  weekGetsPrivateCalls: (weekId: number) => boolean;
  weekGetsGroupCalls: (weekId: number) => boolean;
  getGroupSessionsFromWeekId: (weekId: number) => any;
  getAssignmentsFromWeekId: (weekId: number) => any;
  getLessonFromRecordId: (recordId: number) => any;
  memberships: { current: Membership[] };
  openStudentPopup: (recordId: number) => void;
  getStudentFromMembershipId: (membershipId: number) => any;
  getCourseFromMembershipId: (membershipId: number) => any;
  filterByCoach: Coach | undefined;
  filterByCourse: Course | undefined;
  filterByWeeksAgo: number;
  currentAttendee: { current: any };
  openGroupSessionPopup: (recordId: number) => void;
  getAttendeeWeeksFromGroupSessionId: (groupSessionId: number) => any;
  students: { current: any[] };
  openAttendeePopup: (stringId: string) => void;
  openAssignmentPopup: (recordId: number) => void;
  getMembershipFromWeekId: (weekId: number) => Membership | undefined;
}

export default function TableRow({
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
}: TableRowProps) {
  return weeksToDisplay.map((week: Week) => (
    <tr key={week.recordId} className="studentWeek">
      <td className="studentHeader">
        <StudentCell
          week={week}
          memberships={memberships}
          openStudentPopup={openStudentPopup}
          getStudentFromMembershipId={getStudentFromMembershipId}
          getCourseFromMembershipId={getCourseFromMembershipId}
          filterByCoach={filterByCoach}
          filterByCourse={filterByCourse}
          filterByWeeksAgo={filterByWeeksAgo}
        />
      </td>
      {weeksToDisplay.filter((item) => weekGetsPrivateCalls(item.recordId))
        .length > 0 && (
        <td>
          Cell data goes here
          {/* <CallsCell data={week} /> */}
        </td>
      )}
      {weeksToDisplay.filter((item) => weekGetsGroupCalls(week.recordId))
        .length > 0 && (
        <td>
          <GroupSessionsCell
            groupSessions={getGroupSessionsFromWeekId(week.recordId)}
            currentAttendee={currentAttendee}
            openGroupSessionPopup={openGroupSessionPopup}
            getAttendeeWeeksFromGroupSessionId={
              getAttendeeWeeksFromGroupSessionId
            }
            getStudentFromMembershipId={getStudentFromMembershipId}
            students={students}
            openAttendeePopup={openAttendeePopup}
          />
        </td>
      )}
      <td>
        <AssignmentsCell
          data={getAssignmentsFromWeekId(week.recordId)}
          getStudentFromMembershipId={getStudentFromMembershipId}
          getMembershipFromWeekId={getMembershipFromWeekId}
          openAssignmentPopup={openAssignmentPopup}
        />
      </td>
      <td className="studentWeekNotes">{week.notes}</td>
      <td className="studentWeekNotes">
        {getLessonFromRecordId(week.currentLesson)
          ? getLessonFromRecordId(week.currentLesson).currentLesson
          : 'No lesson'}
      </td>
    </tr>
  ));
}
