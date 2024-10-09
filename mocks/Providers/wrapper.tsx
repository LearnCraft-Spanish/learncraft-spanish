import type { ReactNode } from "react";
import MockAuth0Provider from "./MockAuth0Provider";
import MockQueryClientProvider from "./MockQueryClient";

interface contextProps {
  children: ReactNode;
}

export default function Providers({ children }: contextProps) {
  return (
    <MockAuth0Provider>
      <MockQueryClientProvider>{children}</MockQueryClientProvider>
    </MockAuth0Provider>
  );
}
