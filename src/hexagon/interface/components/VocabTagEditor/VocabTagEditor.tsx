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
  exampleId?: number; // Optional example ID for popup context
  // Full vocabulary objects - will be available once backend returns them
  fullVocabularyList?: Vocabulary[];
}

const EMPTY_VOCAB_LIST: Vocabulary[] = [];

export function VocabTagEditor({
  vocabularyList,
  selectedVocabularyIds,
  onVocabularyAdd,
  onVocabularyRemove,
  exampleId = 0,
  fullVocabularyList = EMPTY_VOCAB_LIST,
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
          const vocabAbbr = vocabularyList.find((v) => v.id === vocabId);
          const fullVocab = fullVocabularyList.find((v) => v.id === vocabId);

          if (!vocabAbbr) return null;

          // If we have full vocab, use VocabTagContainer for popup with remove button
          if (fullVocab) {
            return (
              <div key={vocabId} className="vocabTagEditor__tagWrapper">
                <VocabTagContainer
                  exampleId={exampleId}
                  vocabulary={fullVocab}
                  openContextual={openContextual}
                  contextual={contextual}
                  closeContextual={closeContextual}
                  lessonPopup={lessonPopup}
                  handleSelect={handleSelect}
                  isSelected={selectedVocabId === vocabId}
                />
                <button
                  type="button"
                  className="vocabTagEditor__remove"
                  onClick={(e) => handleRemove(vocabId, e)}
                  aria-label="Remove vocabulary"
                >
                  ×
                </button>
              </div>
            );
          }

          // Fallback: just show tag with remove button (no popup until full vocab available)
          return (
            <div key={vocabId} className="vocabTagEditor__tag">
              <span>{vocabAbbr.word}</span>
              <button
                type="button"
                className="vocabTagEditor__remove"
                onClick={(e) => handleRemove(vocabId, e)}
                aria-label="Remove vocabulary"
              >
                ×
              </button>
            </div>
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
