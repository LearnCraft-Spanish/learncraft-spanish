import type { CourseWithLessons } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { startFromLesson } from '@domain/functions/lessonOptions';
import { Card, CardSection } from '@interface/components/general/Card/Card';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { LessonRangeScope } from '@interface/components/lessonRange/LessonRangeScope/LessonRangeScope';
import {
  GallerySection,
  GallerySpecimen,
  GallerySpecimens,
} from '@interface/pages/UiGallery/GallerySection';
import { useState } from 'react';
import styles from './UiGallery.module.scss';

function course(
  id: number,
  name: string,
  lessonCount: number,
): CourseWithLessons {
  return {
    id,
    name,
    published: true,
    lessons: Array.from({ length: lessonCount }, (_, index) => ({
      id: id * 1000 + index + 1,
      courseName: name,
      lessonNumber: index + 1,
    })),
  };
}

/* Course 5 has a prerequisite, so its from-list opens with a virtual lesson. */
const COURSES: CourseWithLessons[] = [
  course(2, 'LearnCraft Spanish', 250),
  course(3, 'Spanish in One Month', 20),
  course(5, 'Post-Challenge Lessons', 36),
  course(7, 'Post-Podcast Lessons', 60),
];

interface ScopeDemoProps {
  idPrefix: string;
  /** `null` starts with no course, the first-visit state. */
  initialCourseId: number | null;
  initialTo: number | null;
}

/** Local state that mimics the coordinator: course change resets the range. */
function ScopeDemo({
  idPrefix,
  initialCourseId,
  initialTo,
}: ScopeDemoProps): JSX.Element {
  const [courseId, setCourseId] = useState<number | null>(initialCourseId);
  const selected = COURSES.find((item) => item.id === courseId) ?? null;
  const [from, setFrom] = useState<number | null>(
    startFromLesson(selected)?.lessonNumber ?? null,
  );
  const [to, setTo] = useState<number | null>(initialTo);

  return (
    <LessonRangeScope
      idPrefix={idPrefix}
      course={selected}
      coursesWithLessons={COURSES}
      fromLessonNumber={from}
      toLessonNumber={to}
      onCourseChange={(nextId) => {
        const next = COURSES.find((item) => item.id === nextId) ?? null;
        setCourseId(nextId);
        setFrom(startFromLesson(next)?.lessonNumber ?? null);
        setTo(next?.lessons.at(-1)?.lessonNumber ?? null);
      }}
      onFromLessonChange={setFrom}
      onToLessonChange={setTo}
    />
  );
}

export function LessonRangeSection(): JSX.Element {
  return (
    <GallerySection title="Lesson range scope">
      <p className={styles.note}>
        One control for every surface that scopes by course and lesson range.
        The course is an identity line with a text action that reveals a
        dropdown; both lesson ends are searchable comboboxes. Type a lesson
        number to narrow the list.
      </p>
      <GallerySpecimens>
        <GallerySpecimen label="filter section (Finder / Manager)">
          <div className={styles.scopeDemoWide}>
            <Card clip={false}>
              <div className={styles.scopeDemoHeader}>
                <Eyebrow as="h3" weight="regular" leading="body">
                  Scope · required
                </Eyebrow>
              </div>
              <CardSection>
                <ScopeDemo
                  idPrefix="g-finder"
                  initialCourseId={2}
                  initialTo={42}
                />
              </CardSection>
            </Card>
          </div>
        </GallerySpecimen>
        <GallerySpecimen label="quiz setup card (Custom Quiz)">
          <div className={styles.scopeDemoNarrow}>
            <Card clip={false}>
              <CardSection>
                <ScopeDemo
                  idPrefix="g-quiz"
                  initialCourseId={5}
                  initialTo={12}
                />
              </CardSection>
            </Card>
          </div>
        </GallerySpecimen>
        <GallerySpecimen label="no course yet (picker shown, range disabled)">
          <div className={styles.scopeDemoNarrow}>
            <Card clip={false}>
              <CardSection>
                <ScopeDemo
                  idPrefix="g-fresh"
                  initialCourseId={null}
                  initialTo={null}
                />
              </CardSection>
            </Card>
          </div>
        </GallerySpecimen>
      </GallerySpecimens>
    </GallerySection>
  );
}
