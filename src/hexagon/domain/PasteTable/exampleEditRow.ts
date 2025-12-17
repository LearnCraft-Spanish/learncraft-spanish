/**
 * Example Edit Row - domain type and mappers for editing examples in a table
 */

import type { createAudioUrlAdapter } from '@domain/PasteTable/functions/audioUrlAdapter';
import type {
  ExampleTechnical,
  UpdateExampleCommand,
} from '@learncraft-spanish/shared';

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
 * Map ExampleTechnical to ExampleEditRow
 * Converts two audio URL fields to single hasAudio boolean
 */
export function mapExampleToEditRow(example: ExampleTechnical): ExampleEditRow {
  // hasAudio is true if BOTH audio URLs are present and non-empty
  const hasAudio = !!(example.spanishAudio && example.englishAudio);

  return {
    id: example.id,
    spanish: example.spanish,
    english: example.english,
    hasAudio,
    spanglish: example.spanglish,
    vocabularyComplete: example.vocabularyComplete,
  };
}

/**
 * Map ExampleEditRow back to UpdateExampleCommand
 * Converts hasAudio boolean back to two audio URL fields
 */
export function mapEditRowToUpdateCommand(
  row: Partial<ExampleEditRow>,
  audioUrlAdapter: ReturnType<typeof createAudioUrlAdapter>,
): UpdateExampleCommand {
  const exampleId = row.id!;

  // Generate audio URLs from hasAudio boolean
  const audioUrls = audioUrlAdapter.generateAudioUrls(
    row.hasAudio ?? false,
    exampleId,
  );

  return {
    exampleId,
    spanish: row.spanish,
    english: row.english,
    spanishAudio: audioUrls.spanishAudioLa,
    englishAudio: audioUrls.englishAudio,
    vocabularyComplete: row.vocabularyComplete,
    // Note: spanglish is not in UpdateExampleCommand - it's computed server-side
  };
}
