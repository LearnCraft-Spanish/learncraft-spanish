import type { Lesson } from '@learncraft-spanish/shared';

export interface VirtualLesson {
  id: number;
  lessonNumber: number;
  courseName: string;
  isVirtual?: boolean;
  displayName?: string;
}

export type ExtendedLesson = Lesson | VirtualLesson;

export default function SelectLesson({
  value,
  onChange,
  label,
  lessons,
  required,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  lessons: ExtendedLesson[];
  required?: boolean;
  id: string;
}) {
  return (
    <label htmlFor={id} className="menuRow" id={id}>
      <p className={required ? 'required' : ''}>{`${label}:`}</p>
      <select
        id={id}
        name={id}
        className="lessonList"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option key={0} value={0}>
          –Choose Lesson–
        </option>
        {lessons.map((lesson: ExtendedLesson) => makeLessonOption(lesson))}
      </select>
    </label>
  );
}

function makeLessonOption(lesson: ExtendedLesson) {
  // Handle virtual prerequisite lessons
  if ('isVirtual' in lesson && lesson.isVirtual) {
    return (
      <option key={lesson.lessonNumber} value={lesson.lessonNumber}>
        {lesson.displayName}
      </option>
    );
  }

  // Handle regular lessons
  return (
    <option key={lesson.lessonNumber} value={lesson.lessonNumber}>
      {`Lesson ${lesson.lessonNumber}`}
    </option>
  );
}
