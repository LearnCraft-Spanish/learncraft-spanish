import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useAppStudentList } from '@application/queries/useAppStudentList';
import { useCallback, useMemo, useState } from 'react';

export default function useStudentSearch({
  closeMenu,
}: {
  closeMenu: () => void;
}) {
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
  return {
    searchStudentOptions,
    searchString,
    setSearchString,
    selectStudent,
  };
}
