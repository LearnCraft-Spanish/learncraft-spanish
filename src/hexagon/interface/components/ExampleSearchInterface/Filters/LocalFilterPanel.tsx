import type { ExtendedLesson } from '@interface/components/LessonSelector/SelectLesson';
import type { SkillTag } from '@learncraft-spanish/shared';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import {
  generateVirtualLessonId,
  getPrerequisitesForCourse,
} from '@domain/coursePrerequisites';
import { ToggleSwitch } from '@interface/components/general';
import SelectedTags from '@interface/components/general/VocabTagFilter/SelectedTags';
import TagFilter from '@interface/components/general/VocabTagFilter/TagFilter';
import SelectCourse from '@interface/components/LessonSelector/SelectCourse';
import SelectLesson from '@interface/components/LessonSelector/SelectLesson';
import { useMemo } from 'react';
import '@interface/components/LessonSelector/LessonSelector.css';

export interface LocalFilterPanelProps {
  excludeSpanglish: boolean;
  audioOnly: boolean;
  onExcludeSpanglishChange: (next: boolean) => void;
  onAudioOnlyChange: (next: boolean) => void;
  tagSearchTerm: string;
  tagSuggestions: SkillTag[];
  onTagSearchTermChange: (value: string) => void;
  onAddTag: (tagId: string) => void;
  onRemoveTagFromSuggestions: (tagId: string) => void;
  selectedSkillTags: SkillTag[];
  onRemoveSkillTag: (tagId: string) => void;
  onAddTagBackToSuggestions?: (tagId: string) => void;
  selectedCourseId: number;
  fromLessonNumber: number;
  toLessonNumber: number;
  onCourseChange: (courseId: number) => void;
  onFromLessonChange: (lessonNumber: number) => void;
  onToLessonChange: (lessonNumber: number) => void;
}

export function LocalFilterPanel({
  excludeSpanglish,
  audioOnly,
  onExcludeSpanglishChange,
  onAudioOnlyChange,
  tagSearchTerm,
  tagSuggestions,
  onTagSearchTermChange,
  onAddTag,
  onRemoveTagFromSuggestions,
  onAddTagBackToSuggestions,
  selectedSkillTags,
  onRemoveSkillTag,
  selectedCourseId,
  fromLessonNumber,
  toLessonNumber,
  onCourseChange,
  onFromLessonChange,
  onToLessonChange,
}: LocalFilterPanelProps) {
  const { data: coursesWithLessons } = useCoursesWithLessons();

  const course = useMemo(() => {
    return coursesWithLessons?.find((c) => c.id === selectedCourseId);
  }, [coursesWithLessons, selectedCourseId]);

  const toLesson = useMemo(() => {
    if (!course) return undefined;
    return course.lessons.find((l) => l.lessonNumber === toLessonNumber);
  }, [course, toLessonNumber]);

  const fromLesson = useMemo(() => {
    if (!course) return undefined;
    if (fromLessonNumber < 0) {
      // Virtual lesson
      const prerequisites = getPrerequisitesForCourse(course.id);
      if (!prerequisites) return undefined;
      const prereqIndex = prerequisites.prerequisites.findIndex(
        (_, index) =>
          generateVirtualLessonId(course.id, index) === fromLessonNumber,
      );
      if (prereqIndex === -1) return undefined;
      const prereq = prerequisites.prerequisites[prereqIndex];
      return {
        id: fromLessonNumber,
        lessonNumber: fromLessonNumber,
        courseName: prereq.courseName,
        isVirtual: true,
        displayName: prereq.displayName,
      } as ExtendedLesson;
    }
    return course.lessons.find((l) => l.lessonNumber === fromLessonNumber);
  }, [course, fromLessonNumber]);

  const fromLessons = useMemo((): ExtendedLesson[] => {
    if (!course) {
      return [];
    }

    const prerequisites = getPrerequisitesForCourse(course.id);
    const virtualLessons: ExtendedLesson[] = prerequisites
      ? prerequisites.prerequisites.map((prereq, index) => ({
          id: generateVirtualLessonId(course.id, index),
          lessonNumber: generateVirtualLessonId(course.id, index),
          courseName: prereq.courseName,
          isVirtual: true,
          displayName: prereq.displayName,
        }))
      : [];

    // If no "To" lesson is selected, only show prerequisite options
    if (!toLesson) {
      return virtualLessons;
    }

    // If "To" lesson is selected, show prerequisites + filtered regular lessons
    const filteredLessons = course.lessons.filter(
      (lesson) => lesson.lessonNumber <= toLesson.lessonNumber,
    );

    return [...virtualLessons, ...filteredLessons];
  }, [course, toLesson]);

  const toLessons = useMemo((): ExtendedLesson[] => {
    if (!course) {
      return [];
    }
    if (!fromLesson) {
      return course.lessons;
    }

    // If fromLesson is virtual, show all lessons in the target course
    if (fromLesson.lessonNumber < 0) {
      return course.lessons;
    }

    return course.lessons.filter((lesson) => {
      return lesson.lessonNumber >= fromLesson.lessonNumber;
    });
  }, [course, fromLesson]);

  const handleCourseChange = (courseId: number) => {
    onCourseChange(courseId);
    const newCourse = coursesWithLessons?.find((c) => c.id === courseId);
    // find first lesson in the course
    const firstLesson = newCourse?.lessons?.[0]?.lessonNumber;
    if (firstLesson) {
      onToLessonChange(firstLesson);
    } else {
      onToLessonChange(0);
    }

    // Check if the course has prerequisites and auto-select the first one
    const prerequisites = getPrerequisitesForCourse(courseId);
    if (prerequisites && prerequisites.prerequisites.length > 0) {
      // Set the from lesson to the first prerequisite
      const firstPrerequisiteId = generateVirtualLessonId(courseId, 0);
      onFromLessonChange(firstPrerequisiteId);
    } else {
      const firstLesson = newCourse?.lessons?.[0]?.lessonNumber;
      if (firstLesson) {
        onFromLessonChange(firstLesson);
      } else {
        onFromLessonChange(0);
      }
    }
  };

  return (
    <div className="filterPanel">
      <div className="filterPanelColumn basicOptions">
        <div className="FromToLessonSelectorWrapper">
          <div className="FTLS">
            <SelectCourse
              value={selectedCourseId.toString()}
              onChange={(value: string) =>
                handleCourseChange(Number.parseInt(value))
              }
            />
            <div>
              {course?.lessons && (
                <SelectLesson
                  value={fromLessonNumber.toString()}
                  onChange={(value: string) =>
                    onFromLessonChange(Number.parseInt(value))
                  }
                  label="From"
                  id="fromLesson"
                  lessons={fromLessons ?? []}
                />
              )}
              <SelectLesson
                value={toLessonNumber.toString()}
                onChange={(value: string) =>
                  onToLessonChange(Number.parseInt(value))
                }
                label="To"
                id="toLesson"
                lessons={toLessons ?? []}
                required
              />
            </div>
          </div>
        </div>
        <ToggleSwitch
          id="removeSpanglish"
          ariaLabel="noSpanglish"
          label="Exclude Spanglish: "
          checked={excludeSpanglish}
          onChange={() => onExcludeSpanglishChange(!excludeSpanglish)}
        />

        <ToggleSwitch
          id="audioOnly"
          ariaLabel="audioOnly"
          label="Audio Flashcards Only: "
          checked={audioOnly}
          onChange={() => onAudioOnlyChange(!audioOnly)}
        />
      </div>
      <div className="filterPanelColumn tagFiltering">
        <div className="filterPanel_contentArea">
          <TagFilter
            searchTerm={tagSearchTerm}
            updateSearchTerm={(target) =>
              onTagSearchTermChange(target?.value ?? '')
            }
            searchResults={tagSuggestions}
            addTag={onAddTag}
            removeTagFromSuggestions={onRemoveTagFromSuggestions}
          />
          <SelectedTags
            removeTag={(tagId) => {
              onRemoveSkillTag(tagId);
              onAddTagBackToSuggestions?.(tagId);
            }}
            skillTags={selectedSkillTags}
          />
        </div>
      </div>
    </div>
  );
}
