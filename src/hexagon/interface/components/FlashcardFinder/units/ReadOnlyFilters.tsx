import type { SkillTag } from '@LearnCraft-Spanish/shared';
import ReadOnlyLessonRangeSelector from '@interface/components/LessonSelector/ReadOnlyLessonRangeSelector';
import { useSelectedCourseAndLessons } from 'src/hexagon/application/coordinators/hooks/useSelectedCourseAndLessons';
import SelectedTags from '../VocabTagFilter/SelectedTags';
import '../FlashcardFinder.scss';
export default function ReadOnlyFilters({
  includeSpanglish,
  audioOnly,
  skillTags,
}: {
  includeSpanglish: boolean;
  audioOnly: boolean;
  skillTags: SkillTag[];
}) {
  const { course, toLesson, fromLesson } = useSelectedCourseAndLessons();

  return (
    <div className="readOnlyFilterSection">
      <div className="firstRow">
        <div className="filterItem">
          <h4>Course:</h4>
          <p>{course?.name}</p>
        </div>
        {fromLesson && (
          <div className="filterItem">
            <h4>From:</h4>

            <p>{`Lesson ${fromLesson?.lessonNumber}`}</p>
          </div>
        )}
        {toLesson && (
          <div className="filterItem">
            <h4>To:</h4>
            <p>{`Lesson ${toLesson?.lessonNumber}`}</p>
          </div>
        )}
        {includeSpanglish && (
          <div className="filterItem">
            <h4>Include Spanglish</h4>
          </div>
        )}
        {audioOnly && (
          <div className="filterItem">
            <h4>Audio Flashcards Only</h4>
          </div>
        )}
        {skillTags.length > 0 && (
          <div className="filterItem">
            <h4>Selected Tags:</h4>
            <div className="vocabTagsList">
              {skillTags.map((tag) => (
                <div className="vocabTag" key={tag.key}>
                  {tag.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
