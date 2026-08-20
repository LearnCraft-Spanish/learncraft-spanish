import { Field } from '@interface/components/general/Field/Field';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

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
  });

  it('names the hint so a caller can point the control at it', () => {
    render(
      <Field htmlFor="course" label="Course" hint="Pick a course first">
        <select id="course" />
      </Field>,
    );

    expect(screen.getByText('Pick a course first')).toHaveAttribute(
      'id',
      'course-hint',
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
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'course-error');
  });
});
