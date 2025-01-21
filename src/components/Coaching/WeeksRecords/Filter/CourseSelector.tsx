import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useMemo } from 'react';
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

  const coursesWithActiveMemberships = useMemo(() => {
    if (!dataReady) return [];
    return courseListQuery.data.filter((course) => {
      return (
        activeMembershipsQuery.data.filter(
          (membership) => membership.relatedCourse === course.recordId,
        ).length > 0
      );
    });
  }, [dataReady, courseListQuery.data, activeMembershipsQuery.data]);

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
          {coursesWithActiveMemberships.map((course) => {
            return (
              <option key={course.recordId} value={course.recordId}>
                {course.name}
              </option>
            );
          })}
        </select>
      </div>
    )
  );
}
