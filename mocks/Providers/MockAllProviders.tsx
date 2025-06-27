import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ActiveStudentProvider } from 'src/hexagon/application/coordinators/providers/ActiveStudentProvider';
import { SelectedCourseAndLessonsProvider } from 'src/hexagon/application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { ContextualMenuProvider } from 'src/providers/ContextualMenuProvider';
import { ModalProvider } from 'src/providers/ModalProvider';
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
                {route === '/' && (
                  <MockQueryClientProvider>{children}</MockQueryClientProvider>
                )}
                {route !== '/' && (
                  <Routes>
                    <Route
                      path={`${route}${childRoutes ? '/*' : ''}`}
                      element={children}
                    />
                  </Routes>
                )}
              </SelectedCourseAndLessonsProvider>
            </ActiveStudentProvider>
          </MockQueryClientProvider>
        </ModalProvider>
      </ContextualMenuProvider>
    </MemoryRouter>
  );
}
