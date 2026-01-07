// canidate for refactor & move to hexagon
import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useAppStudentList } from '@application/queries/useAppStudentList';
import { useCallback, useMemo, useState } from 'react';

interface StudentSearchProps {
  closeMenu: () => void;
}

export default function StudentSearch({ closeMenu }: StudentSearchProps) {
  const { changeActiveStudent } = useActiveStudent();
  const { appStudentList } = useAppStudentList();

  const [searchString, setSearchString] = useState('');

  const selectStudent = useCallback(
    (studentEmail: string | null) => {
      changeActiveStudent(studentEmail);
      setSearchString('');
      closeMenu();
    },
    [changeActiveStudent, closeMenu],
  );

  const listOfStudents = useMemo(() => {
    return appStudentList
      ? appStudentList.sort((a, b) => {
          if (a && b) {
            if (a.name > b.name) return 1;
            else if (a.name < b.name) return -1;
            else if (a.emailAddress > b.emailAddress) return 1;
            else if (a.emailAddress < b.emailAddress) return -1;
          }
          return 0;
        })
      : [];
  }, [appStudentList]);

  const searchStudentOptions = useMemo(() => {
    if (searchString === '') return [];
    const matchesSearch = listOfStudents.filter((student) => {
      // return student.displayString.split(' -- ').some((s) => {
      //   return s.trim().toLowerCase().includes(searchString.toLowerCase());
      // });
      const match =
        student.name.toLowerCase().includes(searchString.toLowerCase()) ||
        student.emailAddress.toLowerCase().includes(searchString.toLowerCase());
      return match;
    });
    return matchesSearch;
  }, [listOfStudents, searchString]);

  return (
    <div id="searchStudentWrapper">
      <input
        type="text"
        placeholder="Search for a student by name or email"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
      />
      {searchStudentOptions.length > 0 && (
        <div id="optionsWrapper">
          <div onClick={() => selectStudent(null)}> – Clear Selection – </div>
          {searchStudentOptions.map((student) => (
            <div
              key={student.emailAddress}
              className="searchResultItem"
              onClick={() => selectStudent(student.emailAddress)}
            >
              {student.name ? `${student.name} -- ` : ''}
              {student.emailAddress}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
