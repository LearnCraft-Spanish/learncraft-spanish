import type { JSX, ReactNode } from 'react';
import styles from './UiGallery.module.scss';

interface GallerySectionProps {
  title: string;
  children: ReactNode;
}

export function GallerySection({
  title,
  children,
}: GallerySectionProps): JSX.Element {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

interface GallerySpecimenProps {
  label: string;
  children: ReactNode;
}

export function GallerySpecimen({
  label,
  children,
}: GallerySpecimenProps): JSX.Element {
  return (
    <div className={styles.specimen}>
      <span className={styles.specimenLabel}>{label}</span>
      {children}
    </div>
  );
}

interface GallerySpecimensProps {
  children: ReactNode;
}

export function GallerySpecimens({
  children,
}: GallerySpecimensProps): JSX.Element {
  return <div className={styles.specimens}>{children}</div>;
}
