import type { SkillTag } from '@learncraft-spanish/shared';
import { useLocalFilterPanelLogic } from '@application/units/ExampleSearchInterface/Filters/useLocalFilterPanelLogic';
import { ToggleSwitch } from '@interface/components/general';
import SelectedTags from '@interface/components/general/VocabTagFilter/SelectedTags';
import TagFilter from '@interface/components/general/VocabTagFilter/TagFilter';
import SelectCourse from '@interface/components/LessonSelector/SelectCourse';
import SelectLesson from '@interface/components/LessonSelector/SelectLesson';
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
  const { course, fromLessons, toLessons, getDefaultLessonsForCourse } =
    useLocalFilterPanelLogic({
      selectedCourseId,
      fromLessonNumber,
      toLessonNumber,
    });

  const handleCourseChange = (courseId: number) => {
    onCourseChange(courseId);
    const { defaultToLesson, defaultFromLesson } =
      getDefaultLessonsForCourse(courseId);
    onToLessonChange(defaultToLesson);
    onFromLessonChange(defaultFromLesson);
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
              required
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
