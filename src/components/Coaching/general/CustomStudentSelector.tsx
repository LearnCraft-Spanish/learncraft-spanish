/*
The specific use case for this component:
when a list of students is needed where:
- the value of the input is the Week Record ID associated with a student
- the list of week records is based on a weekStarts date passed into the component

the bones of this component are based on the StudentSearch component, but the list of students is filtered based on the weekStarts date
*/
import { InlineLoading } from '@interface/components/Loading';
import { useMemo, useState } from 'react';
import { toISODate } from 'src/hexagon/domain/functions/dateUtils';
import useWeeks from 'src/hooks/CoachingData/queries/useWeeks';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import getWeekEnds from './functions/getWeekEnds';

export default function CustomStudentSelector({
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

  const listOfStudents = useMemo(() => {
    if (!weeksQuery.data) return [];
    const studentList = weeksQuery.data?.map((week) => {
      // Foreign Key lookup, form data in backend?
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

  return (
    <div id="searchStudentWrapper" className="customSearchStudentWrapper">
      {isLoading ? (
        <InlineLoading message="Loading student data..." />
      ) : (
        <>
          <input
            type="text"
            placeholder="Search for a student by name"
            onChange={(e) => setSearchString(e.target.value)}
          />
          {searchStudentOptions.length > 0 && (
            <div id="optionsWrapper">
              {searchStudentOptions.map((student) => (
                <div
                  key={student.weekRecordId}
                  className="searchResultItem"
                  onClick={() => onChange(student.weekRecordId)}
                >
                  {student.studentFullName} - {student.weekStarts}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
