import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface contextProps {
  children: ReactNode;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries
        gcTime: 0, // Disable caching for test isolation
        refetchOnWindowFocus: false,
      },
    },
  });

const queryClient = createTestQueryClient();

export default function MockQueryClientProvider({ children }: contextProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
