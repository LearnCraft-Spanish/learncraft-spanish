import { useAllCoachingStudentsQuery } from '@application/queries/CoachingStudentQueries/useAllCoachingStudentsQuery';
import { debounce } from 'lodash';
import { useMemo, useRef, useState } from 'react';

interface StudentDrillDownSearchProps {
  onStudentSelect: (studentId: number | undefined) => void;
  selectedStudentId?: number;
}

export default function StudentDrillDownSearch({
  onStudentSelect,
  selectedStudentId,
}: StudentDrillDownSearchProps) {
  const [activeStudentsOnly, setActiveStudentsOnly] = useState(true);
  const [searchString, setSearchString] = useState('');
  const [debouncedSearchString, setDebouncedSearchString] = useState('');

  const debouncedSearch = useRef(
    debounce((value: string) => setDebouncedSearchString(value), 150),
  ).current;

  const debouncedSetSearch = (value: string) => {
    debouncedSearch(value);
  };

  const { allCoachingStudentsQuery } = useAllCoachingStudentsQuery();
  const listOfStudents = useMemo(() => {
    return allCoachingStudentsQuery.isSuccess
      ? allCoachingStudentsQuery.data
          .filter((student) => {
            if (activeStudentsOnly) {
              return student.active;
            }
            return true;
          })
          .map((student) => {
            const studentEmail = student.email;
            const studentName = student.fullName
              .toLowerCase()
              .split(' ')
              .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
              .join(' ');
            return {
              studentId: student.student_id,
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
  }, [
    allCoachingStudentsQuery.isSuccess,
    allCoachingStudentsQuery.data,
    activeStudentsOnly,
  ]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return listOfStudents.find(
      (student) => student.studentId === Number(selectedStudentId),
    );
  }, [listOfStudents, selectedStudentId]);

  const searchStudentOptions = useMemo(() => {
    if (debouncedSearchString === '') return [];
    const matchesSearch = listOfStudents.filter((student) => {
      return student.displayString
        .toLowerCase()
        .includes(debouncedSearchString.toLowerCase());
    });
    return matchesSearch;
  }, [listOfStudents, debouncedSearchString]);

  function handleStudentSelect(studentId: number) {
    onStudentSelect(studentId);
    setSearchString('');
    setDebouncedSearchString('');
  }

  function handleClearStudent() {
    onStudentSelect(undefined);
    setSearchString('');
    setDebouncedSearchString('');
  }

  return (
    <div className="student-deep-dive-search">
      <div className="search-input-wrapper">
        <div className="search-input-wrapper-inner">
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
            <>
              <input
                type="text"
                placeholder="Search for a student by name or email"
                onChange={(e) => {
                  setSearchString(e.target.value);
                  debouncedSetSearch(e.target.value);
                }}
                value={searchString}
              />
              {searchStudentOptions.length > 0 && (
                <div className="search-results">
                  {searchStudentOptions.map((student) => (
                    <div
                      key={student.studentId}
                      className={`search-result-item ${
                        student.studentId === Number(selectedStudentId)
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => handleStudentSelect(student.studentId)}
                    >
                      {student.displayString}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="active-students-filter">
          <p>Active Students Only:</p>
          <label htmlFor="activeStudentsOnly" className="switch">
            <input
              alt="Active Students"
              type="checkbox"
              id="activeStudentsOnly"
              checked={activeStudentsOnly}
              onChange={(e) => setActiveStudentsOnly(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
