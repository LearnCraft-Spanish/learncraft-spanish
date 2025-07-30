import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { AudioControl } from '../../general';

export default function MoreInfoViewExample({
  example,
  isOpen,
}: {
  example: ExampleWithVocabulary;
  isOpen: boolean;
}) {
  return (
    isOpen && (
      <div className={`moreInfoView ${isOpen ? 'open' : 'closed'}`}>
        <div className="vocabTagsSide">
          <h3>Vocab Tags</h3>
          {/* This should be a list of Skill Tag display objects, not just strings */}
          <div className="vocabTagsList">
            {example.vocabulary.map((vocab) => (
              <div className="vocabTag" key={vocab.id}>
                {vocab.word}
              </div>
            ))}
          </div>
        </div>
        <div className="moreInfoSide">
          {example.spanishAudio && (
            <div className="audioWrapper">
              <div className="audioLabel">Spanish Audio</div>
              <AudioControl audioLink={example.spanishAudio} />
            </div>
          )}
          {example.englishAudio && (
            <div className="audioWrapper">
              <div className="audioLabel">English Audio</div>
              <AudioControl audioLink={example.englishAudio} />
            </div>
          )}
        </div>
        <div className="moreInfoSide">
          <div className="labelsSection">
            {example.spanglish && (
              <div className="label spanglish">spanglish</div>
            )}
            {example.spanishAudio && (
              <div className="label audio">audio flashcard</div>
            )}
          </div>
        </div>
      </div>
    )
  );
}
