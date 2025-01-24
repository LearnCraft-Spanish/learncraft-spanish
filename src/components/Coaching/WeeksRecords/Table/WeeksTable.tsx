import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useCallback, useMemo, useState } from 'react';
import type { Week } from 'src/types/CoachingTypes';
import checkmark from 'src/assets/icons/checkmark_green.svg';
import Pagination from 'src/components/FlashcardFinder/Pagination';
import QuantifiedRecords from '../quantifyingRecords';
import GroupSessionsCell from './GroupSessionsCell';
import AssignmentsCell from './AssignmentsCell';
import PrivateCallsCell from './PrivateCallsCell';
import StudentCell from './StudentCell';
interface NewTableProps {
  weeks: Week[] | undefined;
}
export default function WeeksTable({ weeks }: NewTableProps) {
  const { getAssignmentsFromWeekRecordId } = useCoaching();

  const [page, setPage] = useState(1);
  const itemsPerPage = 50;

  const maxPage = Math.ceil(weeks ? weeks.length / itemsPerPage : 0);

  const displayOrderSegment = useMemo(() => {
    return weeks
      ? weeks.slice((page - 1) * itemsPerPage, page * itemsPerPage)
      : [];
  }, [weeks, page]);

  const nextPage = useCallback(() => {
    if (page >= maxPage) {
      return;
    }
    setPage(page + 1);
  }, [page, maxPage]);

  const previousPage = useCallback(() => {
    if (page <= 1) {
      return;
    }
    setPage(page - 1);
  }, [page]);

  return (
    weeks && (
      <>
        <div className="numberShowing">
          {/* THIS NEEDS TO HAVE A CASE FOR 0 EXAMPLES */}
          <QuantifiedRecords
            currentPage={page}
            totalRecords={weeks.length}
            recordsPerPage={itemsPerPage}
          />
        </div>
        <Pagination
          page={page}
          maxPage={maxPage}
          nextPage={nextPage}
          previousPage={previousPage}
        />
        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                {/* <th>Level</th> */}
                {/* <th>Primary Coach</th> */}
                <th>Week Starts</th>
                <th>Assignments</th>
                <th>Group Calls</th>
                {/* <th>Group Call Comments</th> */}
                <th>Private Calls</th>
                <th>Notes</th>
                <th>Current Lesson </th>
                <th>Hold Week</th>
                <th>Records Complete?</th>
                <th>Membership - Student - Call Credits Remaining</th>
              </tr>
            </thead>
            <tbody>
              {displayOrderSegment.map((week) => (
                <tr key={week.recordId}>
                  <td>
                    <StudentCell week={week} />
                  </td>
                  {/* <td>{week.level}</td> */}
                  {/* <td>
                {week.primaryCoach.name
                  ? week.primaryCoach.name
                  : 'No Primary Coach Found'}
              </td> */}
                  <td>{week.weekStarts.toString()}</td>
                  <td>
                    {week.assignmentRatings.length > 0 &&
                      getAssignmentsFromWeekRecordId(week.recordId)?.map(
                        (assignment) => (
                          // <p>{assignment.rating}</p>
                          <AssignmentsCell
                            assignment={assignment}
                            key={`assignment${assignment.recordId}`}
                          />
                        ),
                      )}
                  </td>
                  <td>
                    {week.numberOfGroupCalls > 0 && (
                      <GroupSessionsCell week={week} />
                    )}
                  </td>
                  {/* <td>{week.groupCallComments}</td> */}
                  <td>
                    {week.privateCallsCompleted > 0 && (
                      // getPrivateCallsFromWeekRecordId(week.recordId)?.map(
                      <PrivateCallsCell week={week} />
                    )}
                  </td>
                  <td>{week.notes}</td>
                  <td>{week.currentLessonName}</td>
                  <td>
                    {week.holdWeek && (
                      <img
                        className="checkmark"
                        src={checkmark}
                        alt="Checkmark"
                      />
                    )}
                  </td>
                  <td>
                    {week.recordsComplete && (
                      <img
                        className="checkmark"
                        src={checkmark}
                        alt="Checkmark"
                      />
                    )}
                  </td>
                  <td>{week.membershipStudentCallCreditsRemaining}</td>
                  {/* {contextual === `week${week.recordId}` && (
                  <ViewWeekRecord week={week} />
                )} */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  );
}
