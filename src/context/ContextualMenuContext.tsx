import type { RefObject } from 'react';
import { createContext } from 'react';

// Define the type for the context without optional or undefined properties
interface ContextualMenuContextType {
  contextual: string;
  openContextual: (menu: string) => void;
  closeContextual: () => void;
  setContextualRef: (element: HTMLDivElement | null) => void;
}

// Create the context with a default value of `null`
const ContextualMenuContext = createContext<ContextualMenuContextType | null>(
  null,
);

export type { ContextualMenuContextType };
export default ContextualMenuContext;
