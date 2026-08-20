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

const TAG_PLACEHOLDER = 'Search tags — grammar, vocabulary, verb form…';
const SUGGESTION_CAP = 6;
const EMPTY_TAGS_COPY =
  'No tags applied. Results cover every flashcard in the lesson range.';

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
      return tag.frequency != null ? 'frequency' : 'vocabulary';
    case SkillType.Idiom:
      return 'vocabulary';
    case SkillType.Subcategory:
      return 'grammar';
    case SkillType.Verb:
    case SkillType.Conjugation:
      return 'verb form';
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
  const regular =
    toLessonNumber === null
      ? []
      : course.lessons.filter(
          (lesson) => lesson.lessonNumber <= toLessonNumber,
        );
  return [...virtualLessons(course), ...regular].map((lesson) => ({
    value: String(lesson.lessonNumber),
    label: lessonLabel(lesson),
  }));
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

  const start = startFromLesson(course);
  const [useStartingLesson, setUseStartingLesson] = useState(
    () =>
      fromLessonNumber !== null &&
      start !== null &&
      fromLessonNumber !== start.lessonNumber,
  );

  const appliedKeys = new Set(selectedSkillTags.map((tag) => tag.key));
  const suggestions = skillTagSearch.tagSuggestions
    .filter((tag) => !appliedKeys.has(tag.key))
    .slice(0, SUGGESTION_CAP);
  const searchOpen = skillTagSearch.tagSearchTerm.trim().length > 0;
  const hasTags = selectedSkillTags.length > 0;
  const startReadoutLabel = start
    ? `${lessonLabel(start)} — from the start`
    : '';

  function changeFromLesson(value: string): void {
    updateFromLessonNumber(Number.parseInt(value, 10));
  }

  function changeToLesson(value: string): void {
    updateToLessonNumber(Number.parseInt(value, 10));
  }

  function changeCourse(value: string): void {
    updateUserSelectedCourseId(Number.parseInt(value, 10));
  }

  return (
    <div className={styles.root}>
      <Card>
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
                setUseStartingLesson(false);
                onResetAll?.();
              }}
            >
              Reset all filters
            </Button>
          </span>
        </div>

        <CardSection>
          <div className={styles.scopeGrid}>
            <Field htmlFor="finder-course" label="Course">
              <Select
                id="finder-course"
                value={courseId !== null ? String(courseId) : ''}
                options={courseOptions(exampleFilter)}
                onChange={changeCourse}
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

            <div className={styles.startLesson}>
              <Toggle
                id="finder-set-start"
                checked={useStartingLesson}
                onChange={(checked) => {
                  setUseStartingLesson(checked);
                  if (!checked && start) {
                    updateFromLessonNumber(start.lessonNumber);
                  }
                }}
                label="Set a starting lesson"
              />
            </div>

            <div className={styles.fromLesson}>
              {useStartingLesson ? (
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
              ) : (
                <>
                  <span className={styles.fromLessonLabel}>From lesson</span>
                  <div className={styles.fromLessonPlate}>
                    {startReadoutLabel}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardSection>

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

        <CardSection divided>
          <div className={styles.tagsHeader}>
            <Eyebrow as="h3" weight="regular" leading="body">
              Tags
            </Eyebrow>
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
                <div className={styles.noSuggestions}>No tags match that.</div>
              ) : (
                <ul className={styles.suggestions} role="listbox">
                  {suggestions.map((tag) => (
                    <li key={tag.key}>
                      <button
                        type="button"
                        className={styles.suggestion}
                        role="option"
                        onClick={() => {
                          addSkillTagToFilters(tag.key);
                          skillTagSearch.removeTagFromSuggestions(tag.key);
                          setTagQuery(skillTagSearch.updateTagSearchTerm, '');
                        }}
                      >
                        <span>{tagLabel(tag)}</span>
                        <span className={styles.suggestionMeta}>
                          {tagCategory(tag)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Popover>
          </div>

          {hasTags ? (
            <div className={styles.appliedTags}>
              {selectedSkillTags.map((tag) => (
                <Chip
                  key={tag.key}
                  label={tagLabel(tag)}
                  tone="action"
                  onRemove={() => {
                    removeSkillTagFromFilters(tag.key);
                    skillTagSearch.addTagBackToSuggestions(tag.key);
                  }}
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyTags}>{EMPTY_TAGS_COPY}</p>
          )}

          <div className={styles.presets}>
            <div className={styles.presetsHeader}>
              <Eyebrow weight="regular" leading="body">
                Presets
              </Eyebrow>
              <p className={styles.presetsHint}>
                One click applies a saved group of tags.
              </p>
            </div>
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
