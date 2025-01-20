import { useContextualMenu } from 'src/hooks/useContextualMenu';
import type {
  GroupSession,
  Student,
  GroupAttendees,
  Week,
} from '../CoachingTypes';

interface GroupSessionsCellProps {
  groupSessions: GroupSession[];
  currentAttendee: { current: Student | null | undefined };
  openGroupSessionPopup: (recordId: number) => void;
  getAttendeeWeeksFromGroupSessionId: (groupSessionId: number) => Week[];
  getStudentFromMembershipId: (membershipId: number) => any;
  students: { current: Student[] };
  openAttendeePopup: (stringId: string) => void;
}
export default function GroupSessionsCell({
  groupSessions,
  currentAttendee,
  openAttendeePopup,
  students,
  openGroupSessionPopup,
  getAttendeeWeeksFromGroupSessionId,
  getStudentFromMembershipId,
}: GroupSessionsCellProps) {
  const { contextual, closeContextual, setContextualRef } = useContextualMenu();
  // gets data from getGroupSessionsFromWeekId
  if (groupSessions.length === 0) {
    return null;
  } else {
    function changeAttendee(attendeeId: number, groupSessionId: number) {
      currentAttendee.current = students.current.find(
        (student) => student.recordId === attendeeId,
      );
      openAttendeePopup(`${attendeeId}-${groupSessionId}`);
    }
    return groupSessions.map((groupSession) => (
      <div className="assignmentBox" key={groupSession.recordId}>
        <button
          type="button"
          onClick={() => openGroupSessionPopup(groupSession.recordId)}
        >
          {groupSession.sessionType}
        </button>
        {contextual === `groupSession${groupSession.recordId}` && (
          <div className="groupSessionPopup" ref={setContextualRef}>
            <h4>
              {groupSession.sessionType} on
              {typeof groupSession.date === 'string'
                ? groupSession.date
                : groupSession.date.toDateString()}
            </h4>
            <p>
              Coach:
              {groupSession.coach ? groupSession.coach.name : ''}
            </p>
            <p>
              Topic:
              {groupSession.topic}
            </p>
            <p>
              Comments:
              {groupSession.comments}
            </p>
            <p>
              <strong>Attendees:</strong>
            </p>
            <div className="groupAttendeeList">
              {getAttendeeWeeksFromGroupSessionId(groupSession.recordId).map(
                (attendee) => (
                  <button
                    type="button"
                    key={attendee.recordId}
                    className="groupAttendee"
                    onClick={() =>
                      changeAttendee(
                        getStudentFromMembershipId(attendee.relatedMembership)
                          .recordId,
                        groupSession.recordId,
                      )
                    }
                  >
                    {
                      getStudentFromMembershipId(attendee.relatedMembership)
                        .fullName
                    }
                  </button>
                ),
              )}
            </div>
            {(groupSession.callDocument
              ? groupSession.callDocument.length > 0
              : false) && (
              <p>
                <a target="_blank" href={groupSession.callDocument}>
                  Call Document
                </a>
              </p>
            )}
            {(groupSession.zoomLink
              ? groupSession.zoomLink.length > 0
              : false) && (
              <p>
                <a target="_blank" href={groupSession.zoomLink}>
                  Recording Link
                </a>
              </p>
            )}
            <div className="buttonBox">
              <button
                type="button"
                className="redButton"
                onClick={closeContextual}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {contextual ===
          `attendee${
            currentAttendee.current
              ? currentAttendee.current.recordId
              : undefined
          }-${groupSession.recordId}` &&
          currentAttendee.current && (
            <div className="studentPopup" ref={setContextualRef}>
              <h4>{currentAttendee.current.fullName}</h4>
              <p>{currentAttendee.current.email}</p>
              <p>
                {' '}
                Primary Coach:
                {currentAttendee.current.primaryCoach.name}
              </p>
              <h5>Fluency Goal:</h5>
              <p>{currentAttendee.current.fluencyGoal}</p>
              <h5>Starting Level:</h5>
              <p>{currentAttendee.current.startingLevel}</p>
              <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  onClick={() => openGroupSessionPopup(groupSession.recordId)}
                >
                  Back
                </button>
              </div>
            </div>
          )}
      </div>
    ));
  }
}
