import type { ReactNode } from 'react';
import { ActiveStudentProvider } from '@application/coordinators/providers/ActiveStudentProvider';
import { IsFlushingStudentFlashcardUpdatesProvider } from '@application/coordinators/providers/IsFlushingStudentFlashcardUpdatesProvider';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { SelectedExamplesProvider } from '@application/coordinators/providers/SelectedExamplesProvider';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { ModalProvider } from '@composition/providers/ModalProvider';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MockQueryClientProvider from './MockQueryClient';

interface contextProps {
  route?: string;
  childRoutes?: boolean;
  children: ReactNode;
}

export default function MockAllProviders({
  route = '/',
  childRoutes = false,
  children,
}: contextProps) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <ContextualMenuProvider>
        <ModalProvider>
          <MockQueryClientProvider>
            <ActiveStudentProvider>
              <SelectedCourseAndLessonsProvider>
                <IsFlushingStudentFlashcardUpdatesProvider>
                  <SelectedExamplesProvider>
                    {route === '/' && (
                      <MockQueryClientProvider>
                        {children}
                      </MockQueryClientProvider>
                    )}
                    {route !== '/' && (
                      <Routes>
                        <Route
                          path={`${route}${childRoutes ? '/*' : ''}`}
                          element={children}
                        />
                      </Routes>
                    )}
                  </SelectedExamplesProvider>
                </IsFlushingStudentFlashcardUpdatesProvider>
              </SelectedCourseAndLessonsProvider>
            </ActiveStudentProvider>
          </MockQueryClientProvider>
        </ModalProvider>
      </ContextualMenuProvider>
    </MemoryRouter>
  );
}
