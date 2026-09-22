import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { SkillTag } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import {
  handleRadioGroupKeyDown,
  SelectorCard,
} from '@interface/components/customQuiz/SelectorCard';
import { Card } from '@interface/components/general/Card/Card';
import { Chip } from '@interface/components/general/Chip/Chip';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Popover } from '@interface/components/general/Popover/Popover';
import { TextInput } from '@interface/components/general/TextInput/TextInput';
import { PresetList } from '@interface/components/quizPresets/PresetList';
import {
  setTagQuery,
  tagCategory,
  tagLabel,
  TagSuggestionList,
} from '@interface/components/tagFilter/TagSuggestionList';
import { useState } from 'react';
import styles from './TagsCard.module.scss';

const SUGGESTION_CAP = 6;
const EMPTY_TAGS_COPY = 'None — every lesson in range';

type TagMode = 'search' | 'presets';

/** Chips carry their category, so "Estar" is not mistaken for vocabulary. */
function chipLabel(tag: SkillTag): string {
  const category = tagCategory(tag);
  return `${tagLabel(tag)} · ${category[0].toUpperCase()}${category.slice(1)}`;
}

export interface TagsCardProps {
  exampleFilter: UseCombinedFiltersReturnType;
  /** Shown beside the eyebrow on desktop, where there is room for it. */
  showHeader?: boolean;
}

export function TagsCard({
  exampleFilter,
  showHeader = false,
}: TagsCardProps): JSX.Element {
  const [mode, setMode] = useState<TagMode>('search');

  const {
    selectedSkillTags,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    skillTagSearch,
    filterPreset,
    setFilterPreset,
  } = exampleFilter;

  const appliedKeys = new Set(selectedSkillTags.map((tag) => tag.key));
  const suggestions = skillTagSearch.tagSuggestions
    .filter((tag) => !appliedKeys.has(tag.key))
    .slice(0, SUGGESTION_CAP);
  const searchOpen = skillTagSearch.tagSearchTerm.trim().length > 0;

  function setQuery(value: string): void {
    setTagQuery(skillTagSearch.updateTagSearchTerm, value);
  }

  function changeMode(next: TagMode): void {
    setMode(next);
    if (next !== 'search') {
      setQuery('');
    }
  }

  return (
    <Card clip={false}>
      <div className={styles.root}>
        {showHeader && (
          <div className={styles.header}>
            <Eyebrow as="h2">Tags (optional)</Eyebrow>
            <span className={styles.selectedCount}>
              {`${selectedSkillTags.length} selected`}
            </span>
          </div>
        )}

        <div
          className={styles.modes}
          role="radiogroup"
          aria-label="Tag selection mode"
          onKeyDown={handleRadioGroupKeyDown}
        >
          <SelectorCard
            icon="search"
            label="Search tags"
            variant="inline"
            selected={mode === 'search'}
            onSelect={() => changeMode('search')}
          />
          <SelectorCard
            icon="checklist"
            label="Presets"
            variant="inline"
            selected={mode === 'presets'}
            onSelect={() => changeMode('presets')}
          />
        </div>

        {mode === 'search' ? (
          <div className={styles.search}>
            <div
              className={
                searchOpen
                  ? `${styles.field} ${styles.fieldOpen}`
                  : styles.field
              }
            >
              <Popover
                open={searchOpen}
                onDismiss={() => setQuery('')}
                trigger={
                  <TextInput
                    id="custom-quiz-tag-search"
                    value={skillTagSearch.tagSearchTerm}
                    onChange={setQuery}
                    placeholder="Search tags"
                    leadingIcon="search"
                  />
                }
              >
                <TagSuggestionList
                  suggestions={suggestions}
                  onSelect={(tag) => {
                    addSkillTagToFilters(tag.key);
                    skillTagSearch.removeTagFromSuggestions(tag.key);
                    setQuery('');
                  }}
                />
              </Popover>
            </div>

            <div className={styles.selected}>
              <Eyebrow as="h3">
                Selected tags
                {/* Desktop repeats this in the card header, so it hides there. */}
                <span className={styles.inlineCount}>
                  {` · ${selectedSkillTags.length}`}
                </span>
              </Eyebrow>
              {selectedSkillTags.length > 0 ? (
                <div className={styles.chips}>
                  {selectedSkillTags.map((tag) => (
                    <Chip
                      key={tag.key}
                      label={chipLabel(tag)}
                      tone="action"
                      onRemove={() => {
                        removeSkillTagFromFilters(tag.key);
                        skillTagSearch.addTagBackToSuggestions(tag.key);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.empty}>{EMPTY_TAGS_COPY}</p>
              )}
            </div>
          </div>
        ) : (
          <PresetList
            filterPreset={filterPreset}
            setFilterPreset={(preset) => {
              setFilterPreset(preset);
              changeMode('search');
            }}
          />
        )}
      </div>
    </Card>
  );
}
