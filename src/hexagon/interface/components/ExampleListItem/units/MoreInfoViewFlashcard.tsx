import type { ExampleRecord } from '@LearnCraft-Spanish/shared';

export default function MoreInfoViewFlashcard({
  example,
  isOpen,
}: {
  example: ExampleRecord;
  isOpen: boolean;
}) {
  return (
    <div className={`moreInfoView ${isOpen ? 'open' : 'closed'}`}>
      <div className="vocabTagsSide">
        <h3>Vocab Tags</h3>
        <div className="vocabTagsList">
          {example.vocabIncluded?.map((tag) => (
            <div className="vocabTag" key={tag}>
              {tag}
            </div>
          ))}
        </div>
      </div>
      <div className="moreInfoSide">
        <div className="labelsSection">
          {example.spanglish === 'spanglish' && (
            <div className="label spanglish">spanglish</div>
          )}
          {example.spanishAudioLa && (
            <div className="label audio">audio flashcard</div>
          )}
          {example.custom && (
            <div className="label custom">custom flashcard</div>
          )}
        </div>
        <div className="datesSection">
          <div className="lineWrapper">
            <div className="label">Added on:</div>
            <div className="content">{example.createdAt}</div>
          </div>
          <div className="lineWrapper">
            <div className="label">Next SRS Review:</div>
            <div className="content">{example.nextReviewDate}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
