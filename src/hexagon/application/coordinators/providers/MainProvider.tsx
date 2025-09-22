import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { AudioEngineProvider } from '@composition/providers/AudioProvider';
import { AudioTranscodingProvider } from '@composition/providers/AudioTranscodingProvider';
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
            <AudioTranscodingProvider>
              <ExampleFilterContextProvider>
                {children}
              </ExampleFilterContextProvider>
            </AudioTranscodingProvider>
          </AudioEngineProvider>
        </SelectedCourseAndLessonsProvider>
      </ActiveStudentProvider>
    </TempIdContextProvider>
  );
}
