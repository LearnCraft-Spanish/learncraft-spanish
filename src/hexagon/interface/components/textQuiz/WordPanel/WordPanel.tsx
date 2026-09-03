import type { VocabInfo } from '@application/units/useVocabInfo';
import type { Vocabulary } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { sortLessonsByCurrentCourse } from '@domain/functions/sortLessonsByCurrentCourse';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Icon } from '@interface/components/general/Icon/Icon';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import styles from './WordPanel.module.scss';

interface WordPanelProps {
  vocabulary: Vocabulary;
  /** `useVocabInfo` in production. A real hook — see the component note. */
  vocabInfoHook: (vocab: Vocabulary) => VocabInfo;
  /** Renders an X in the top-right corner. Desktop only — the mobile
   * `WordPanelModal` supplies its own close button. */
  onClose?: () => void;
}

/**
 * Deep Navy detail card for one selected vocabulary chip. `vocabInfoHook` is
 * a React hook in production, so this component must only ever be mounted
 * while a word is selected, and keyed by vocabulary id so a new selection
 * remounts it rather than re-running the hook with a stale id mid-render.
 */
export function WordPanel({
  vocabulary,
  vocabInfoHook,
  onClose,
}: WordPanelProps): JSX.Element {
  const info = vocabInfoHook(vocabulary);
  // No course context is available on this prop contract, so lessons sort
  // alphabetically-then-by-number rather than surfacing the learner's course
  // first. See the deviations note in the implementation report.
  const lessons = sortLessonsByCurrentCourse(info.lessons ?? [], null);

  return (
    <div className={styles.root}>
      {onClose && (
        <div className={styles.close}>
          <IconButton
            icon="x"
            label="Close word details"
            size="sm"
            tone="onDark"
            onClick={onClose}
          />
        </div>
      )}
      <p className={styles.word}>{info.word}</p>
      <p className={styles.gloss}>{info.descriptor}</p>
      <p className={styles.meta}>
        <strong>{info.subcategory.partOfSpeech}</strong>
        {' · '}
        {info.subcategory.category}
      </p>

      <div className={styles.divider} />

      <Eyebrow as="h3">Taught in</Eyebrow>

      {info.lessonsLoading ? (
        <p className={styles.loading}>Loading lessons…</p>
      ) : lessons.length === 0 ? (
        <p className={styles.loading}>No lessons found.</p>
      ) : (
        <ul className={styles.lessons}>
          {lessons.map((lesson) => (
            <li className={styles.lessonRow} key={lesson.id}>
              <span>
                {lesson.courseName} lesson {lesson.lessonNumber}
              </span>
              <Icon name="chevronRight" tone="onDark" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
