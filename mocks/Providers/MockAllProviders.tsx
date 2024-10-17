import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import MockQueryClientProvider from "./MockQueryClient";

interface contextProps {
  route?: string;
  children: ReactNode;
}

export default function MockAllProviders({
  route = "/",
  children,
}: contextProps) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <MockQueryClientProvider>{children}</MockQueryClientProvider>
    </MemoryRouter>
  );
}
