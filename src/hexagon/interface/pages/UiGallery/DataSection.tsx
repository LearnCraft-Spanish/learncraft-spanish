import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons';
import { Checkbox } from '@interface/components/general/Checkbox';
import { Chip } from '@interface/components/general/Chip';
import { DataTable } from '@interface/components/general/DataTable';
import { EmptyState } from '@interface/components/general/EmptyState';
import { IconButton } from '@interface/components/general/IconButton';
import { PaginationV2 } from '@interface/components/general/PaginationV2';
import {
  GallerySection,
  GallerySpecimen,
  GallerySpecimens,
} from '@interface/pages/UiGallery/GallerySection';
import { useState } from 'react';
import styles from './UiGallery.module.scss';

const COLUMN_TEMPLATE = '44px 1fr 1fr 44px';

/**
 * Below 768px the two text columns stack while the checkbox and chevron stay
 * put, spanning both lines.
 */
const MOBILE_LAYOUT = {
  columnTemplate: '44px 1fr 44px',
  templateAreas: '"select spanish expand" "select english expand"',
};

const COLUMNS = [
  { id: 'select', header: '', mobileArea: 'select' },
  { id: 'spanish', header: 'Spanish', mobileArea: 'spanish' },
  { id: 'english', header: 'English', mobileArea: 'english' },
  { id: 'expand', header: '', mobileArea: 'expand' },
];

export function DataSection(): JSX.Element {
  const [selectedChip, setSelectedChip] = useState(false);
  const [selectedRow, setSelectedRow] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(5);

  return (
    <>
      <GallerySection title="Chip">
        <GallerySpecimens>
          <GallerySpecimen label="static label">
            <Chip label="verbs" />
          </GallerySpecimen>
          <GallerySpecimen label="removable filter">
            <Chip label="verbs" onRemove={() => {}} />
          </GallerySpecimen>
          <GallerySpecimen label="selectable">
            <Chip
              label="Beginner verbs"
              selected={selectedChip}
              onSelect={() => setSelectedChip((on) => !on)}
            />
          </GallerySpecimen>
          <GallerySpecimen label="selected">
            <Chip label="Beginner verbs" selected onSelect={() => {}} />
          </GallerySpecimen>
          <GallerySpecimen label="icon + label">
            <Chip label="Audio" icon="volume" tone="action" />
          </GallerySpecimen>
          <GallerySpecimen label="warning tone">
            <Chip label="Custom" tone="warning" />
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Data table">
        <p className={styles.note}>
          Narrow the window past 768px to see the reflow: Spanish and English
          stack, the checkbox and chevron stay.
        </p>
        <DataTable
          caption="Example search results"
          columnTemplate={COLUMN_TEMPLATE}
          mobileLayout={MOBILE_LAYOUT}
          columns={COLUMNS}
          rows={[
            {
              id: 'a',
              selected: selectedRow,
              cells: [
                <Checkbox
                  key="c"
                  id="g-row-a"
                  checked={selectedRow}
                  onChange={setSelectedRow}
                  label="Select Como tacos"
                  labelHidden
                />,
                'Como tacos todos los días',
                'I eat tacos every day',
                <IconButton
                  key="e"
                  icon={expanded ? 'chevronUp' : 'chevronDown'}
                  label={expanded ? 'Collapse row' : 'Expand row'}
                  onClick={() => setExpanded((open) => !open)}
                />,
              ],
              expanded,
              expandPanel: <span>Vocabulary: comer, taco, día</span>,
            },
            {
              id: 'b',
              cells: [
                <Checkbox
                  key="c"
                  id="g-row-b"
                  checked={false}
                  onChange={() => {}}
                  label="Select Bebo agua"
                  labelHidden
                />,
                'Bebo agua fría',
                'I drink cold water',
                <IconButton key="e" icon="chevronDown" label="Expand row" />,
              ],
            },
          ]}
        />
      </GallerySection>

      <GallerySection title="Data table — empty">
        <DataTable
          caption="Example search results, empty"
          columnTemplate={COLUMN_TEMPLATE}
          mobileLayout={MOBILE_LAYOUT}
          columns={COLUMNS}
          rows={[]}
          emptyState={
            <EmptyState
              icon="searchOff"
              title="No examples match these filters"
              guidance="Try widening the lesson range, or remove a tag to see more."
              action={
                <Button variant="secondary" size="sm">
                  Reset all filters
                </Button>
              }
            />
          }
        />
      </GallerySection>

      <GallerySection title="Pagination">
        <GallerySpecimens>
          <GallerySpecimen label="interactive, 10 pages">
            <PaginationV2
              page={page}
              pageCount={10}
              onPageChange={setPage}
              rangeLabel="101–125 of 250"
            />
          </GallerySpecimen>
          <GallerySpecimen label="first page">
            <PaginationV2 page={1} pageCount={10} onPageChange={() => {}} />
          </GallerySpecimen>
          <GallerySpecimen label="last page">
            <PaginationV2 page={10} pageCount={10} onPageChange={() => {}} />
          </GallerySpecimen>
          <GallerySpecimen label="single page">
            <PaginationV2 page={1} pageCount={1} onPageChange={() => {}} />
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>
    </>
  );
}
