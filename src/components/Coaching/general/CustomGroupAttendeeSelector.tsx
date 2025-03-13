import { useMemo, useState } from 'react';
import { InlineLoading } from 'src/components/Loading';
import { toISODate } from 'src/functions/dateUtils';
import useWeeks from 'src/hooks/CoachingData/queries/useWeeks';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import getWeekEnds from './functions/getWeekEnds';

export default function CustomGroupAttendeeSelector({
  weekStarts,
  onChange,
}: {
  weekStarts: string;
  onChange: (weekRecordId: number) => void;
}) {
  const weekEnds = getWeekEnds(weekStarts);

  const { weeksQuery } = useWeeks(weekStarts, weekEnds);
  const { getStudentFromMembershipId } = useCoaching();

  const [searchString, setSearchString] = useState('');
  const isLoading = weeksQuery.isLoading;
  const [optionsVisible, setOptionsVisible] = useState(false);

  const listOfStudents = useMemo(() => {
    if (!weeksQuery.data) return [];
    const studentList = weeksQuery.data
      ?.filter((week) => week.membershipCourseHasGroupCalls)
      .map((week) => {
        const student = getStudentFromMembershipId(week.relatedMembership);
        if (!student) return undefined;
        return {
          studentFullName: student?.fullName,
          weekRecordId: week.recordId,
          weekStarts:
            week.weekStarts instanceof Date
              ? toISODate(week.weekStarts)
              : week.weekStarts,
        };
      });
    return studentList.filter((student) => student !== undefined);
  }, [weeksQuery.data, getStudentFromMembershipId]);

  const searchStudentOptions = useMemo(() => {
    if (searchString === '') return [];
    const matchesSearch = listOfStudents.filter((student) => {
      return student.studentFullName
        .toLowerCase()
        .includes(searchString.toLowerCase());
    });
    return matchesSearch;
  }, [listOfStudents, searchString]);

  function handleChange(weekRecordId: number) {
    setSearchString('');
    onChange(weekRecordId);
    setOptionsVisible(false);
  }
  return (
    <div id="searchStudentWrapper" className="customSearchStudentWrapper">
      {isLoading ? (
        <InlineLoading message="Loading student data..." />
      ) : (
        <>
          <input
            type="text"
            placeholder="Search for a student by name"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            onFocus={() => setOptionsVisible(true)}
          />
          {optionsVisible && (
            <div id="optionsWrapper">
              {searchStudentOptions.length > 0 ? (
                searchStudentOptions.map((student) => (
                  <div
                    key={student.weekRecordId}
                    className="searchResultItem"
                    onClick={() => handleChange(student.weekRecordId)}
                  >
                    {student.studentFullName} - {student.weekStarts}
                  </div>
                ))
              ) : (
                <div
                  className="searchResultItem"
                  onClick={() => handleChange(-1)}
                >
                  No Attendees
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
