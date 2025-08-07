import type { Lesson, Vocabulary } from '@learncraft-spanish/shared';

export default function VocabTagContainer({
  vocabulary,
  openContextual,
  contextual,
  setContextualRef,
  lessonsLoading,
  lessons,
}: {
  vocabulary: Vocabulary;
  openContextual: (contextual: string) => void;
  contextual: string;
  setContextualRef: (ref: HTMLDivElement | null) => void;
  lessonsLoading: boolean;
  lessons: Lesson[];
}) {
  return (
    <div className="vocabTagContainer" key={vocabulary.id}>
      <div
        className="vocabTag"
        onClick={() => {
          openContextual(`vocabInfo-${vocabulary.id}`);
        }}
      >
        {vocabulary.word}
      </div>
      {contextual === `vocabInfo-${vocabulary.id}` && (
        <div className="vocabInfo" ref={setContextualRef}>
          <div className="vocabInfoHeader">
            <h4>{vocabulary.word}</h4>
            <p>{vocabulary.descriptor}</p>
          </div>
          {vocabulary.type !== 'verb' ? (
            <div className="nonVerbInfo">
              <p>Part of Speech: {vocabulary.subcategory.partOfSpeech}</p>
              <p>Category: {vocabulary.subcategory.category}</p>
            </div>
          ) : (
            <div className="verbInfo">
              <p>Part of Speech: {vocabulary.subcategory.partOfSpeech}</p>
              <p>Verb Infinitive: {vocabulary.verb.infinitive}</p>
              <p>Conjugation Notes: {vocabulary.conjugationTags.join(', ')}</p>
            </div>
          )}
          <div className="lessonsList">
            <h4>Taught in:</h4>
            {lessonsLoading ? (
              <div>Loading lessons...</div>
            ) : lessons.length > 0 ? (
              lessons.map((lesson) => (
                <div key={lesson.id}>
                  {lesson.courseName} lesson {lesson.lessonNumber}
                </div>
              ))
            ) : (
              <div>No lessons found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
