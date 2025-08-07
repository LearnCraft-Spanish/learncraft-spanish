import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';

export default function MoreInfoViewExample({
  example,
  isOpen,
  openContextual,
  contextual,
  setContextualRef,
}: {
  example: ExampleWithVocabulary | Flashcard;
  isOpen: boolean;
  openContextual: (contextual: string) => void;
  contextual: string;
  setContextualRef: (ref: HTMLDivElement | null) => void;
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
                  <div className="vocabTagContainer" key={vocab.id}>
                    <div
                      className="vocabTag"
                      onClick={() => {
                        openContextual(`vocabInfo-${vocab.id}`);
                      }}
                    >
                      {vocab.word}
                    </div>
                    {contextual === `vocabInfo-${vocab.id}` && (
                      <div className="vocabInfo" ref={setContextualRef}>
                        <div className="vocabInfoHeader">
                          <h4>{vocab.word}</h4>
                          <p>{vocab.descriptor}</p>
                        </div>
                        {vocab.type !== 'verb' ? (
                          <div className="nonVerbInfo">
                            <p>
                              Part of Speech: {vocab.subcategory.partOfSpeech}
                            </p>
                            <p>Category: {vocab.subcategory.category}</p>
                          </div>
                        ) : (
                          <div className="verbInfo">
                            <p>
                              Part of Speech: {vocab.subcategory.partOfSpeech}
                            </p>
                            <p>Verb Infinitive: {vocab.verb.infinitive}</p>
                            <p>
                              Conjugation Notes:{' '}
                              {vocab.conjugationTags.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
