import useCoaching from '../../../../hooks/useCoaching';
import type { Course } from '../../../../types/CoachingTypes';
interface CourseSelectorProps {
  updateCourseFilter: (value: string) => void;
  filterByCourse: Course | undefined;
}

export default function CourseSelector({
  updateCourseFilter,
  filterByCourse,
}: CourseSelectorProps) {
  const { courseListQuery, activeMembershipsQuery } = useCoaching();

  const dataReady =
    courseListQuery.isSuccess && activeMembershipsQuery.isSuccess;

  return (
    dataReady && (
      <div>
        <label htmlFor="courseSelector">Course:</label>
        <select
          name="courseSelector"
          id="course"
          onChange={(e) => updateCourseFilter(e.target.value)}
          value={filterByCourse ? filterByCourse.recordId : -1}
        >
          <option key={0} value={0}>
            All Courses
          </option>
          {courseListQuery.data.map((course) => {
            const courseHasActiveMembership =
              activeMembershipsQuery.data.filter(
                (membership) => membership.relatedCourse === course.recordId,
              ).length > 0;
            if (courseHasActiveMembership) {
              return (
                <option key={course.recordId} value={course.recordId}>
                  {course.name}
                </option>
              );
            }
          })}
        </select>
      </div>
    )
  );
}
