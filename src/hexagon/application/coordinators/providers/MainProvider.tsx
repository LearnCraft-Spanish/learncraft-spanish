import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';

export default function MainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveStudentProvider>
      <SelectedCourseAndLessonsProvider>
        <ExampleFilterContextProvider>{children}</ExampleFilterContextProvider>
      </SelectedCourseAndLessonsProvider>
    </ActiveStudentProvider>
  );
}
