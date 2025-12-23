import type { Vocabulary } from '@learncraft-spanish/shared';
import useLessonPopup from '@application/units/useLessonPopup';
import VocabTagContainer from '@interface/components/VocabTagDetails/VocabTagContainer';
import VocabularySearch from '@interface/components/VocabularySearch/VocabularySearch';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useState } from 'react';
import './VocabTagEditor.scss';

export interface VocabTagEditorProps {
  vocabularyList: Vocabulary[];
  selectedVocabularyIds: number[];
  onVocabularyAdd: (vocabId: number) => void;
  onVocabularyRemove: (vocabId: number) => void;
  exampleId?: number;
}

export function VocabTagEditor({
  vocabularyList,
  selectedVocabularyIds,
  onVocabularyAdd,
  onVocabularyRemove,
  exampleId = 0,
}: VocabTagEditorProps) {
  const { contextual, openContextual, closeContextual } = useContextualMenu();
  const { lessonPopup } = useLessonPopup();
  const [selectedVocabId, setSelectedVocabId] = useState<number | null>(null);

  const handleSelect = (id: number | null) => {
    setSelectedVocabId(id);
    if (id === null) {
      closeContextual();
    }
  };

  const handleRemove = (vocabId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onVocabularyRemove(vocabId);
  };

  return (
    <div className="vocabTagEditor">
      {/* Selected vocabulary tags */}
      <div className="vocabTagEditor__tags">
        {selectedVocabularyIds.map((vocabId) => {
          const vocabulary = vocabularyList.find((v) => v.id === vocabId);

          if (!vocabulary) return null;

          return (
            <VocabTagContainer
              key={vocabId}
              exampleId={exampleId}
              vocabulary={vocabulary}
              openContextual={openContextual}
              contextual={contextual}
              closeContextual={closeContextual}
              lessonPopup={lessonPopup}
              handleSelect={handleSelect}
              isSelected={selectedVocabId === vocabId}
              removeButton={
                <button
                  type="button"
                  className="vocabTagEditor__remove"
                  onClick={(e) => handleRemove(vocabId, e)}
                  aria-label="Remove vocabulary"
                >
                  ×
                </button>
              }
            />
          );
        })}
      </div>

      {/* Search input - without "Selected" display */}
      <VocabularySearch
        vocabularyList={vocabularyList}
        onVocabularySelect={onVocabularyAdd}
        selectedVocabIds={selectedVocabularyIds}
        hideSelectedDisplay={true}
      />
    </div>
  );
}
