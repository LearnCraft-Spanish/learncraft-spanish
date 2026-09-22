import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { JSX } from 'react';
import {
  courseOptions,
  fromLessonOptions,
  toLessonOptions,
} from '@domain/functions/lessonOptions';
import { Card } from '@interface/components/general/Card/Card';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Field } from '@interface/components/general/Field/Field';
import { Icon } from '@interface/components/general/Icon/Icon';
import { useDismissable } from '@interface/components/general/Popover/useDismissable';
import { Select } from '@interface/components/general/Select/Select';
import { Toggle } from '@interface/components/general/Toggle/Toggle';
import { useState } from 'react';
import styles from './CourseCard.module.scss';

export interface CourseCardProps {
  exampleFilter: UseCombinedFiltersReturnType;
  fromLessonText: string;
}

/**
 * Course and lesson range. The course itself and the start of the range are
 * read-only here and edited in the advanced panel, because a learner changes
 * the end of the range far more often than the start.
 */
export function CourseCard({
  exampleFilter,
  fromLessonText,
}: CourseCardProps): JSX.Element {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { containerRef } = useDismissable(advancedOpen, () =>
    setAdvancedOpen(false),
  );

  const {
    course,
    courseId,
    coursesWithLessons,
    fromLessonNumber,
    toLessonNumber,
    updateUserSelectedCourseId,
    updateFromLessonNumber,
    updateToLessonNumber,
    includeUnpublished,
    updateIncludeUnpublished,
    isAdmin,
  } = exampleFilter;

  return (
    <div className={styles.anchor} ref={containerRef}>
      <Card clip={false}>
        <div className={styles.body}>
          <div className={styles.scope}>
            <div className={styles.identity}>
              <Eyebrow as="h2">Course</Eyebrow>
              <div className={styles.courseName}>{course?.name ?? ''}</div>
              <div className={styles.fromLesson}>{fromLessonText}</div>
            </div>
            <div className={styles.rangeControl}>
              <Field htmlFor="custom-quiz-to-lesson" label="Up to lesson">
                <Select
                  id="custom-quiz-to-lesson"
                  value={toLessonNumber !== null ? String(toLessonNumber) : ''}
                  options={toLessonOptions(course, fromLessonNumber)}
                  onChange={(value) =>
                    updateToLessonNumber(Number.parseInt(value, 10))
                  }
                  emphasis
                />
              </Field>
            </div>
          </div>

          <button
            type="button"
            className={styles.advancedToggle}
            aria-expanded={advancedOpen}
            aria-controls="custom-quiz-advanced"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            Advanced settings
            <Icon name={advancedOpen ? 'chevronUp' : 'chevronDown'} />
          </button>
        </div>
      </Card>

      {advancedOpen && (
        <div className={styles.panel} id="custom-quiz-advanced">
          <Field htmlFor="custom-quiz-course" label="Course">
            <Select
              id="custom-quiz-course"
              value={courseId !== null ? String(courseId) : ''}
              options={courseOptions(coursesWithLessons, course)}
              onChange={(value) =>
                updateUserSelectedCourseId(Number.parseInt(value, 10))
              }
            />
          </Field>
          <Field htmlFor="custom-quiz-from-lesson" label="From lesson">
            <Select
              id="custom-quiz-from-lesson"
              value={fromLessonNumber !== null ? String(fromLessonNumber) : ''}
              options={fromLessonOptions(course, toLessonNumber)}
              onChange={(value) =>
                updateFromLessonNumber(Number.parseInt(value, 10))
              }
            />
          </Field>
          {isAdmin === true && (
            <Toggle
              id="custom-quiz-unpublished"
              checked={includeUnpublished}
              onChange={updateIncludeUnpublished}
              label="Include unpublished lessons"
            />
          )}
        </div>
      )}
    </div>
  );
}
