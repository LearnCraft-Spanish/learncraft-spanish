import { useAppStudentList } from '@application/queries/useAppStudentList';
import { debounce } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import '@interface/components/ExampleAssignerInterface/StudentSelector.scss';
interface StudentAssignmentSearchProps {
  onStudentSelect: (studentEmail: string | null) => void;
  selectedStudentEmail?: string | null;
}

export default function StudentAssignmentSearch({
  onStudentSelect,
  selectedStudentEmail,
}: StudentAssignmentSearchProps) {
  const [searchString, setSearchString] = useState('');
  const [debouncedSearchString, setDebouncedSearchString] = useState('');

  const debouncedSearch = useRef(
    debounce((value: string) => setDebouncedSearchString(value), 150),
  ).current;

  const debouncedSetSearch = (value: string) => {
    debouncedSearch(value);
  };

  const { appStudentList } = useAppStudentList();

  const listOfStudents = useMemo(() => {
    return appStudentList
      ? appStudentList
          .map((student) => {
            const studentEmail = student.emailAddress;
            return {
              emailAddress: studentEmail,
              displayString: student.name
                ? `${student.name} -- ${studentEmail}`
                : studentEmail,
            };
          })
          .sort((a, b) => {
            const aName = a.displayString;
            const bName = b.displayString;
            if (aName > bName) return 1;
            else return -1;
          })
      : [];
  }, [appStudentList]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentEmail) return null;
    const result = listOfStudents.find(
      (student) => student.emailAddress === selectedStudentEmail,
    );
    return result;
  }, [listOfStudents, selectedStudentEmail]);

  const searchStudentOptions = useMemo(() => {
    if (debouncedSearchString === '') return [];
    const matchesSearch = listOfStudents.filter((student) => {
      return student.displayString
        .toLowerCase()
        .includes(debouncedSearchString.toLowerCase());
    });
    return matchesSearch;
  }, [listOfStudents, debouncedSearchString]);

  function handleStudentSelect(studentEmail: string) {
    onStudentSelect(studentEmail);
    setSearchString('');
    setDebouncedSearchString('');
  }

  function handleClearStudent() {
    onStudentSelect(null);
    setSearchString('');
    setDebouncedSearchString('');
  }

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="student-assignment-search">
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
                      key={student.emailAddress}
                      className={`search-result-item ${
                        student.emailAddress === selectedStudentEmail
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => handleStudentSelect(student.emailAddress)}
                    >
                      {student.displayString}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
