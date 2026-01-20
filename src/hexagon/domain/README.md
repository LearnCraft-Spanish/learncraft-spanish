# Course Prerequisites System

This system provides an extensible way to handle course prerequisites in the lesson selector components, allowing users to select prerequisite lesson ranges from other courses.

## Overview

When a user is selecting lessons for a course that has prerequisites (like Post-Challenge Lessons), they can now choose virtual lesson options that represent entire prerequisite courses (like "All Spanish in One Month Lessons 1-20").

## Architecture

### Core Components

1. **coursePrerequisites.ts** - Configuration and utilities for course dependencies
2. **SelectLesson.tsx** - Updated to support virtual prerequisite lessons
3. **LessonRangeSelector.tsx** - Shows virtual prerequisite options
4. **useLessonWithVocab.ts** - Handles cross-course vocabulary queries
5. **courseInfrastructure.ts** - Backend integration for multi-course queries

### How It Works

1. **Configuration**: Prerequisites are defined in `COURSE_PREREQUISITES` array
2. **Virtual Lessons**: Negative lesson numbers represent prerequisite courses
3. **UI Display**: Virtual lessons show with 📚 icon and descriptive names
4. **Backend Queries**: Automatically combines vocabulary from multiple courses
5. **Extensible**: Adding new prerequisites requires only configuration changes

## Adding New Prerequisites

To add a new course prerequisite relationship:

1. Add a new `CoursePrerequisites` object to the `COURSE_PREREQUISITES` array in `coursePrerequisites.ts`:

```typescript
{
  targetCourseId: 6, // Your new course ID
  targetCourseName: 'Advanced Course',
  prerequisites: [
    {
      courseId: 3, // Prerequisite course ID
      courseName: 'Spanish in One Month',
      fromLessonNumber: 1,
      toLessonNumber: 30,
      displayName: 'All Spanish in One Month Lessons (1-30)',
    },
    // Add more prerequisites as needed
  ],
}
```

2. That's it! The system will automatically:
   - Show the prerequisite option in lesson selectors
   - Handle vocabulary queries across courses
   - Display proper UI labels

## Current Prerequisites

- **Post-Challenge Lessons** (Course ID: 5)
  - Prerequisite: Spanish in One Month Lessons 1-20 (Course ID: 3)

## Virtual Lesson ID System

Virtual lessons use negative IDs to avoid conflicts:

- Formula: `-(targetCourseId * 1000 + prerequisiteIndex + 1)`
- Example: Post-1MC Cohort (5) with first prerequisite = -5001
- This allows up to 999 prerequisites per course

## Backend Integration

The system uses `getMultiCourseLessonRangeVocabRequired()` to query vocabulary across multiple courses. Currently implemented as multiple API calls that are combined, but can be optimized with a dedicated backend endpoint.

## Testing

See `coursePrerequisites.example.ts` for examples of more complex prerequisite configurations.
