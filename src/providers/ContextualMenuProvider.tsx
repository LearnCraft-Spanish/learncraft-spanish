import React, { createContext, useCallback, useMemo, useState } from "react";

// Define the type for the context
interface ContextualMenuContextType {
  contextual: string;
  openContextual: (menu: string) => void;
  closeContextual: () => void;
}

// Create the context
export const ContextualMenuContext = createContext<
  ContextualMenuContextType | undefined
>(undefined);

// Provider component
export const ContextualMenuProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [contextual, setContextual] = useState<string>("");

  const openContextual = useCallback((menu: string) => {
    setContextual(menu);
  }, []);

  const closeContextual = useCallback(() => {
    setContextual("");
  }, []);

  // Memoize the value object to avoid re-creating it on every render
  const value = useMemo(
    () => ({ contextual, openContextual, closeContextual }),
    [contextual, openContextual, closeContextual]
  );

  return (
    <ContextualMenuContext.Provider value={value}>
      {children}
    </ContextualMenuContext.Provider>
  );
};
