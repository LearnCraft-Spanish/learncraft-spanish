import type { SkillTag } from '@learncraft-spanish/shared';
import { ToggleSwitch } from '@interface/components/general';
import SelectedTags from '@interface/components/general/VocabTagFilter/SelectedTags';
import TagFilter from '@interface/components/general/VocabTagFilter/TagFilter';
import LessonRangeSelector from '@interface/components/LessonSelector/LessonRangeSelector';

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
}: LocalFilterPanelProps) {
  return (
    <div className="filterPanel">
      <div className="filterPanelColumn basicOptions">
        <div className="FromToLessonSelectorWrapper">
          <LessonRangeSelector />
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
