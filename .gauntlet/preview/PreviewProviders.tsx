import type { JSX, ReactNode } from 'react';
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
 * Does not mount production Providers / Auth0Provider / MainProvider.
 */
export function PreviewProviders({
  children,
  route = '/',
}: PreviewProvidersProps): JSX.Element {
  return (
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={queryClient}>
        <ContextualMenuProvider>
          <ModalProvider>{children}</ModalProvider>
        </ContextualMenuProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}
