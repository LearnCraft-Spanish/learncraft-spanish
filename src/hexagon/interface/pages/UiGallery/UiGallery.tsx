import type { JSX } from 'react';
import { useUiFlag } from '@application/useCases/useUiFlag';
import { PageShell } from '@interface/components/general/PageShell';
import { DataSection } from '@interface/pages/UiGallery/DataSection';
import { FormsSection } from '@interface/pages/UiGallery/FormsSection';
import { IconsSection } from '@interface/pages/UiGallery/IconsSection';
import { OverlaysSection } from '@interface/pages/UiGallery/OverlaysSection';
import { SurfacesSection } from '@interface/pages/UiGallery/SurfacesSection';
import { TokensSection } from '@interface/pages/UiGallery/TokensSection';
import styles from './UiGallery.module.scss';

/**
 * Development-only gallery of the v2 design primitives. Gated behind
 * `ui.dev.gallery`; enable with `VITE_UI_FLAGS=ui.dev.gallery`.
 */
export default function UiGallery(): JSX.Element | null {
  const { enabled } = useUiFlag('ui.dev.gallery');

  if (!enabled) {
    return null;
  }

  return (
    <PageShell>
      <h1 className={styles.title}>Design system v2</h1>
      <p className={styles.intro}>
        Every primitive in `interface/components/general/` that the student v2
        surfaces are built from, with each variant and state.
      </p>
      <TokensSection />
      <IconsSection />
      <SurfacesSection />
      <FormsSection />
      <OverlaysSection />
      <DataSection />
    </PageShell>
  );
}
