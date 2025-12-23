import type { LessonPopup } from '@application/units/useLessonPopup';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import VocabTagContainer from '@interface/components/VocabTagDetails/VocabTagContainer';
import { useState } from 'react';

export default function MoreInfoViewExample({
  example,
  isOpen,
  openContextual,
  contextual,
  closeContextual,
  lessonPopup,
}: {
  example: ExampleWithVocabulary | Flashcard;
  isOpen: boolean;
  openContextual: (contextual: string) => void;
  contextual: string;
  closeContextual: () => void;
  lessonPopup: LessonPopup;
}) {
  const [vocabTagSelected, setVocabTagSelected] = useState<number | null>(null);
  const handleSelect = (id: number | null) => {
    if (id === null) {
      setVocabTagSelected(null);
      return;
    }
    setVocabTagSelected(id);
  };
  let exampleWithVocabulary: ExampleWithVocabulary;
  if ('vocabulary' in example) {
    exampleWithVocabulary = example;
  } else {
    exampleWithVocabulary = example.example;
  }

  return (
    isOpen && (
      <div className={`moreInfoView ${isOpen ? 'open' : 'closed'}`}>
        {exampleWithVocabulary.vocabularyComplete &&
          exampleWithVocabulary.vocabulary.length > 0 && (
            <div className="vocabTagsSide">
              <h3>Vocabulary</h3>
              <div className="vocabTagsList">
                {exampleWithVocabulary.vocabulary.map((vocab) => (
                  <VocabTagContainer
                    key={vocab.id}
                    exampleId={exampleWithVocabulary.id}
                    vocabulary={vocab}
                    openContextual={openContextual}
                    contextual={contextual}
                    closeContextual={closeContextual}
                    lessonPopup={lessonPopup}
                    handleSelect={handleSelect}
                    isSelected={vocabTagSelected === vocab.id}
                  />
                ))}
              </div>
            </div>
          )}
        <div className="moreInfoSide">
          <div className="labelsSection">
            {exampleWithVocabulary.spanglish && (
              <div className="label spanglish">spanglish</div>
            )}
            {exampleWithVocabulary.spanishAudio && (
              <div className="label audio">audio flashcard</div>
            )}
          </div>
        </div>
      </div>
    )
  );
}
