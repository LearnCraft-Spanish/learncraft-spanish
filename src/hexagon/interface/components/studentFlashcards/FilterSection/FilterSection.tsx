import type { PreSetQuiz } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { UseSkillTagSearchReturnType } from '@application/units/useSkillTagSearch';
import type { SelectOption } from '@interface/components/general/Select/Select';
import type {
  CourseWithLessons,
  Lesson,
  SkillTag,
} from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import {
  PreSetQuizPreset,
  preSetQuizzes,
} from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import {
  generateVirtualLessonId,
  getPrerequisitesForCourse,
} from '@domain/coursePrerequisites';
import { Badge } from '@interface/components/general/Badge/Badge';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import {
  Card,
  CardFooterStrip,
  CardSection,
} from '@interface/components/general/Card/Card';
import { Chip } from '@interface/components/general/Chip/Chip';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Field } from '@interface/components/general/Field/Field';
import { Icon } from '@interface/components/general/Icon/Icon';
import { Popover } from '@interface/components/general/Popover/Popover';
import { Select } from '@interface/components/general/Select/Select';
import { TextInput } from '@interface/components/general/TextInput/TextInput';
import { Toggle } from '@interface/components/general/Toggle/Toggle';
import { SkillType } from '@learncraft-spanish/shared';
import { useState } from 'react';
import styles from './FilterSection.module.scss';

const TAG_PLACEHOLDER = 'Search tags — vocabulary, idiom, verb…';
const SUGGESTION_CAP = 6;
const EMPTY_TAGS_COPY =
  'No tags applied. Results cover every flashcard in the lesson range.';

type TagFilterMode = 'search' | 'preset';

export interface FilterSectionProps {
  exampleFilter: UseCombinedFiltersReturnType;
  onResetAll?: () => void;
}

interface NamedLesson {
  lessonNumber: number;
  displayName?: string;
}

function tagLabel(tag: SkillTag): string {
  return tag.type === SkillType.Subcategory ? tag.subcategory : tag.name;
}

function tagCategory(tag: SkillTag): string {
  switch (tag.type) {
    case SkillType.Vocabulary:
      return 'vocabulary';
    case SkillType.Idiom:
      return 'idiom';
    case SkillType.Subcategory:
      return 'subcategory';
    case SkillType.Verb:
      return 'verb';
    case SkillType.Conjugation:
      return 'conjugation';
  }
}

/** Secondary line under the name — same field mapping as v1 TagFilter. */
function tagDescriptor(tag: SkillTag): string | null {
  switch (tag.type) {
    case SkillType.Vocabulary: {
      const descriptor = tag.descriptor.trim();
      return descriptor.length > 0 ? descriptor : null;
    }
    case SkillType.Idiom: {
      const subcategoryName = tag.subcategoryName.trim();
      return subcategoryName.length > 0 ? subcategoryName : null;
    }
    case SkillType.Verb: {
      const joined = tag.verbTags.join(' - ').trim();
      return joined.length > 0 ? joined : null;
    }
    case SkillType.Subcategory:
    case SkillType.Conjugation:
      return null;
  }
}

function suggestionTypeClass(tag: SkillTag): string {
  switch (tag.type) {
    case SkillType.Vocabulary:
      return styles.suggestionVocabulary;
    case SkillType.Idiom:
      return styles.suggestionIdiom;
    case SkillType.Subcategory:
      return styles.suggestionSubcategory;
    case SkillType.Verb:
      return styles.suggestionVerb;
    case SkillType.Conjugation:
      return styles.suggestionConjugation;
  }
}

function lessonLabel(lesson: NamedLesson): string {
  if (lesson.displayName !== undefined) {
    return lesson.displayName;
  }
  return `Lesson ${lesson.lessonNumber}`;
}

function virtualLessons(course: CourseWithLessons): NamedLesson[] {
  const config = getPrerequisitesForCourse(course.id);
  if (!config) {
    return [];
  }
  return config.prerequisites.map((prereq, index) => ({
    lessonNumber: generateVirtualLessonId(course.id, index),
    displayName: prereq.displayName,
  }));
}

function startFromLesson(course: CourseWithLessons | null): NamedLesson | null {
  if (!course) {
    return null;
  }
  const virtual = virtualLessons(course);
  if (virtual[0]) {
    return virtual[0];
  }
  const first = course.lessons[0];
  if (!first) {
    return null;
  }
  return { lessonNumber: first.lessonNumber };
}

function listedCourses(
  exampleFilter: UseCombinedFiltersReturnType,
): CourseWithLessons[] {
  if (
    exampleFilter.coursesWithLessons &&
    exampleFilter.coursesWithLessons.length > 0
  ) {
    return exampleFilter.coursesWithLessons;
  }
  return exampleFilter.course ? [exampleFilter.course] : [];
}

function courseOptions(
  exampleFilter: UseCombinedFiltersReturnType,
): SelectOption[] {
  return listedCourses(exampleFilter).map((listed) => ({
    value: String(listed.id),
    label: listed.name,
  }));
}

function toLessonOptions(
  course: CourseWithLessons | null,
  fromLessonNumber: number | null,
): SelectOption[] {
  if (!course) {
    return [];
  }
  const lessons: Lesson[] =
    fromLessonNumber === null || fromLessonNumber < 0
      ? course.lessons
      : course.lessons.filter(
          (lesson) => lesson.lessonNumber >= fromLessonNumber,
        );
  return lessons.map((lesson) => ({
    value: String(lesson.lessonNumber),
    label: lessonLabel(lesson),
  }));
}

function fromLessonOptions(
  course: CourseWithLessons | null,
  toLessonNumber: number | null,
): SelectOption[] {
  if (!course) {
    return [];
  }
  const start = startFromLesson(course);
  const regular =
    toLessonNumber === null
      ? []
      : course.lessons.filter(
          (lesson) => lesson.lessonNumber <= toLessonNumber,
        );
  return [...virtualLessons(course), ...regular].map((lesson) => {
    const base = lessonLabel(lesson);
    const isStart =
      start !== null && lesson.lessonNumber === start.lessonNumber;
    return {
      value: String(lesson.lessonNumber),
      label: isStart ? `${base} — from the start` : base,
    };
  });
}

function tagCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'tag' : 'tags'}`;
}

function visiblePresets(): PreSetQuiz[] {
  return preSetQuizzes.filter((quiz) => quiz.preset !== PreSetQuizPreset.None);
}

function setTagQuery(
  updateTagSearchTerm: UseSkillTagSearchReturnType['updateTagSearchTerm'],
  value: string,
): void {
  if (value.length > 0) {
    updateTagSearchTerm({ value } as HTMLInputElement);
    return;
  }
  updateTagSearchTerm();
}

export function FilterSection({
  exampleFilter,
  onResetAll,
}: FilterSectionProps): JSX.Element {
  const {
    course,
    courseId,
    fromLessonNumber,
    toLessonNumber,
    updateUserSelectedCourseId,
    updateFromLessonNumber,
    updateToLessonNumber,
    isAdmin,
    includeUnpublished,
    updateIncludeUnpublished,
    selectedSkillTags,
    addSkillTagToFilters,
    removeSkillTagFromFilters,
    bulkUpdateSkillTagKeys,
    skillTagSearch,
    filterPreset,
    setFilterPreset,
    excludeSpanglish,
    updateExcludeSpanglish,
    audioOnly,
    updateAudioOnly,
  } = exampleFilter;

  const [tagFilterMode, setTagFilterMode] = useState<TagFilterMode>(() =>
    filterPreset !== PreSetQuizPreset.None ? 'preset' : 'search',
  );

  const appliedKeys = new Set(selectedSkillTags.map((tag) => tag.key));
  const suggestions = skillTagSearch.tagSuggestions
    .filter((tag) => !appliedKeys.has(tag.key))
    .slice(0, SUGGESTION_CAP);
  const searchOpen = skillTagSearch.tagSearchTerm.trim().length > 0;
  const hasTags = selectedSkillTags.length > 0;

  function changeFromLesson(value: string): void {
    updateFromLessonNumber(Number.parseInt(value, 10));
  }

  function changeToLesson(value: string): void {
    updateToLessonNumber(Number.parseInt(value, 10));
  }

  function changeCourse(value: string): void {
    updateUserSelectedCourseId(Number.parseInt(value, 10));
  }

  function changeTagFilterMode(mode: TagFilterMode): void {
    setTagFilterMode(mode);
    if (mode !== 'search') {
      setTagQuery(skillTagSearch.updateTagSearchTerm, '');
    }
  }

  return (
    <div className={styles.root}>
      <Card clip={false}>
        <div className={styles.sectionHeader}>
          <Eyebrow as="h2" weight="regular" leading="body">
            Scope · required
          </Eyebrow>
          <span className={styles.inlineAction}>
            <Button
              variant="ghost"
              size="inline"
              muted
              onClick={() => {
                setTagFilterMode('search');
                onResetAll?.();
              }}
            >
              Reset all filters
            </Button>
          </span>
        </div>

        <CardSection>
          {isAdmin === true && (
            <div className={styles.adminStrip}>
              <Badge>Admin only</Badge>
              <Toggle
                id="finder-unpublished"
                checked={includeUnpublished}
                onChange={updateIncludeUnpublished}
                label="Include unpublished courses and lessons"
              />
            </div>
          )}
          <div className={styles.scopeGrid}>
            <Field htmlFor="finder-course" label="Course">
              <Select
                id="finder-course"
                value={courseId !== null ? String(courseId) : ''}
                options={courseOptions(exampleFilter)}
                onChange={changeCourse}
              />
            </Field>

            <Field htmlFor="finder-from-lesson" label="From lesson">
              <Select
                id="finder-from-lesson"
                value={
                  fromLessonNumber !== null ? String(fromLessonNumber) : ''
                }
                options={fromLessonOptions(course, toLessonNumber)}
                onChange={changeFromLesson}
              />
            </Field>

            <Field htmlFor="finder-to-lesson" label="Through lesson">
              <Select
                id="finder-to-lesson"
                value={toLessonNumber !== null ? String(toLessonNumber) : ''}
                options={toLessonOptions(course, fromLessonNumber)}
                onChange={changeToLesson}
                emphasis
              />
            </Field>
          </div>
        </CardSection>

        <CardSection divided>
          <div className={styles.tagsHeader}>
            <div
              className={styles.modeTabs}
              role="tablist"
              aria-label="Tag filters"
            >
              <button
                type="button"
                className={
                  tagFilterMode === 'search'
                    ? `${styles.modeTab} ${styles.modeTabOn}`
                    : styles.modeTab
                }
                id="finder-tab-search"
                role="tab"
                aria-selected={tagFilterMode === 'search'}
                aria-controls="finder-tabpanel-search"
                onClick={() => changeTagFilterMode('search')}
              >
                Search tags
              </button>
              <button
                type="button"
                className={
                  tagFilterMode === 'preset'
                    ? `${styles.modeTab} ${styles.modeTabOn}`
                    : styles.modeTab
                }
                id="finder-tab-presets"
                role="tab"
                aria-selected={tagFilterMode === 'preset'}
                aria-controls="finder-tabpanel-presets"
                onClick={() => changeTagFilterMode('preset')}
              >
                Presets
              </button>
            </div>
          </div>

          {tagFilterMode === 'search' ? (
            <div
              id="finder-tabpanel-search"
              role="tabpanel"
              aria-labelledby="finder-tab-search"
            >
              <div className={styles.tagSearchRow}>
                <div
                  className={
                    searchOpen
                      ? `${styles.tagSearch} ${styles.tagSearchOpen}`
                      : styles.tagSearch
                  }
                >
                  <Popover
                    open={searchOpen}
                    onDismiss={() =>
                      setTagQuery(skillTagSearch.updateTagSearchTerm, '')
                    }
                    trigger={
                      <TextInput
                        id="finder-tag-search"
                        value={skillTagSearch.tagSearchTerm}
                        onChange={(value) =>
                          setTagQuery(skillTagSearch.updateTagSearchTerm, value)
                        }
                        placeholder={TAG_PLACEHOLDER}
                        leadingIcon="search"
                      />
                    }
                  >
                    {suggestions.length === 0 ? (
                      <div className={styles.noSuggestions}>
                        No tags match that.
                      </div>
                    ) : (
                      <ul className={styles.suggestions} role="listbox">
                        {suggestions.map((tag) => {
                          const descriptor = tagDescriptor(tag);
                          return (
                            <li key={tag.key}>
                              <button
                                type="button"
                                className={`${styles.suggestion} ${suggestionTypeClass(tag)}`}
                                role="option"
                                onClick={() => {
                                  addSkillTagToFilters(tag.key);
                                  skillTagSearch.removeTagFromSuggestions(
                                    tag.key,
                                  );
                                  setTagQuery(
                                    skillTagSearch.updateTagSearchTerm,
                                    '',
                                  );
                                }}
                              >
                                <span className={styles.suggestionBody}>
                                  <span className={styles.suggestionName}>
                                    {tagLabel(tag)}
                                  </span>
                                  {descriptor !== null && (
                                    <span
                                      className={styles.suggestionDescriptor}
                                      aria-hidden="true"
                                    >
                                      {descriptor}
                                    </span>
                                  )}
                                </span>
                                <span className={styles.suggestionMeta}>
                                  {tagCategory(tag)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Popover>
                </div>
                {hasTags && (
                  <span className={styles.inlineAction}>
                    <Button
                      variant="ghost"
                      size="inline"
                      muted
                      onClick={() => {
                        selectedSkillTags.forEach((tag) => {
                          skillTagSearch.addTagBackToSuggestions(tag.key);
                        });
                        bulkUpdateSkillTagKeys([]);
                      }}
                    >
                      {`Clear ${tagCountLabel(selectedSkillTags.length)}`}
                    </Button>
                  </span>
                )}
              </div>

              {hasTags ? (
                <div className={styles.appliedTags}>
                  {selectedSkillTags.map((tag) => {
                    const descriptor = tagDescriptor(tag);
                    return (
                      <span key={tag.key} className={styles.appliedTag}>
                        <Chip
                          label={tagLabel(tag)}
                          tone="action"
                          onRemove={() => {
                            removeSkillTagFromFilters(tag.key);
                            skillTagSearch.addTagBackToSuggestions(tag.key);
                          }}
                        />
                        {descriptor !== null && (
                          <span
                            className={styles.appliedTagHint}
                            aria-hidden="true"
                          >
                            {descriptor}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.emptyTags}>{EMPTY_TAGS_COPY}</p>
              )}
            </div>
          ) : (
            <div
              id="finder-tabpanel-presets"
              role="tabpanel"
              aria-labelledby="finder-tab-presets"
            >
              <p className={styles.presetsHint}>
                One click applies a saved group of tags.
              </p>
              <div className={styles.presetList}>
                {visiblePresets().map((quiz) => {
                  const selected = filterPreset === quiz.preset;
                  return (
                    <button
                      key={quiz.preset}
                      type="button"
                      className={
                        selected
                          ? `${styles.preset} ${styles.presetOn}`
                          : styles.preset
                      }
                      aria-pressed={selected}
                      onClick={() =>
                        setFilterPreset(
                          selected ? PreSetQuizPreset.None : quiz.preset,
                        )
                      }
                    >
                      <Icon
                        name="bookmark"
                        size="inline"
                        tone={selected ? 'onAction' : 'muted'}
                      />
                      {quiz.preset}
                      <span className={styles.presetCount}>
                        {tagCountLabel(quiz.SkillTagKeys.length)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardSection>

        <CardFooterStrip>
          <Toggle
            id="finder-exclude-spanglish"
            checked={excludeSpanglish}
            onChange={updateExcludeSpanglish}
            label="Exclude Spanglish"
          />
          <Toggle
            id="finder-audio-only"
            checked={audioOnly}
            onChange={updateAudioOnly}
            label="Audio flashcards only"
          />
        </CardFooterStrip>
      </Card>
    </div>
  );
}
