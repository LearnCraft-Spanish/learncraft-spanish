import type { ExampleRecord } from '@LearnCraft-Spanish/shared';

export default function MoreInfoViewExample({
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
        </div>
      </div>
    </div>
  );
}
