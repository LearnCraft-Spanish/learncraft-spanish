import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import MockQueryClientProvider from "./MockQueryClient";

interface contextProps {
  route?: string;
  childRoutes?: boolean;
  children: ReactNode;
}

export default function MockAllProviders({
  route = "/",
  childRoutes = false,
  children,
}: contextProps) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <MockQueryClientProvider>
        {route === "/" && (
          <MockQueryClientProvider>{children}</MockQueryClientProvider>
        )}
        {route !== "/" && (
          <Routes>
            <Route
              path={`/${route}${childRoutes ? "/*" : ""}`}
              element={children}
            />
          </Routes>
        )}
      </MockQueryClientProvider>
    </MemoryRouter>
  );
}
