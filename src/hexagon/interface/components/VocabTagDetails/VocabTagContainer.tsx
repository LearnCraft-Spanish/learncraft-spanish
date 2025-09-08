import type { Vocabulary } from '@learncraft-spanish/shared';
import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';
import { useSelectedCourseAndLessons } from 'src/hexagon/application/coordinators/hooks/useSelectedCourseAndLessons';
import { InlineLoading } from '../Loading';
import './VocabTagContainer.scss';
export default function VocabTagContainer({
  exampleId,
  vocabulary,
  openContextual,
  contextual,
  setContextualRef,
  lessonPopup,
  handleSelect,
  isSelected,
}: {
  exampleId: number;
  vocabulary: Vocabulary;
  openContextual: (contextual: string) => void;
  contextual: string;
  setContextualRef: (ref: HTMLDivElement | null) => void;
  lessonPopup: LessonPopup;
  handleSelect: (id: number | null) => void;
  isSelected: boolean;
}) {
  const { course } = useSelectedCourseAndLessons();

  return (
    <div className="vocabTagContainer" key={vocabulary.id}>
      <div
        className={`vocabTag ${
          isSelected && contextual === `vocabInfo-${exampleId}-${vocabulary.id}`
            ? 'selected'
            : ''
        }`}
        onClick={(e) => {
          e.stopPropagation();
          // if its selected, close contextual and set selected to null
          if (isSelected) {
            setContextualRef(null);
            handleSelect(null);
            return;
          }
          openContextual(`vocabInfo-${exampleId}-${vocabulary.id}`);
          handleSelect(vocabulary.id);
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
              <InlineLoading message="Loading lessons..." white />
            ) : lessonPopup.lessonsByVocabulary.length > 0 ? (
              lessonPopup.lessonsByVocabulary
                .sort((a, b) => {
                  if (a.courseName === course?.name) {
                    return -1;
                  } else if (b.courseName === course?.name) {
                    return 1;
                  }
                  return 0;
                })
                .map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`lessonItem ${
                      lesson.courseName === course?.name ? 'mainCourse' : ''
                    }`}
                  >
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
