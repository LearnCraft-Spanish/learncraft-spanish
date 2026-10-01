import { createContext } from 'react';

interface UsingAsStudentContextType {
  isUsingAsStudent: boolean;
  setIsUsingAsStudent: (isUsingAsStudent: boolean) => void;
}

const UsingAsStudentContext = createContext<UsingAsStudentContextType | null>(
  null,
);

export type { UsingAsStudentContextType };
export default UsingAsStudentContext;
