import type {
  Lesson,
  ProgramWithLessons,
  VocabularyTag,
} from '@LearnCraft-Spanish/shared';
import type { SelectedProgramAndLessonsContextType } from '../context/SelectedProgramAndLessonsContext';
import { useMemo, useState } from 'react';
import { useProgramTable } from 'src/hooks/CourseData/useProgramTable'; // Assuming this fetches the programs data
import SelectedProgramAndLessonsContext from '../context/SelectedProgramAndLessonsContext';

// implement this in Hexagon
// import { useProgramTable } from 'src/hexagon/application/coordinators/hooks/useProgramsTable';
export function SelectedProgramAndLessonsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { programTableQuery } = useProgramTable(); // Fetch the programs data internally

  const [program, setProgram] = useState<ProgramWithLessons | null>(null);
  const [fromLesson, setFromLesson] = useState<Lesson | null>(null);
  const [toLesson, setToLesson] = useState<Lesson | null>(null);

  // Set selected program
  const setProgram = useCallback(
    (program: number | string | null) => {
      if (typeof program === 'string') {
        program = Number.parseInt(program);
      }
      const newProgram =
        programsQueryData?.find((item) => item.recordId === program) || null;
      if (!newProgram?.recordId) {
        queryClient.setQueryData(
          ['programSelection'],
          (oldState: typeof initialSelectionState) => ({
            ...oldState,
            program: null,
            fromLesson: null,
            toLesson: null,
          }),
        );
        return;
      }
      queryClient.setQueryData(
        ['programSelection'],
        (oldState: typeof initialSelectionState) => ({
          ...oldState,
          program: newProgram,
          fromLesson: null,
          toLesson: newToLesson(newProgram),
        }),
      );
    },
    [programsQueryData, newToLesson, queryClient],
  );

  const value: SelectedProgramAndLessonsContextType = useMemo(
    () => ({
      program,
      fromLesson,
      toLesson,
      updateProgram,
      updateFromLesson,
      updateToLesson,
      allowedVocabulary: [],
      requiredVocabulary: [],
    }),
    [program, fromLesson, toLesson],
  );

  return (
    <SelectedProgramAndLessonsContext value={value}>
      {children}
    </SelectedProgramAndLessonsContext>
  );
}
