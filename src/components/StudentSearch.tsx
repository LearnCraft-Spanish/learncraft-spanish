import { useMemo, useState } from 'react';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
export default function StudentSearch() {
  const { studentListQuery, chooseStudent } = useActiveStudent();

  const [searchString, setSearchString] = useState('');

  const listOfStudents = useMemo(() => {
    return studentListQuery.isSuccess
      ? studentListQuery.data
          .map((student) => {
            const studentEmail = student.emailAddress;
            const studentRole = student.role;
            const studentName = student.name
              .toLowerCase()
              .split(' ')
              .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
              .join(' ');
            if (
              !studentEmail.includes('(') &&
              (studentRole === 'student' || studentRole === 'limited')
            )
              return {
                recordId: student.recordId,
                displayString: `${studentName} -- ${studentEmail}`,
              };
            return undefined;
          })
          .filter((student) => student !== undefined)
          .sort((a, b) => {
            if (a && b) {
              const aName = a.displayString;
              const bName = b.displayString;
              if (aName > bName) return 1;
              else return -1;
            }
            return 0;
          })
      : [];
  }, [studentListQuery]);

  const searchStudentOptions = useMemo(() => {
    if (searchString === '') return [];
    const matchesSearch = listOfStudents.filter((student) => {
      // return student.displayString.split(' -- ').some((s) => {
      //   return s.trim().toLowerCase().includes(searchString.toLowerCase());
      // });
      return student.displayString
        .toLowerCase()
        .includes(searchString.toLowerCase());
    });
    return matchesSearch;
  }, [listOfStudents, searchString]);

  return (
    <div id="searchStudentWrapper">
      <input
        type="text"
        placeholder="Search for a student by name or email"
        onChange={(e) => setSearchString(e.target.value)}
      />
      {searchStudentOptions.length > 0 && (
        <div id="optionsWrapper">
          {searchStudentOptions.map((student) => (
            <div
              key={student.recordId}
              className="searchResultItem"
              onClick={() => chooseStudent(student.recordId)}
            >
              {student.displayString}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
