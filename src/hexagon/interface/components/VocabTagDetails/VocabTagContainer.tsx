import type { LessonPopup } from '@application/units/useLessonPopup';
import type { Vocabulary } from '@learncraft-spanish/shared';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { InlineLoading } from '@interface/components/Loading';

import { useEffect, useRef, useState } from 'react';
import './VocabTagContainer.scss';

export default function VocabTagContainer({
  exampleId,
  vocabulary,
  openContextual,
  contextual,
  closeContextual,
  lessonPopup,
  handleSelect,
  isSelected,
  removeButton,
}: {
  exampleId: number;
  vocabulary: Vocabulary;
  openContextual: (contextual: string) => void;
  contextual: string;
  closeContextual: () => void;
  lessonPopup: LessonPopup;
  handleSelect: (id: number | null) => void;
  isSelected: boolean;
  removeButton?: React.ReactNode;
}) {
  const { course } = useSelectedCourseAndLessons();
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPosition, setPopupPosition] = useState<{
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right' | 'center';
  }>({ vertical: 'top', horizontal: 'center' });
  const [isPositionCalculated, setIsPositionCalculated] = useState(false);

  // Function to detect overflow and adjust positioning
  const adjustPopupPosition = () => {
    if (!containerRef.current || !popupRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let vertical: 'top' | 'bottom' = 'top';
    let horizontal: 'left' | 'right' | 'center' = 'center';

    // Check vertical overflow (top/bottom)
    const spaceAbove = containerRect.top;
    const spaceBelow = viewportHeight - containerRect.bottom;
    const popupHeight = popupRect.height;

    if (spaceAbove < popupHeight && spaceBelow > spaceAbove) {
      vertical = 'bottom';
    }

    // Check horizontal overflow (left/right)
    const spaceLeft = containerRect.left;
    const spaceRight = viewportWidth - containerRect.right;
    const popupWidth = popupRect.width;

    // Calculate if popup would overflow when centered
    const centerOverflowLeft = spaceLeft < popupWidth / 2;
    const centerOverflowRight = spaceRight < popupWidth / 2;

    if (centerOverflowLeft && centerOverflowRight) {
      // Not enough space on either side, choose the side with more space
      if (spaceLeft > spaceRight) {
        horizontal = 'left';
      } else {
        horizontal = 'right';
      }
    } else if (centerOverflowLeft) {
      // Would overflow left when centered, check if right positioning works
      if (spaceRight >= popupWidth) {
        horizontal = 'left';
      } else {
        // Even right positioning would overflow, use left with max-width constraint
        horizontal = 'right';
      }
    } else if (centerOverflowRight) {
      // Would overflow right when centered, check if left positioning works
      if (spaceLeft >= popupWidth) {
        horizontal = 'right';
      } else {
        // Even left positioning would overflow, use right with max-width constraint
        horizontal = 'left';
      }
    } else {
      // Enough space on both sides, center it
      horizontal = 'center';
    }

    setPopupPosition({ vertical, horizontal });
    setIsPositionCalculated(true);
  };

  // Reset positioning state when popup opens/closes
  useEffect(() => {
    setIsPositionCalculated(false);
  }, [isSelected, contextual, exampleId, vocabulary.id]);

  // Adjust position when popup becomes visible
  useEffect(() => {
    if (
      isSelected &&
      contextual === `vocabInfo-${exampleId}-${vocabulary.id}`
    ) {
      // Small delay to ensure popup is rendered
      const timeoutId = setTimeout(adjustPopupPosition, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [isSelected, contextual, exampleId, vocabulary.id]);

  // Handle window resize to recalculate position
  useEffect(() => {
    const handleResize = () => {
      if (
        isSelected &&
        contextual === `vocabInfo-${exampleId}-${vocabulary.id}`
      ) {
        adjustPopupPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSelected, contextual, exampleId, vocabulary.id]);

  return (
    <div className="vocabTagContainer" key={vocabulary.id} ref={containerRef}>
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
            closeContextual();
            handleSelect(null);
          } else {
            openContextual(`vocabInfo-${exampleId}-${vocabulary.id}`);
            handleSelect(vocabulary.id);
          }
        }}
      >
        {vocabulary.word}
        {removeButton}
      </div>
      {contextual === `vocabInfo-${exampleId}-${vocabulary.id}` && (
        <div
          className={`vocabInfo ${popupPosition.vertical} ${popupPosition.horizontal} ${!isPositionCalculated ? 'positioning' : ''}`}
          ref={popupRef}
        >
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
