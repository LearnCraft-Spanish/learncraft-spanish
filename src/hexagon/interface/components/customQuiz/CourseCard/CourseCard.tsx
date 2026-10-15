import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { JSX } from 'react';
import { Badge } from '@interface/components/general/Badge/Badge';
import { Card } from '@interface/components/general/Card/Card';
import { Toggle } from '@interface/components/general/Toggle/Toggle';
import { LessonRangeScope } from '@interface/components/lessonRange/LessonRangeScope/LessonRangeScope';
import styles from './CourseCard.module.scss';

export interface CourseCardProps {
  exampleFilter: UseCombinedFiltersReturnType;
}

/**
 * Course and lesson range for the custom quiz. Both ends of the range sit on
 * the card; changing course is a secondary action inside the shared scope
 * control, the same one the Finder and Manager filters use.
 */
export function CourseCard({ exampleFilter }: CourseCardProps): JSX.Element {
  const {
    course,
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
    <Card clip={false}>
      <div className={styles.body}>
        <LessonRangeScope
          idPrefix="custom-quiz"
          course={course}
          coursesWithLessons={coursesWithLessons}
          fromLessonNumber={fromLessonNumber}
          toLessonNumber={toLessonNumber}
          onCourseChange={updateUserSelectedCourseId}
          onFromLessonChange={updateFromLessonNumber}
          onToLessonChange={updateToLessonNumber}
        />
      </div>
      {isAdmin === true && (
        <div className={styles.adminStrip}>
          <Badge>Admin only</Badge>
          <Toggle
            id="custom-quiz-unpublished"
            checked={includeUnpublished}
            onChange={updateIncludeUnpublished}
            label="Include unpublished lessons"
          />
        </div>
      )}
    </Card>
  );
}
