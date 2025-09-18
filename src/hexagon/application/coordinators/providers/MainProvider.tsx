import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { AudioEngineProvider } from '@composition/providers/AudioProvider';
import { AudioParserProvider } from '@composition/providers/AudioParserProvider';
import TempIdContextProvider from './TempIdContextProvider';

export default function MainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TempIdContextProvider>
      <ActiveStudentProvider>
        <SelectedCourseAndLessonsProvider>
          <AudioEngineProvider>
            <AudioParserProvider>
              <ExampleFilterContextProvider>
                {children}
              </ExampleFilterContextProvider>
            </AudioParserProvider>
          </AudioEngineProvider>
        </SelectedCourseAndLessonsProvider>
      </ActiveStudentProvider>
    </TempIdContextProvider>
  );
}
