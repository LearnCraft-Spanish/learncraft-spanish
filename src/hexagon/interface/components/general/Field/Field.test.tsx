import { Field } from '@interface/components/general/Field/Field';
import { TextInput } from '@interface/components/general/TextInput/TextInput';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import styles from './Field.module.scss';

describe('field', () => {
  afterEach(() => {
    cleanup();
  });

  it('associates its label with the control', () => {
    render(
      <Field htmlFor="course" label="Course">
        <select id="course" />
      </Field>,
    );

    expect(screen.getByLabelText('Course')).toBeInTheDocument();
    expect(screen.getByText('Course')).toHaveClass(styles.label);
  });

  it('points the control at its hint', () => {
    render(
      <Field htmlFor="course" label="Course" hint="Pick a course first">
        <select id="course" />
      </Field>,
    );

    expect(screen.getByLabelText('Course')).toHaveAccessibleDescription(
      'Pick a course first',
    );
  });

  it('replaces the hint with the error when both are given', () => {
    render(
      <Field
        htmlFor="course"
        label="Course"
        hint="Pick a course first"
        error="Course is required"
      >
        <select id="course" />
      </Field>,
    );

    expect(screen.queryByText('Pick a course first')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Course is required');
    expect(screen.getByLabelText('Course')).toHaveAccessibleDescription(
      'Course is required',
    );
    expect(screen.getByLabelText('Course')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('wires hint and error onto a primitive control', () => {
    render(
      <Field htmlFor="tags" label="Tags" error="Enter at least one tag">
        <TextInput id="tags" value="" onChange={vi.fn()} />
      </Field>,
    );

    expect(screen.getByRole('textbox', { name: 'Tags' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(
      screen.getByRole('textbox', { name: 'Tags' }),
    ).toHaveAccessibleDescription('Enter at least one tag');
  });
});
