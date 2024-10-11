import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import MockQueryClientProvider from "./MockQueryClient";

interface contextProps {
  children: ReactNode;
}

export default function MockAllProviders({ children }: contextProps) {
  return (
    <MemoryRouter>
      <MockQueryClientProvider>{children}</MockQueryClientProvider>
    </MemoryRouter>
  );
}
