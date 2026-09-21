import type { OfficialQuizSetupMenuProps } from '@interface/pages/OfficialQuizzes/OfficialQuizSetupMenu';
import type { JSX } from 'react';
import {
  officialQuizSelectOptions,
  quizGroupSelectOptions,
} from '@domain/functions/officialQuizSetupOptions';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Card } from '@interface/components/general/Card/Card';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Field } from '@interface/components/general/Field/Field';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { Select } from '@interface/components/general/Select/Select';
import { useState } from 'react';
import styles from './OfficialQuizSetupMenuV2.module.scss';

const GROUP_SELECT_ID = 'official-quiz-group';

/**
 * The course/quiz-group row is read-only text plus a small "Change" button
 * on purpose: a learner picks their quiz group once and then works through
 * many quizzes inside it, so switching groups should take a deliberate tap
 * rather than sit beside the quiz picker as an equally-weighted control.
 */
export function OfficialQuizSetupMenuV2({
  selectedQuizGroup,
  setSelectedQuizGroup,
  quizNumber,
  setUserSelectedQuizNumber,
  quizOptions,
  quizGroups,
  startQuiz,
  onLeave,
}: OfficialQuizSetupMenuProps): JSX.Element {
  const [isEditingGroup, setIsEditingGroup] = useState(false);

  const quizIsSelectable = quizOptions.some(
    (quiz) => quiz.quizNumber === quizNumber,
  );

  const quizSelectOptions =
    quizNumber === 0
      ? [
          { value: '0', label: 'Select a quiz' },
          ...officialQuizSelectOptions(quizOptions),
        ]
      : officialQuizSelectOptions(quizOptions);

  return (
    <PageShell>
      <div className={styles.column}>
        <Eyebrow>Official quiz</Eyebrow>
        <h1 className={styles.title}>Choose a quiz</h1>

        <Card>
          <div className={styles.body}>
            <div className={styles.groupRow}>
              {isEditingGroup ? (
                <>
                  <div className={styles.groupField}>
                    {/*
                     * Not the `Field` primitive here: its label is styled
                     * for a regular form field, but this label has to
                     * match the static "Course" heading below exactly, so
                     * both share `.groupLabel` instead.
                     */}
                    <label
                      className={styles.groupLabel}
                      htmlFor={GROUP_SELECT_ID}
                    >
                      Course
                    </label>
                    <div className={styles.groupSelect}>
                      <Select
                        id={GROUP_SELECT_ID}
                        value={
                          selectedQuizGroup ? String(selectedQuizGroup.id) : ''
                        }
                        options={quizGroupSelectOptions(quizGroups)}
                        onChange={(value) => {
                          setSelectedQuizGroup(Number.parseInt(value, 10));
                          setIsEditingGroup(false);
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    muted
                    onClick={() => setIsEditingGroup(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <div className={styles.groupInfo}>
                    <h2 className={styles.groupLabel}>Course</h2>
                    <div className={styles.groupName}>
                      {selectedQuizGroup?.name ?? 'No course selected'}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingGroup(true)}
                  >
                    Change
                  </Button>
                </>
              )}
            </div>

            <div className={styles.quizField}>
              <Field htmlFor="official-quiz-number" label="Quiz">
                <Select
                  id="official-quiz-number"
                  value={String(quizNumber)}
                  options={quizSelectOptions}
                  onChange={(value) =>
                    setUserSelectedQuizNumber(Number.parseInt(value, 10) || 0)
                  }
                  emphasis
                  disabled={quizOptions.length === 0}
                />
              </Field>
            </div>
          </div>
        </Card>

        <div className={styles.actions}>
          <div className={styles.cta}>
            <Button disabled={!quizIsSelectable} onClick={startQuiz}>
              Begin quiz
            </Button>
          </div>
          {onLeave !== undefined && (
            <div className={styles.ctaSecondary}>
              <Button
                variant="ghost"
                muted
                leadingIcon="arrowLeft"
                onClick={onLeave}
              >
                Back to home
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default OfficialQuizSetupMenuV2;
