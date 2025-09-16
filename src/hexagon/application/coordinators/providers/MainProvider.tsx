import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
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
            {children}
          </ExampleFilterContextProvider>
        </AudioEngineProvider>
      </SelectedCourseAndLessonsProvider>
    </ActiveStudentProvider>
  );
}
