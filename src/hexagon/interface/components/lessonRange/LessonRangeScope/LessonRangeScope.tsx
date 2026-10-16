import type { CourseWithLessons } from '@learncraft-spanish/shared';
import type { JSX, KeyboardEvent } from 'react';
import {
  courseOptions,
  fromLessonOptions,
  toLessonOptions,
} from '@domain/functions/lessonOptions';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Combobox } from '@interface/components/general/Combobox/Combobox';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Field } from '@interface/components/general/Field/Field';
import { Select } from '@interface/components/general/Select/Select';
import { useEffect, useRef, useState } from 'react';
import styles from './LessonRangeScope.module.scss';

export interface LessonRangeScopeProps {
  /** Prefix for control ids so two instances on one page stay unique. */
  idPrefix: string;
  course: CourseWithLessons | null;
  coursesWithLessons: CourseWithLessons[] | null | undefined;
  fromLessonNumber: number | null;
  toLessonNumber: number | null;
  onCourseChange: (courseId: number) => void;
  onFromLessonChange: (lessonNumber: number) => void;
  onToLessonChange: (lessonNumber: number) => void;
}

const NO_COURSE_OPTION = { value: '', label: 'Choose a course' };

/**
 * Course and lesson range as one control. The course reads as identity with
 * a "Change course" action beside it that reveals a plain dropdown; both
 * ends of the range stay on the surface as searchable pickers. Range rules
 * (from ≤ to, prerequisite pseudo-lessons) come from the domain option
 * helpers, so every surface that mounts this lists the same lessons.
 */
export function LessonRangeScope({
  idPrefix,
  course,
  coursesWithLessons,
  fromLessonNumber,
  toLessonNumber,
  onCourseChange,
  onFromLessonChange,
  onToLessonChange,
}: LessonRangeScopeProps): JSX.Element {
  const [changingCourse, setChangingCourse] = useState(false);
  const courseRowRef = useRef<HTMLDivElement>(null);
  const wasChangingCourse = useRef(false);

  const courseId = `${idPrefix}-course`;
  const fromId = `${idPrefix}-from-lesson`;
  const toId = `${idPrefix}-to-lesson`;

  const listedCourses = courseOptions(coursesWithLessons, course);
  const pickerOptions =
    course === null ? [NO_COURSE_OPTION, ...listedCourses] : listedCourses;

  /* The row swaps its contents, so move focus with it: into the dropdown
   * when it opens, back onto "Change course" when it closes. */
  useEffect(() => {
    if (changingCourse) {
      courseRowRef.current?.querySelector('select')?.focus();
    } else if (wasChangingCourse.current) {
      courseRowRef.current?.querySelector('button')?.focus();
    }
    wasChangingCourse.current = changingCourse;
  }, [changingCourse]);

  /* The placeholder is only listed while the value is already '', so the
   * dropdown never reports it. */
  function chooseCourse(value: string): void {
    onCourseChange(Number.parseInt(value, 10));
    setChangingCourse(false);
  }

  function cancelOnEscape(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape' && course !== null) {
      setChangingCourse(false);
    }
  }

  return (
    <div className={styles.root}>
      {/* No course yet means there is nothing to show as identity: go
          straight to the picker, with no Cancel to fall back to. */}
      {course === null || changingCourse ? (
        <div
          ref={courseRowRef}
          className={styles.courseRow}
          onKeyDown={cancelOnEscape}
        >
          <div className={styles.courseField}>
            <Field htmlFor={courseId} label="Course">
              <Select
                id={courseId}
                value={course !== null ? String(course.id) : ''}
                options={pickerOptions}
                onChange={chooseCourse}
              />
            </Field>
          </div>
          {course !== null && (
            <span className={`${styles.inlineAction} ${styles.pickerAction}`}>
              <Button
                variant="ghost"
                size="inline"
                muted
                onClick={() => setChangingCourse(false)}
              >
                Cancel
              </Button>
            </span>
          )}
        </div>
      ) : (
        <div ref={courseRowRef} className={styles.courseRow}>
          <div className={styles.identity}>
            <Eyebrow>Course</Eyebrow>
            <div className={styles.courseName}>{course.name}</div>
          </div>
          <span className={styles.inlineAction}>
            <Button
              variant="ghost"
              size="inline"
              onClick={() => setChangingCourse(true)}
            >
              Change course
            </Button>
          </span>
        </div>
      )}

      <div className={styles.range}>
        <Field htmlFor={fromId} label="From lesson">
          <Combobox
            id={fromId}
            value={fromLessonNumber !== null ? String(fromLessonNumber) : ''}
            options={fromLessonOptions(course, toLessonNumber)}
            onChange={(value) => onFromLessonChange(Number.parseInt(value, 10))}
            placeholder="Search lessons"
            emptyLabel="No lessons match"
            disabled={course === null}
          />
        </Field>
        <Field htmlFor={toId} label="Up to lesson">
          <Combobox
            id={toId}
            value={toLessonNumber !== null ? String(toLessonNumber) : ''}
            options={toLessonOptions(course, fromLessonNumber)}
            onChange={(value) => onToLessonChange(Number.parseInt(value, 10))}
            placeholder="Search lessons"
            emptyLabel="No lessons match"
            disabled={course === null}
            emphasis
          />
        </Field>
      </div>
    </div>
  );
}
