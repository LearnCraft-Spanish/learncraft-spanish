import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';

export default function SelectCourse({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const { data: coursesWithLessons } = useCoursesWithLessons();
  return (
    <label htmlFor="courseList" className="menuRow" id="courseRow">
      <p className={required ? 'required' : ''}>Course:</p>
      <select
        id="courseList"
        name="courseList"
        className="courseList"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option key={0} value={0}>
          –Choose Course–
        </option>
        {coursesWithLessons?.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
    </label>
  );
}
