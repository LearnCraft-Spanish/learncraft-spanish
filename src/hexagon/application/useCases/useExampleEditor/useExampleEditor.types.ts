import type { EditTableHook } from '@application/units/pasteTable/useEditTable';
import type { ExampleTechnical } from '@learncraft-spanish/shared';

/**
 * Table row type for editing examples
 * Uses hasAudio boolean instead of two separate URL fields
 */
export interface ExampleEditRow extends Record<string, unknown> {
  /** Domain ID for matching during edit operations */
  id: number;
  /** Spanish example text */
  spanish: string;
  /** English translation */
  english: string;
  /** Single boolean to represent audio availability */
  hasAudio: boolean;
  /** Whether this is a spanglish example */
  spanglish: boolean;
  /** Whether vocabulary is complete for this example */
  vocabularyComplete: boolean;
}

/**
 * Props for the useExampleEditor hook
 */
export interface UseExampleEditorProps {
  /** Source examples from TanStack query */
  examples: ExampleTechnical[];
  /** Callback when examples are saved */
  onSave?: () => void;
}

/**
 * Return type for the useExampleEditor hook
 */
export interface UseExampleEditorResult {
  /** The edit table hook with all table operations */
  tableHook: EditTableHook<ExampleEditRow>;
  /** Discard all changes and revert to source data */
  discardChanges: () => void;
  /** Apply changes - saves dirty rows */
  applyChanges: () => Promise<void>;
  /** Whether the table has unsaved changes */
  hasUnsavedChanges: boolean;
  /** Whether save is in progress */
  isSaving: boolean;
  /** Error from save operation */
  saveError: Error | null;
}
