import type { Vocabulary } from '@learncraft-spanish/shared';
import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';
import './VocabTagContainer.scss';

export default function VocabTagContainer({
  exampleId,
  vocabulary,
  openContextual,
  contextual,
  setContextualRef,
  lessonPopup,
}: {
  exampleId: number;
  vocabulary: Vocabulary;
  openContextual: (contextual: string) => void;
  contextual: string;
  setContextualRef: (ref: HTMLDivElement | null) => void;
  lessonPopup: LessonPopup;
}) {
  return (
    <div className="vocabTagContainer" key={vocabulary.id}>
      <div
        className="vocabTag"
        onClick={() => {
          openContextual(`vocabInfo-${exampleId}-${vocabulary.id}`);
        }}
      >
        {vocabulary.word}
      </div>
      {contextual === `vocabInfo-${exampleId}-${vocabulary.id}` && (
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
            {lessonPopup.lessonsLoading ? (
              <div>Loading lessons...</div>
            ) : lessonPopup.lessonsByVocabulary.length > 0 ? (
              lessonPopup.lessonsByVocabulary.map((lesson) => (
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
