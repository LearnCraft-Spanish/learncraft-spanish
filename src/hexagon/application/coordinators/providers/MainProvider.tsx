import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { BannerDisplayProvider } from '@application/coordinators/providers/BannerDisplayProvider';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { AudioEngineProvider } from '@composition/providers/AudioProvider';
import TempIdContextProvider from './TempIdContextProvider';

export default function MainProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BannerDisplayProvider>
      <TempIdContextProvider>
        <ActiveStudentProvider>
          <SelectedCourseAndLessonsProvider>
            <AudioEngineProvider>
              <ExampleFilterContextProvider>
                {children}
              </ExampleFilterContextProvider>
            </AudioEngineProvider>
          </SelectedCourseAndLessonsProvider>
        </ActiveStudentProvider>
      </TempIdContextProvider>
    </BannerDisplayProvider>
  );
}
