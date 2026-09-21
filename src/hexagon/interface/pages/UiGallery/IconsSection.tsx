import type { IconName } from '@interface/components/general/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon';
import { IconButton } from '@interface/components/general/IconButton';
import { IconTile } from '@interface/components/general/IconTile';
import {
  GallerySection,
  GallerySpecimen,
  GallerySpecimens,
} from '@interface/pages/UiGallery/GallerySection';

const ALL_ICONS: IconName[] = [
  'bell',
  'bolt',
  'bookmark',
  'brain',
  'check',
  'checklist',
  'chevronDown',
  'chevronLeft',
  'chevronRight',
  'chevronUp',
  'clipboard',
  'clipboardCopy',
  'filter',
  'language',
  'plus',
  'search',
  'searchOff',
  'user',
  'userStar',
  'volume',
  'x',
];

export function IconsSection(): JSX.Element {
  return (
    <>
      <GallerySection title="Icons — registered set">
        <GallerySpecimens>
          {ALL_ICONS.map((name) => (
            <GallerySpecimen key={name} label={name}>
              <Icon name={name} size="lg" tone="muted" />
            </GallerySpecimen>
          ))}
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Icons — size and tone">
        <GallerySpecimens>
          <GallerySpecimen label="inline 14">
            <Icon name="volume" size="inline" />
          </GallerySpecimen>
          <GallerySpecimen label="sm 16">
            <Icon name="volume" size="sm" />
          </GallerySpecimen>
          <GallerySpecimen label="md 18">
            <Icon name="volume" size="md" />
          </GallerySpecimen>
          <GallerySpecimen label="lg 22">
            <Icon name="volume" size="lg" />
          </GallerySpecimen>
          <GallerySpecimen label="action">
            <Icon name="volume" size="lg" tone="action" />
          </GallerySpecimen>
          <GallerySpecimen label="muted">
            <Icon name="volume" size="lg" tone="muted" />
          </GallerySpecimen>
          <GallerySpecimen label="label">
            <Icon name="volume" size="lg" tone="label" />
          </GallerySpecimen>
          <GallerySpecimen label="steel">
            <Icon name="volume" size="lg" tone="steel" />
          </GallerySpecimen>
          <GallerySpecimen label="error">
            <Icon name="volume" size="lg" tone="error" />
          </GallerySpecimen>
          <GallerySpecimen label="warning">
            <Icon name="volume" size="lg" tone="warning" />
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Icon button">
        <GallerySpecimens>
          <GallerySpecimen label="bare, muted">
            <IconButton icon="chevronDown" label="Expand row" />
          </GallerySpecimen>
          <GallerySpecimen label="bare, action">
            <IconButton icon="chevronUp" label="Collapse row" tone="action" />
          </GallerySpecimen>
          <GallerySpecimen label="outlined">
            <IconButton
              icon="chevronLeft"
              variant="outlined"
              label="Previous page"
            />
          </GallerySpecimen>
          <GallerySpecimen label="outlined, disabled">
            <IconButton
              icon="chevronLeft"
              variant="outlined"
              label="Previous page, unavailable"
              disabled
            />
          </GallerySpecimen>
          <GallerySpecimen label="toggle, off">
            <IconButton icon="volume" label="Play Spanish" active={false} />
          </GallerySpecimen>
          <GallerySpecimen label="toggle, on">
            <IconButton icon="volume" label="Stop Spanish" active />
          </GallerySpecimen>
          <GallerySpecimen label="size sm">
            <IconButton icon="x" label="Remove tag" size="sm" iconSize="sm" />
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Icon tile">
        <GallerySpecimens>
          <GallerySpecimen label="action">
            <IconTile icon="filter" />
          </GallerySpecimen>
          <GallerySpecimen label="label">
            <IconTile icon="language" tone="label" />
          </GallerySpecimen>
          <GallerySpecimen label="warning">
            <IconTile icon="userStar" tone="warning" />
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>
    </>
  );
}
