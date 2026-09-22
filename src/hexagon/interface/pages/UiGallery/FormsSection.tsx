import type { JSX } from 'react';
import { Checkbox } from '@interface/components/general/Checkbox';
import { Field } from '@interface/components/general/Field';
import { Select } from '@interface/components/general/Select';
import { TextInput } from '@interface/components/general/TextInput';
import { Toggle } from '@interface/components/general/Toggle';
import {
  GallerySection,
  GallerySpecimen,
  GallerySpecimens,
} from '@interface/pages/UiGallery/GallerySection';
import { useState } from 'react';

const LESSONS = [
  { value: '1', label: 'Lesson 1' },
  { value: '2', label: 'Lesson 2' },
  { value: '3', label: 'Lesson 3' },
];

export function FormsSection(): JSX.Element {
  const [lesson, setLesson] = useState('2');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(false);
  const [useFrom, setUseFrom] = useState(false);

  return (
    <>
      <GallerySection title="Field and Select">
        <GallerySpecimens>
          <GallerySpecimen label="default">
            <Field htmlFor="g-course" label="Course">
              <Select
                id="g-course"
                value={lesson}
                options={LESSONS}
                onChange={setLesson}
              />
            </Field>
          </GallerySpecimen>
          <GallerySpecimen label="emphasis (required)">
            <Field htmlFor="g-to" label="Through lesson">
              <Select
                id="g-to"
                value={lesson}
                options={LESSONS}
                onChange={setLesson}
                emphasis
              />
            </Field>
          </GallerySpecimen>
          <GallerySpecimen label="with hint">
            <Field htmlFor="g-hint" label="Course" hint="Scopes the search">
              <Select
                id="g-hint"
                value={lesson}
                options={LESSONS}
                onChange={setLesson}
              />
            </Field>
          </GallerySpecimen>
          <GallerySpecimen label="error">
            <Field htmlFor="g-err" label="Course" error="Course is required">
              <Select
                id="g-err"
                value={lesson}
                options={LESSONS}
                onChange={setLesson}
                invalid
              />
            </Field>
          </GallerySpecimen>
          <GallerySpecimen label="readout (toggle off)">
            <Field htmlFor="g-from" label="From lesson">
              <Select
                id="g-from"
                value={lesson}
                options={LESSONS}
                onChange={setLesson}
                readout
              />
            </Field>
          </GallerySpecimen>
          <GallerySpecimen label="disabled">
            <Field htmlFor="g-dis" label="Course">
              <Select
                id="g-dis"
                value={lesson}
                options={LESSONS}
                onChange={setLesson}
                disabled
              />
            </Field>
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Text input">
        <GallerySpecimens>
          <GallerySpecimen label="default">
            <Field htmlFor="g-text" label="Tag name">
              <TextInput id="g-text" value={query} onChange={setQuery} />
            </Field>
          </GallerySpecimen>
          <GallerySpecimen label="with leading icon">
            <Field htmlFor="g-search" label="Search tags">
              <TextInput
                id="g-search"
                type="search"
                value={query}
                onChange={setQuery}
                leadingIcon="search"
                placeholder="Search tags"
              />
            </Field>
          </GallerySpecimen>
          <GallerySpecimen label="invalid">
            <Field htmlFor="g-text-err" label="Tag name" error="Unknown tag">
              <TextInput
                id="g-text-err"
                value={query}
                onChange={setQuery}
                invalid
              />
            </Field>
          </GallerySpecimen>
          <GallerySpecimen label="disabled">
            <Field htmlFor="g-text-dis" label="Tag name">
              <TextInput
                id="g-text-dis"
                value={query}
                onChange={setQuery}
                disabled
              />
            </Field>
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Checkbox">
        <GallerySpecimens>
          <GallerySpecimen label="interactive">
            <Checkbox
              id="g-check"
              checked={selected}
              onChange={setSelected}
              label="Select this example"
            />
          </GallerySpecimen>
          <GallerySpecimen label="checked">
            <Checkbox
              id="g-check-on"
              checked
              onChange={() => {}}
              label="Checked"
            />
          </GallerySpecimen>
          <GallerySpecimen label="label hidden (table row)">
            <Checkbox
              id="g-check-bare"
              checked={selected}
              onChange={setSelected}
              label="Select row 1"
              labelHidden
            />
          </GallerySpecimen>
          <GallerySpecimen label="disabled">
            <Checkbox
              id="g-check-dis"
              checked={false}
              onChange={() => {}}
              label="Unavailable"
              disabled
            />
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Toggle">
        <GallerySpecimens>
          <GallerySpecimen label="interactive">
            <Toggle
              id="g-toggle"
              checked={useFrom}
              onChange={setUseFrom}
              label="Set a starting lesson"
            />
          </GallerySpecimen>
          <GallerySpecimen label="on">
            <Toggle
              id="g-toggle-on"
              checked
              onChange={() => {}}
              label="Exclude Spanglish"
            />
          </GallerySpecimen>
          <GallerySpecimen label="disabled">
            <Toggle
              id="g-toggle-dis"
              checked={false}
              onChange={() => {}}
              label="Audio flashcards only"
              disabled
            />
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>
    </>
  );
}
