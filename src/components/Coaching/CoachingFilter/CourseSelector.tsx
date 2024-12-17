export default function CourseSelector({
  courses,
  memberships,
  updateCourseFilter,
}) {
  const courseSelector = [
    <option key={0} value={0}>
      All Courses
    </option>,
  ];
  courses.current.forEach((course) => {
    const courseHasActiveMembership =
      memberships.current.filter(
        (item) => item.relatedCourse === course.recordId,
      ).length > 0;
    if (courseHasActiveMembership) {
      courseSelector.push(
        <option key={course.recordId} value={course.recordId}>
          {course.name}
        </option>,
      );
    }
  });
  // return courseSelector;
  return (
    <select onChange={(e) => updateCourseFilter(e.target.value)}>
      {courseSelector}
    </select>
  );
}
