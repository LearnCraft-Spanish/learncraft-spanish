import type {
  ExampleWithVocabulary,
  Flashcard,
  Lesson,
} from '@learncraft-spanish/shared';
import VocabTagContainer from './VocabTagContainer';

export default function MoreInfoViewExample({
  example,
  isOpen,
  openContextual,
  contextual,
  setContextualRef,
  lessonsByVocabulary,
  lessonsLoading,
}: {
  example: ExampleWithVocabulary | Flashcard;
  isOpen: boolean;
  openContextual: (contextual: string) => void;
  contextual: string;
  setContextualRef: (ref: HTMLDivElement | null) => void;
  lessonsByVocabulary: Lesson[];
  lessonsLoading: boolean;
}) {
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
                    vocabulary={vocab}
                    openContextual={openContextual}
                    contextual={contextual}
                    setContextualRef={setContextualRef}
                    lessonsLoading={lessonsLoading}
                    lessons={lessonsByVocabulary}
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
