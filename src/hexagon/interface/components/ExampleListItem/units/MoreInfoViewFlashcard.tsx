import type { Flashcard } from '@learncraft-spanish/shared';
import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';
import { useState } from 'react';
import VocabTagContainer from '../../VocabTagDetails';

export default function MoreInfoViewFlashcard({
  flashcard,
  isCustom,
  isOpen,
  openContextual,
  contextual,
  setContextualRef,
  lessonPopup,
}: {
  flashcard: Flashcard;
  isCustom: boolean;
  isOpen: boolean;
  openContextual: (contextual: string) => void;
  contextual: string;
  setContextualRef: (ref: HTMLDivElement | null) => void;
  lessonPopup: LessonPopup;
}) {
  const [vocabTagSelected, setVocabTagSelected] = useState<number | null>(null);
  const handleSelect = (id: number) => {
    setVocabTagSelected(id);
  };
  const dateAddedFormatted = flashcard.dateCreated
    ? new Date(flashcard.dateCreated).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : 'unknown';
  const nextReviewFormatted = flashcard.nextReview
    ? new Date(flashcard.nextReview).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : 'Today';

  const lastReviewedFormatted = flashcard.lastReviewed
    ? new Date(flashcard.lastReviewed).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : 'Never';
  return (
    <div className={`moreInfoView ${isOpen ? 'open' : 'closed'}`}>
      <div className="vocabTagsSide">
        <div className="vocabTagsHeader">
          <h3>Vocabulary</h3>
          <div className="labelsSection">
            {flashcard.example.spanglish && (
              <div className="label spanglish">spanglish</div>
            )}
            {flashcard.example.spanishAudio && (
              <div className="label audio">audio flashcard</div>
            )}
            {isCustom && <div className="label custom">custom flashcard</div>}
          </div>
        </div>
        <div className="vocabTagsList">
          {flashcard.example.vocabulary.map((vocab) => (
            <VocabTagContainer
              key={vocab.id}
              exampleId={flashcard.example.id}
              vocabulary={vocab}
              openContextual={openContextual}
              contextual={contextual}
              setContextualRef={setContextualRef}
              lessonPopup={lessonPopup}
              handleSelect={handleSelect}
              isSelected={vocabTagSelected === vocab.id}
            />
          ))}
        </div>
      </div>
      <div className="moreInfoSide">
        <div className="datesSection">
          <div className="lineWrapper">
            <div className="label">Added on:</div>
            <div className="content">{dateAddedFormatted}</div>
          </div>
          <div className="lineWrapper">
            <div className="label">Last Reviewed:</div>
            <div className="content">{lastReviewedFormatted}</div>
          </div>
          <div className="lineWrapper">
            <div className="label">Next SRS Review:</div>
            <div className="content">{nextReviewFormatted}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
