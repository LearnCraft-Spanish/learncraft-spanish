export interface PrerequisiteCourse {
  courseId: number;
  courseName: string;
  fromLessonNumber: number;
  toLessonNumber: number;
  displayName: string;
}

export interface CourseWithPrerequisites {
  targetCourseId: number;
  targetCourseName: string;
  prerequisites: PrerequisiteCourse[];
}

/**
 * Configuration for courses with prerequisites
 * This is the single source of truth for course dependency relationships
 */
export const COURSES_WITH_PREREQUISITES: CourseWithPrerequisites[] = [
  {
    targetCourseId: 5, // Post-Challenge Lessons
    targetCourseName: 'Post-Challenge Lessons',
    prerequisites: [
      {
        courseId: 3, // Spanish in One Month
        courseName: 'Spanish in One Month',
        fromLessonNumber: 1,
        toLessonNumber: 20,
        displayName: 'All si1m Lessons (1-20)',
      },
    ],
  },
  {
    targetCourseId: 7, // Post-Podcast Lessons
    targetCourseName: 'Post-Podcast Lessons',
    prerequisites: [
      {
        courseId: 2, // LearnCraft Spanish
        courseName: 'LearnCraft Spanish',
        fromLessonNumber: 1,
        toLessonNumber: 250,
        displayName: 'All LCS Lessons (1-250)',
      },
    ],
  },
  // Add more prerequisite relationships here as needed
  // Example for future courses:
  // {
  //   targetCourseId: 6,
  //   targetCourseName: 'Advanced Course',
  //   prerequisites: [
  //     {
  //       courseId: 2,
  //       courseName: 'LearnCraft Spanish',
  //       fromLessonNumber: 1,
  //       toLessonNumber: 10,
  //       displayName: 'LearnCraft Spanish Lessons 1-10',
  //     },
  //     {
  //       courseId: 3,
  //       courseName: 'Spanish in One Month',
  //       fromLessonNumber: 15,
  //       toLessonNumber: 30,
  //       displayName: 'Spanish in One Month Lessons 15-30',
  //     },
  //   ],
  // },
];

/**
 * Get prerequisites for a specific course
 */
export function getPrerequisitesForCourse(
  courseId: number,
): CourseWithPrerequisites | null {
  return (
    COURSES_WITH_PREREQUISITES.find(
      (config) => config.targetCourseId === courseId,
    ) || null
  );
}

/**
 * Check if a course has prerequisites
 */
export function courseHasPrerequisites(courseId: number): boolean {
  return COURSES_WITH_PREREQUISITES.some(
    (config) => config.targetCourseId === courseId,
  );
}

/**
 * Generate virtual lesson ID for a prerequisite
 * Uses negative numbers to avoid conflicts with real lesson IDs
 */
export function generateVirtualLessonId(
  targetCourseId: number,
  prerequisiteIndex: number,
): number {
  return -(targetCourseId * 1000 + prerequisiteIndex + 1);
}

/**
 * Parse virtual lesson ID to get course and prerequisite info
 */
export function parseVirtualLessonId(virtualId: number): {
  targetCourseId: number;
  prerequisiteIndex: number;
} | null {
  if (virtualId >= 0) return null;

  const positiveId = Math.abs(virtualId);
  const targetCourseId = Math.floor(positiveId / 1000);
  const prerequisiteIndex = (positiveId % 1000) - 1;

  return { targetCourseId, prerequisiteIndex };
}

/**
 * Get prerequisite details from virtual lesson ID
 */
export function getPrerequisiteFromVirtualId(
  virtualId: number,
): PrerequisiteCourse | null {
  const parsed = parseVirtualLessonId(virtualId);
  if (!parsed) return null;

  const courseConfig = getPrerequisitesForCourse(parsed.targetCourseId);
  if (!courseConfig) return null;

  return courseConfig.prerequisites[parsed.prerequisiteIndex] || null;
}

/**
 * Transform lesson selection into lesson ranges for multi-course queries
 * This handles both regular lessons and virtual prerequisite lessons
 */
export function transformToLessonRanges({
  courseId,
  fromLessonNumber,
  toLessonNumber,
}: {
  courseId: number | null | undefined;
  fromLessonNumber: number | null | undefined;
  toLessonNumber: number | null | undefined;
}): Array<{
  courseId: number;
  fromLessonNumber: number;
  toLessonNumber: number;
}> {
  if (!courseId || !toLessonNumber) {
    return [];
  }

  // Handle virtual prerequisite lessons (negative fromLessonNumber)
  if (fromLessonNumber && fromLessonNumber < 0) {
    const prerequisite = getPrerequisiteFromVirtualId(fromLessonNumber);
    if (prerequisite) {
      return [
        {
          courseId: prerequisite.courseId,
          fromLessonNumber: prerequisite.fromLessonNumber,
          toLessonNumber: prerequisite.toLessonNumber,
        },
        {
          courseId,
          fromLessonNumber: 1,
          toLessonNumber,
        },
      ];
    }
  }

  // Handle regular single-course lesson range
  return [
    {
      courseId,
      fromLessonNumber: fromLessonNumber || 1,
      toLessonNumber,
    },
  ];
}
