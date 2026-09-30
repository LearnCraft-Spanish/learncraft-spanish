import type { JSX, ReactNode } from 'react';
import MainProvider from '@application/coordinators/providers/MainProvider';
import { ContextualMenuProvider } from '@composition/providers/ContextualMenuProvider';
import { ModalProvider } from '@composition/providers/ModalProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      // Specimens must not reach a network — fail fast if something tries.
      networkMode: 'always',
      staleTime: Infinity,
    },
    mutations: {
      retry: false,
      networkMode: 'always',
    },
  },
});

interface PreviewProvidersProps {
  children: ReactNode;
  route?: string;
}

/**
 * Auth0-free provider tree for visual specimens.
 * App provider tree without Auth0.
 */
export function PreviewProviders({
  children,
  route = '/',
}: PreviewProvidersProps): JSX.Element {
  return (
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <QueryClientProvider client={queryClient}>
        <ContextualMenuProvider>
          <ModalProvider>
            <MainProvider>{children}</MainProvider>
          </ModalProvider>
        </ContextualMenuProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}
