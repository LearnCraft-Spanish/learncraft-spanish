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

  it('renders a hint when there is no error', () => {
    render(
      <Field htmlFor="course" label="Course" hint="Pick a course first">
        <select id="course" />
      </Field>,
    );

    expect(screen.getByText('Pick a course first')).toBeInTheDocument();
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
  });

  it('colors the label when the field is in error', () => {
    render(
      <Field htmlFor="course" label="Course" error="Course is required">
        <select id="course" />
      </Field>,
    );

    expect(screen.getByText('Course').className).toContain('labelError');
  });
});
