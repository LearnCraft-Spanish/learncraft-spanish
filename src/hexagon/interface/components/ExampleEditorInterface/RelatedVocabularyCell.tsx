import type { Vocabulary } from '@learncraft-spanish/shared';
import { VocabTagEditor } from '@interface/components/VocabTagEditor/VocabTagEditor';
import { useMemo } from 'react';

/**
 * Cell component for relatedVocabulary column
 * Handles conversion between comma-separated string (table format) and number array (component format)
 * Business logic (add/remove) is handled by parent component
 */
export function RelatedVocabularyCell({
  value,
  vocabularyList,
  onVocabularyAdd,
  onVocabularyRemove,
  rowId,
}: {
  value: string;
  vocabularyList: Vocabulary[];
  onVocabularyAdd: (vocabId: number) => void;
  onVocabularyRemove: (vocabId: number) => void;
  rowId: string;
}) {
  // Parse JSON string to number array (format conversion only)
  const selectedIds = useMemo(() => {
    if (!value || !value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [value]);

  // Parse rowId to number for exampleId
  // rowId format is "row-{entityId}", so we need to extract the entityId
  const exampleId = useMemo(() => {
    // Remove "row-" prefix if present
    const entityIdStr = rowId.startsWith('row-') ? rowId.slice(4) : rowId;
    const id = Number.parseInt(entityIdStr);
    return Number.isNaN(id) ? 0 : id;
  }, [rowId]);

  return (
    <VocabTagEditor
      vocabularyList={vocabularyList}
      selectedVocabularyIds={selectedIds}
      onVocabularyAdd={onVocabularyAdd}
      onVocabularyRemove={onVocabularyRemove}
      exampleId={exampleId}
    />
  );
}
