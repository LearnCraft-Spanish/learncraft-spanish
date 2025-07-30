import type { Lesson } from '@learncraft-spanish/shared';

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
  lessons: Lesson[];
  required?: boolean;
  id: string;
}) {
  return (
    <label htmlFor={id} className="menuRow" id={id}>
      <p className={required ? 'required' : ''}>{label}:</p>
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
        {lessons.map((lesson: Lesson) => makeLessonOption(lesson))}
      </select>
    </label>
  );
}

function makeLessonOption(lesson: Lesson) {
  return (
    <option key={lesson.lessonNumber} value={lesson.id.toString()}>
      {`Lesson ${lesson.lessonNumber}`}
    </option>
  );
}
