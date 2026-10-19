import type { JSX } from 'react';
import { Field } from '@interface/components/general/Field/Field';
import { Select } from '@interface/components/general/Select/Select';
import styles from './QuizOptionsCard.module.scss';

export interface QuizLengthFieldProps {
  /** Prefix for control ids so two instances on one page stay unique. */
  idPrefix: string;
  quizLength: number;
  quizLengthOptions: readonly number[];
  onQuizLengthChange: (value: number) => void;
  countLabel: string;
}

/** The quiz length select with the match count under it. */
export function QuizLengthField({
  idPrefix,
  quizLength,
  quizLengthOptions,
  onQuizLengthChange,
  countLabel,
}: QuizLengthFieldProps): JSX.Element {
  const id = `${idPrefix}-length`;

  return (
    <div>
      <Field htmlFor={id} label="Quiz length">
        <Select
          id={id}
          value={String(quizLength)}
          options={quizLengthOptions.map((option) => ({
            value: String(option),
            label: option.toLocaleString('en-US'),
          }))}
          onChange={(value) => onQuizLengthChange(Number(value))}
        />
      </Field>
      <p className={styles.count}>{countLabel}</p>
    </div>
  );
}
