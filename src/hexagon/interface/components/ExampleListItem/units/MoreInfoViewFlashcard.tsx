import type { ExampleWithVocabulary, Lesson } from '@learncraft-spanish/shared';
import VocabTagContainer from './VocabTagContainer';

export default function MoreInfoViewFlashcard({
  example,
  isCustom,
  isOpen,
  openContextual,
  contextual,
  setContextualRef,
  lessonsByVocabulary,
  lessonsLoading,
}: {
  example: ExampleWithVocabulary;
  isCustom: boolean;
  isOpen: boolean;
  openContextual: (contextual: string) => void;
  contextual: string;
  setContextualRef: (ref: HTMLDivElement | null) => void;
  lessonsByVocabulary: Lesson[];
  lessonsLoading: boolean;
}) {
  return (
    <div className={`moreInfoView ${isOpen ? 'open' : 'closed'}`}>
      <div className="vocabTagsSide">
        <h3>Vocabulary</h3>
        <div className="vocabTagsList">
          {example.vocabulary.map((vocab) => (
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
      <div className="moreInfoSide">
        <div className="labelsSection">
          {example.spanglish && (
            <div className="label spanglish">spanglish</div>
          )}
          {example.spanishAudio && (
            <div className="label audio">audio flashcard</div>
          )}
          {isCustom && <div className="label custom">custom flashcard</div>}
        </div>
        {/* <div className="datesSection">
          <div className="lineWrapper">
            <div className="label">Added on:</div>
            <div className="content">{example.createdAt}</div>
          </div>
          <div className="lineWrapper">
            <div className="label">Next SRS Review:</div>
            <div className="content">{example.nextReviewDate}</div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
