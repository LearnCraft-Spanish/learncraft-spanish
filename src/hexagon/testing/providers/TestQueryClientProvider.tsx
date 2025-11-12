import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { testQueryClient } from '@testing/utils/testQueryClient';
import React from 'react';

interface WrapperProps {
  children: ReactNode;
}

/**
 * A wrapper component for React Query in tests.
 *
 * @example
 * // In a test file:
 * render(
 *   <TestQueryClientProvider>
 *     <YourComponent />
 *   </TestQueryClientProvider>
 * );
 */
export function TestQueryClientProvider({
  children,
}: WrapperProps): React.ReactElement {
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}
