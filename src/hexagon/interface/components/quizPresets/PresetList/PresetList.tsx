import type { PreSetQuiz } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import type { JSX } from 'react';
import {
  PreSetQuizPreset,
  preSetQuizzes,
} from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './PresetList.module.scss';

export interface PresetListProps {
  filterPreset: PreSetQuizPreset;
  setFilterPreset: (preset: PreSetQuizPreset) => void;
  /** Copy above the list. Omit where the surrounding card already explains it. */
  hint?: string;
}

export function tagCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'tag' : 'tags'}`;
}

function visiblePresets(): PreSetQuiz[] {
  return preSetQuizzes.filter((quiz) => quiz.preset !== PreSetQuizPreset.None);
}

/**
 * Saved tag groups, one click each. Shared by the Flashcard Finder filter
 * card and custom quiz setup so the preset treatment has one definition.
 */
export function PresetList({
  filterPreset,
  setFilterPreset,
  hint,
}: PresetListProps): JSX.Element {
  return (
    <>
      {hint !== undefined && <p className={styles.hint}>{hint}</p>}
      <div className={styles.list}>
        {visiblePresets().map((quiz) => {
          const selected = filterPreset === quiz.preset;
          return (
            <button
              key={quiz.preset}
              type="button"
              className={
                selected ? `${styles.preset} ${styles.presetOn}` : styles.preset
              }
              aria-pressed={selected}
              onClick={() =>
                setFilterPreset(selected ? PreSetQuizPreset.None : quiz.preset)
              }
            >
              <Icon
                name="bookmark"
                size="inline"
                tone={selected ? 'onAction' : 'muted'}
              />
              {quiz.preset}
              <span className={styles.count}>
                {tagCountLabel(quiz.SkillTagKeys.length)}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
