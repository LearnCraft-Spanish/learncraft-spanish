import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
import FilterOwnedFlashcardsProvider from '@application/coordinators/providers/FilterOwnedFlashcardsProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { AudioEngineProvider } from '@composition/providers/AudioProvider';

export default function MainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveStudentProvider>
      <SelectedCourseAndLessonsProvider>
        <AudioEngineProvider>
          <ExampleFilterContextProvider>
            <FilterOwnedFlashcardsProvider>
              {children}
            </FilterOwnedFlashcardsProvider>
          </ExampleFilterContextProvider>
        </AudioEngineProvider>
      </SelectedCourseAndLessonsProvider>
    </ActiveStudentProvider>
  );
}
