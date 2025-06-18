import type { Lesson } from '@LearnCraft-Spanish/shared';

export default function SelectLesson({
  value,
  onChange,
  label,
  lessons,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  lessons: Lesson[];
}) {
  return (
    <label htmlFor="toLesson" className="menuRow" id="toRow">
      <p>{label}:</p>
      <select
        id="toLesson"
        name="toLesson"
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
