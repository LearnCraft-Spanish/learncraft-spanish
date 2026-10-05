import { useActiveStudent } from '@application/coordinators/hooks/useActiveStudent';
import { useAppStudentList } from '@application/queries/useAppStudentList';
import { filterStudentsBySearch } from '@domain/studentAccess';
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

  const searchStudentOptions = useMemo(
    () => filterStudentsBySearch(appStudentList ?? [], searchString),
    [appStudentList, searchString],
  );
  return {
    searchStudentOptions,
    searchString,
    setSearchString,
    selectStudent,
  };
}
