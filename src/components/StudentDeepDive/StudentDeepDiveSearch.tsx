import { useMemo, useState } from 'react';
import useActiveStudents from 'src/hooks/CoachingData/queries/useActiveStudents';

interface StudentDeepDiveSearchProps {
  onStudentSelect: (studentId: string) => void;
  selectedStudentId?: string;
}

const StudentDeepDiveSearch: React.FC<StudentDeepDiveSearchProps> = ({
  onStudentSelect,
  selectedStudentId,
}) => {
  const [searchString, setSearchString] = useState('');
  const { activeStudentsQuery } = useActiveStudents();
  const listOfStudents = useMemo(() => {
    return activeStudentsQuery.isSuccess
      ? activeStudentsQuery.data
          .map((student) => {
            const studentEmail = student.email;
            const studentName = student.fullName
              .toLowerCase()
              .split(' ')
              .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
              .join(' ');
            return {
              recordId: student.recordId,
              displayString: `${studentName} -- ${studentEmail}`,
            };
          })
          .sort((a, b) => {
            const aName = a.displayString;
            const bName = b.displayString;
            if (aName > bName) return 1;
            else return -1;
          })
      : [];
  }, [activeStudentsQuery.isSuccess, activeStudentsQuery.data]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return listOfStudents.find(
      (student) => student.recordId === Number(selectedStudentId),
    );
  }, [listOfStudents, selectedStudentId]);

  const searchStudentOptions = useMemo(() => {
    if (searchString === '') return [];
    const matchesSearch = listOfStudents.filter((student) => {
      return student.displayString
        .toLowerCase()
        .includes(searchString.toLowerCase());
    });
    return matchesSearch;
  }, [listOfStudents, searchString]);

  function handleStudentSelect(studentId: string) {
    onStudentSelect(studentId);
    setSearchString('');
  }

  function handleClearStudent() {
    onStudentSelect('');
    setSearchString('');
  }

  return (
    <div className="student-deep-dive-search">
      <div className="search-input-wrapper">
        {selectedStudent ? (
          <div className="selected-student-display">
            <span>{selectedStudent.displayString}</span>
            <button
              className="clear-student-button"
              onClick={handleClearStudent}
              aria-label="Clear student selection"
              type="button"
            >
              ×
            </button>
          </div>
        ) : (
          <input
            type="text"
            placeholder="Search for a student by name or email"
            onChange={(e) => setSearchString(e.target.value)}
            value={searchString}
          />
        )}
      </div>
      {searchStudentOptions.length > 0 && (
        <div className="search-results">
          {searchStudentOptions.map((student) => (
            <div
              key={student.recordId}
              className={`search-result-item ${
                student.recordId === Number(selectedStudentId) ? 'selected' : ''
              }`}
              onClick={() => handleStudentSelect(String(student.recordId))}
            >
              {student.displayString}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDeepDiveSearch;
