import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { BannerDisplayProvider } from '@application/coordinators/providers/BannerDisplayProvider';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
import { IsFlushingStudentFlashcardUpdatesProvider } from '@application/coordinators/providers/IsFlushingStudentFlashcardUpdatesProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import TempIdContextProvider from '@application/coordinators/providers/TempIdContextProvider';
import { AudioEngineProvider } from '@composition/providers/AudioProvider';
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
                <IsFlushingStudentFlashcardUpdatesProvider>
                  {children}
                </IsFlushingStudentFlashcardUpdatesProvider>
              </ExampleFilterContextProvider>
            </AudioEngineProvider>
          </SelectedCourseAndLessonsProvider>
        </ActiveStudentProvider>
      </TempIdContextProvider>
    </BannerDisplayProvider>
  );
}
