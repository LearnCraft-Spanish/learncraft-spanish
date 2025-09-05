import type { OfficialQuizRecord } from '@learncraft-spanish/shared';
import type { OfficialQuizSetupMenuProps } from './OfficialQuizSetupMenu';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMockOfficialQuizRecord } from 'src/hexagon/testing/factories/quizFactory';
import { describe, expect, it, vi } from 'vitest';
import { OfficialQuizSetupMenu } from './OfficialQuizSetupMenu';

vi.mock('@interface/components/general/Buttons', () => ({
  MenuButton: () => <div>MockedMenuButton</div>,
}));

function createQuizOptions(
  courseCode: string,
  count = 3,
): OfficialQuizRecord[] {
  return Array.from({ length: count }, (_, idx) =>
    createMockOfficialQuizRecord({
      id: idx + 1,
      courseCode,
      quizNumber: idx + 1,
      quizTitle: `${courseCode.toUpperCase()} ${idx + 1}`,
    }),
  );
}
const defaultProps: OfficialQuizSetupMenuProps = {
  currentCourseCode: officialQuizCourses[0]?.code ?? 'lcsp',
  setCurrentCourseCode: vi.fn(),
  chosenQuizNumber: 0,
  setChosenQuizNumber: vi.fn(),
  quizOptions: createQuizOptions(officialQuizCourses[0]?.code, 2),
  startQuiz: vi.fn(),
};

function renderWithOverrides(overrides?: Partial<OfficialQuizSetupMenuProps>) {
  return render(
    <OfficialQuizSetupMenu {...defaultProps} {...(overrides ?? {})} />,
  );
}

describe('officialQuizSetupMenu', () => {
  it('renders course and quiz selects with options', () => {
    const currentCourseCode = officialQuizCourses[0]?.code ?? 'lcsp';
    const quizOptions = createQuizOptions(currentCourseCode, 2);

    renderWithOverrides({
      currentCourseCode,
      quizOptions,
    });

    expect(screen.getByText('Official Quizzes')).toBeInTheDocument();

    const courseSelect = screen.getByLabelText(
      'Select Course',
    ) as HTMLSelectElement;
    expect(courseSelect).toBeInTheDocument();
    expect(courseSelect.value).toBe(currentCourseCode);
    // has all official courses
    for (const course of officialQuizCourses) {
      expect(
        screen.getByRole('option', { name: course.name }),
      ).toBeInTheDocument();
    }

    const quizSelect = screen.getByLabelText(
      'Select Quiz',
    ) as HTMLSelectElement;
    expect(quizSelect).toBeInTheDocument();
    // includes default option and provided quiz options
    expect(
      screen.getByRole('option', { name: 'Select a Quiz' }),
    ).toBeInTheDocument();
    for (const option of quizOptions) {
      expect(
        screen.getByRole('option', { name: option.quizTitle }),
      ).toBeInTheDocument();
    }

    // MenuButton stub rendered
    expect(screen.getByText('MockedMenuButton')).toBeInTheDocument();
  });

  it('changes course calls setCurrentCourseCode and resets quiz number', () => {
    const currentCourseCode = officialQuizCourses[0]?.code ?? 'lcsp';
    const nextCourseCode = officialQuizCourses[1]?.code ?? currentCourseCode;
    const quizOptions = createQuizOptions(currentCourseCode, 2);
    const setCurrentCourseCode = vi.fn();
    const setChosenQuizNumber = vi.fn();

    renderWithOverrides({
      currentCourseCode,
      chosenQuizNumber: 2,
      quizOptions,
      setCurrentCourseCode,
      setChosenQuizNumber,
    });

    const courseSelect = screen.getByLabelText(
      'Select Course',
    ) as HTMLSelectElement;
    fireEvent.change(courseSelect, { target: { value: nextCourseCode } });

    expect(setCurrentCourseCode).toHaveBeenCalledWith(nextCourseCode);
    expect(setChosenQuizNumber).toHaveBeenCalledWith(0);
  });

  it('changes quiz calls setChosenQuizNumber', () => {
    const setChosenQuizNumber = vi.fn();

    renderWithOverrides({ setChosenQuizNumber });

    const quizSelect = screen.getByLabelText(
      'Select Quiz',
    ) as HTMLSelectElement;
    fireEvent.change(quizSelect, { target: { value: '2' } });

    expect(setChosenQuizNumber).toHaveBeenCalledWith(2);
  });

  it('begin Review button enabled only when course and quiz selected; clicking calls startQuiz', () => {
    const currentCourseCode = officialQuizCourses[0]?.code ?? '';
    const quizOptions = createQuizOptions(currentCourseCode || 'lcsp', 2);
    const setCurrentCourseCode = vi.fn();
    const setChosenQuizNumber = vi.fn();
    const startQuiz = vi.fn();

    const { rerender } = render(
      <OfficialQuizSetupMenu
        currentCourseCode={''}
        setCurrentCourseCode={setCurrentCourseCode}
        chosenQuizNumber={0}
        setChosenQuizNumber={setChosenQuizNumber}
        quizOptions={quizOptions}
        startQuiz={startQuiz}
      />,
    );

    const button = screen.getByRole('button', { name: 'Begin Review' });
    expect(button).toBeDisabled();

    rerender(
      <OfficialQuizSetupMenu
        currentCourseCode={currentCourseCode}
        setCurrentCourseCode={setCurrentCourseCode}
        chosenQuizNumber={0}
        setChosenQuizNumber={setChosenQuizNumber}
        quizOptions={quizOptions}
        startQuiz={startQuiz}
      />,
    );
    expect(button).toBeDisabled();

    rerender(
      <OfficialQuizSetupMenu
        currentCourseCode={currentCourseCode}
        setCurrentCourseCode={setCurrentCourseCode}
        chosenQuizNumber={2}
        setChosenQuizNumber={setChosenQuizNumber}
        quizOptions={quizOptions}
        startQuiz={startQuiz}
      />,
    );
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(startQuiz).toHaveBeenCalled();
  });
});
