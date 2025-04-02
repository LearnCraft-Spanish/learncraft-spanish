import type { Program } from 'src/types/interfaceDefinitions';

export type EditableProgram = Omit<Program, 'lessons'>;
