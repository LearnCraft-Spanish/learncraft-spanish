import type { JSX } from 'react';
import { Badge } from '@interface/components/general/Badge';
import { Button } from '@interface/components/general/Buttons';
import {
  Card,
  CardFooterStrip,
  CardSection,
  CardSectionHeader,
} from '@interface/components/general/Card';
import { Eyebrow } from '@interface/components/general/Eyebrow';
import {
  GallerySection,
  GallerySpecimen,
  GallerySpecimens,
} from '@interface/pages/UiGallery/GallerySection';
import styles from './UiGallery.module.scss';

export function SurfacesSection(): JSX.Element {
  return (
    <>
      <GallerySection title="Eyebrow">
        <GallerySpecimens>
          <GallerySpecimen label="label (default)">
            <Eyebrow>Scope · Required</Eyebrow>
          </GallerySpecimen>
          <GallerySpecimen label="muted">
            <Eyebrow tone="muted">Scope · Required</Eyebrow>
          </GallerySpecimen>
          <GallerySpecimen label="onDark">
            <div className={styles.darkSwatch}>
              <Eyebrow tone="onDark">Owned flashcards</Eyebrow>
            </div>
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Badge">
        <GallerySpecimens>
          <GallerySpecimen label="label (default)">
            <Badge>Admin only</Badge>
          </GallerySpecimen>
          <GallerySpecimen label="label, sm">
            <Badge size="sm">Admin only</Badge>
          </GallerySpecimen>
          <GallerySpecimen label="action">
            <Badge tone="action">Audio</Badge>
          </GallerySpecimen>
          <GallerySpecimen label="error">
            <Badge tone="error">Incomplete</Badge>
          </GallerySpecimen>
          <GallerySpecimen label="success">
            <Badge tone="success">Complete</Badge>
          </GallerySpecimen>
          <GallerySpecimen label="warning">
            <Badge tone="warning">Custom</Badge>
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Button — variants at size md">
        <GallerySpecimens>
          <GallerySpecimen label="primary">
            <Button>Collect flashcards</Button>
          </GallerySpecimen>
          <GallerySpecimen label="secondary">
            <Button variant="secondary" leadingIcon="bolt">
              Do more with these
            </Button>
          </GallerySpecimen>
          <GallerySpecimen label="ghost">
            <Button variant="ghost">Clear 3 tags</Button>
          </GallerySpecimen>
          <GallerySpecimen label="ghost, muted">
            <Button variant="ghost" muted>
              Reset all filters
            </Button>
          </GallerySpecimen>
          <GallerySpecimen label="destructive">
            <Button variant="destructive">Delete all Spanglish</Button>
          </GallerySpecimen>
          <GallerySpecimen label="primary, disabled">
            <Button disabled>Collect flashcards</Button>
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Button — sizes">
        <GallerySpecimens>
          <GallerySpecimen label="md (44px)">
            <Button size="md">Collect</Button>
          </GallerySpecimen>
          <GallerySpecimen label="sm (40px, in-row)">
            <Button size="sm">Collect</Button>
          </GallerySpecimen>
          <GallerySpecimen label="inline (text)">
            <Button size="inline" variant="ghost">
              View owned flashcards
            </Button>
          </GallerySpecimen>
          <GallerySpecimen label="with trailing icon">
            <Button variant="secondary" trailingIcon="chevronDown">
              Do more with these
            </Button>
          </GallerySpecimen>
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Button — on a dark surface">
        <div className={styles.darkPanel}>
          <Button tone="onDark">Collect flashcards</Button>
          <Button tone="onDark" variant="secondary">
            Change student
          </Button>
          <Button tone="onDark" variant="ghost">
            Clear selection
          </Button>
        </div>
      </GallerySection>

      <GallerySection title="Card">
        <Card>
          <CardSectionHeader
            eyebrow="Tags"
            action={
              <Button variant="ghost" size="inline">
                Clear 3 tags
              </Button>
            }
          />
          <CardSection>One click applies a saved group of tags.</CardSection>
          <CardSection divided>
            A second section, separated by a hairline.
          </CardSection>
          <CardFooterStrip>
            <span>Exclude Spanglish</span>
            <span>Audio flashcards only</span>
          </CardFooterStrip>
        </Card>
      </GallerySection>
    </>
  );
}
