import { SelectedCourseAndLessonsProvider } from './SelectedCourseAndLessonsProvider';

export default function MainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SelectedCourseAndLessonsProvider>
      {children}
    </SelectedCourseAndLessonsProvider>
  );
}
