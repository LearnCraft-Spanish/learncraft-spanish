import type { JSX } from 'react';
import {
  GallerySection,
  GallerySpecimen,
  GallerySpecimens,
} from '@interface/pages/UiGallery/GallerySection';
import styles from './UiGallery.module.scss';

const COLOR_TOKENS = [
  '--lcs-color-action',
  '--lcs-color-action-hover',
  '--lcs-color-page',
  '--lcs-color-surface',
  '--lcs-color-surface-dark',
  '--lcs-color-ink',
  '--lcs-color-muted',
  '--lcs-color-placeholder',
  '--lcs-color-steel',
  '--lcs-color-label',
  '--lcs-color-on-label',
  '--lcs-color-error',
  '--lcs-color-success',
  '--lcs-color-warning',
  '--lcs-color-warning-ink',
  '--lcs-tint-action',
  '--lcs-tint-hover',
  '--lcs-tint-row-selected',
  '--lcs-tint-label-subtle',
  '--lcs-tint-label',
  '--lcs-tint-label-strong',
  '--lcs-tint-warning',
  '--lcs-divider',
  '--lcs-border-card',
  '--lcs-border-control',
  '--lcs-border-checkbox',
];

const SPACE_TOKENS = [
  '--lcs-space-1',
  '--lcs-space-2',
  '--lcs-space-3',
  '--lcs-space-4',
  '--lcs-space-5',
  '--lcs-space-6',
  '--lcs-space-7',
  '--lcs-space-8',
  '--lcs-space-9',
  '--lcs-space-10',
  '--lcs-space-11',
];

const RADIUS_TOKENS = [
  '--lcs-radius-sm',
  '--lcs-radius-md',
  '--lcs-radius-lg',
  '--lcs-radius-xl',
  '--lcs-radius-pill',
];

const TEXT_TOKENS = [
  '--lcs-text-display',
  '--lcs-text-h1',
  '--lcs-text-h2',
  '--lcs-text-h3',
  '--lcs-text-body',
  '--lcs-text-control',
  '--lcs-text-action',
  '--lcs-text-caption',
  '--lcs-text-chip',
  '--lcs-text-eyebrow',
  '--lcs-text-badge',
];

const SHADOW_TOKENS = [
  '--lcs-shadow-lift',
  '--lcs-shadow-popover',
  '--lcs-shadow-menu',
];

export function TokensSection(): JSX.Element {
  return (
    <>
      <GallerySection title="Color">
        <div className={styles.swatches}>
          {COLOR_TOKENS.map((token) => (
            <div className={styles.swatch} key={token}>
              <div
                className={styles.swatchChip}
                style={{ backgroundColor: `var(${token})` }}
              />
              <span className={styles.swatchName}>{token}</span>
            </div>
          ))}
        </div>
      </GallerySection>

      <GallerySection title="Space">
        <div className={styles.scale}>
          {SPACE_TOKENS.map((token) => (
            <div className={styles.scaleRow} key={token}>
              <span className={styles.scaleName}>{token}</span>
              <div
                className={styles.scaleBar}
                style={{ width: `var(${token})` }}
              />
            </div>
          ))}
        </div>
      </GallerySection>

      <GallerySection title="Radius">
        <GallerySpecimens>
          {RADIUS_TOKENS.map((token) => (
            <GallerySpecimen key={token} label={token}>
              <div
                className={styles.radiusBox}
                style={{ borderRadius: `var(${token})` }}
              />
            </GallerySpecimen>
          ))}
        </GallerySpecimens>
      </GallerySection>

      <GallerySection title="Type scale">
        <div className={styles.scale}>
          {TEXT_TOKENS.map((token) => (
            <div className={styles.scaleRow} key={token}>
              <span className={styles.scaleName}>{token}</span>
              <span style={{ fontSize: `var(${token})` }}>
                Los perros comen tacos
              </span>
            </div>
          ))}
        </div>
      </GallerySection>

      <GallerySection title="Elevation">
        <GallerySpecimens>
          {SHADOW_TOKENS.map((token) => (
            <GallerySpecimen key={token} label={token}>
              <div
                className={styles.radiusBox}
                style={{ boxShadow: `var(${token})` }}
              />
            </GallerySpecimen>
          ))}
        </GallerySpecimens>
      </GallerySection>
    </>
  );
}
