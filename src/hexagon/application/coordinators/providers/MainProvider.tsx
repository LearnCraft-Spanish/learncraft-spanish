import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
import FilterOwnedFlashcardsProvider from '@application/coordinators/providers/FilterOwnedFlashcardsProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';

export default function MainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveStudentProvider>
      <SelectedCourseAndLessonsProvider>
        <ExampleFilterContextProvider>
          <FilterOwnedFlashcardsProvider>
            {children}
          </FilterOwnedFlashcardsProvider>
        </ExampleFilterContextProvider>
      </SelectedCourseAndLessonsProvider>
    </ActiveStudentProvider>
  );
}
