import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';

export default function MoreInfoViewFlashcard({
  example,
  isCustom,
  isOpen,
}: {
  example: ExampleWithVocabulary;
  isCustom: boolean;
  isOpen: boolean;
}) {
  return (
    <div className={`moreInfoView ${isOpen ? 'open' : 'closed'}`}>
      <div className="vocabTagsSide">
        <h3>Vocab Tags</h3>
        <div className="vocabTagsList">
          {example.vocabulary.map((vocab) => (
            <div className="vocabTag" key={vocab.id}>
              {vocab.word}
            </div>
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
