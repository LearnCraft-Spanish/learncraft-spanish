import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './StudentContextBar.module.scss';

export interface StudentContextBarProps {
  flashcardsQuery: UseStudentFlashcardsReturn;
  exampleFilter: UseCombinedFiltersReturnType;
  studentDisplayName?: string | null;
}

function ownedFlashcardsLabel(count: number): string {
  return count === 1 ? '1 flashcard' : `${count} flashcards`;
}

function throughLessonLabel(toLessonNumber: number | null): string | null {
  if (toLessonNumber === null) {
    return null;
  }

  return `Lesson ${toLessonNumber}`;
}

function studentLine(
  name: string | null | undefined,
  lesson: string | null,
): string {
  if (name && lesson) {
    return `${name} · ${lesson}`;
  }
  if (name) {
    return name;
  }
  if (lesson) {
    return lesson;
  }
  return '\u00A0';
}

export function StudentContextBar({
  flashcardsQuery,
  exampleFilter,
  studentDisplayName,
}: StudentContextBarProps): JSX.Element {
  const count = flashcardsQuery.flashcards?.length ?? 0;
  const throughLesson = throughLessonLabel(exampleFilter.toLessonNumber);
  const nameLine = studentLine(studentDisplayName, throughLesson);

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.student}>
          <Icon name="user" size="md" tone="action" />
          <div className={styles.meta}>
            <Eyebrow weight="regular" leading="body">
              Building for
            </Eyebrow>
            <p className={styles.value}>{nameLine}</p>
          </div>
        </div>
        <div className={styles.owned}>
          <div className={styles.ownedMeta}>
            <Eyebrow weight="regular" leading="body">
              Owned flashcards
            </Eyebrow>
            <p className={styles.value}>{ownedFlashcardsLabel(count)}</p>
          </div>
          <Button variant="secondary" tone="onDark" size="sm">
            Change student
          </Button>
        </div>
      </div>
    </div>
  );
}
