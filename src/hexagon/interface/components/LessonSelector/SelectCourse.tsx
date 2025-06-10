import type { Program } from 'src/types/interfaceDefinitions';
// MOVE THIS INTO HEXAGON
import { useProgramTable } from 'src/hooks/CourseData/useProgramTable';

export default function SelectCourse({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { programTableQuery } = useProgramTable();
  return (
    <label htmlFor="courseList" className="menuRow" id="courseRow">
      <p>Course:</p>
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
        {programTableQuery.isSuccess &&
          programTableQuery.data?.map((item: Program) => (
            <option key={item.recordId} value={item.recordId}>
              {item.name}
            </option>
          ))}
      </select>
    </label>
  );
}
