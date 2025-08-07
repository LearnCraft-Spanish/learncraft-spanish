import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { Fragment } from 'react';

export default function MoreInfoViewFlashcard({
  example,
  isCustom,
  isOpen,
  openContextual,
  currentContextual,
  setContextualRef,
}: {
  example: ExampleWithVocabulary;
  isCustom: boolean;
  isOpen: boolean;
  openContextual: (contextual: string) => void;
  currentContextual: string;
  setContextualRef: (ref: HTMLDivElement | null) => void;
}) {
  return (
    <div className={`moreInfoView ${isOpen ? 'open' : 'closed'}`}>
      <div className="vocabTagsSide">
        <h3>Vocabulary</h3>
        <div className="vocabTagsList">
          {example.vocabulary.map((vocab) => (
            <Fragment key={vocab.id}>
              <div
                className="vocabTag"
                key={vocab.id}
                onClick={() => {
                  openContextual(`vocabInfo-${vocab.id}`);
                }}
              >
                {vocab.word}
              </div>
              {currentContextual === `vocabInfo-${vocab.id}` && (
                <div className="vocabInfo" ref={setContextualRef}>
                  <div className="vocabInfoHeader">
                    <h4>{vocab.word}</h4>
                    <p>{vocab.descriptor}</p>
                  </div>
                  {vocab.type !== 'verb' ? (
                    <div className="nonVerbInfo">
                      <p>Part of Speech: {vocab.subcategory.partOfSpeech}</p>
                      <p>Category: {vocab.subcategory.category}</p>
                    </div>
                  ) : (
                    <div className="verbInfo">
                      <p>Part of Speech: {vocab.subcategory.partOfSpeech}</p>
                      <p>Verb Infinitive: {vocab.verb.infinitive}</p>
                      <p>
                        Conjugation Notes: {vocab.conjugationTags.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Fragment>
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
