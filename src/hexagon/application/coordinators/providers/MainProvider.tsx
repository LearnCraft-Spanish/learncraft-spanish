import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';

export default function MainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveStudentProvider>
      <SelectedCourseAndLessonsProvider>
        {children}
      </SelectedCourseAndLessonsProvider>
    </ActiveStudentProvider>
  );
}
