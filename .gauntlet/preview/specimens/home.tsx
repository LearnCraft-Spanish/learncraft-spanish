import type { JSX } from 'react';
import { DEFAULT_HOME_PRESET } from '@domain/homePresets/homePresets';
import { HomeV2Loaded } from '@interface/pages/Home/HomeV2';

/**
 * Auth0-free specimen for the Home v2 redesign loop. Mounts the real
 * presentational tree (`HomeV2Loaded`) with the default home preset —
 * no use case, no adapters. `useNavigate` comes from `PreviewProviders`'
 * `MemoryRouter`.
 *
 * `AppHeader` / `PrimaryTabBar` chrome is deliberately not mounted here.
 * The bar capture (`capture-bar.mjs`) crops the design frame's header out
 * before writing `*-body.png`, and sizes the app capture's viewport to
 * that same header-stripped height — so a faithful comparison means
 * capturing `HomeV2Loaded`'s body alone, exactly as the `text-quiz`
 * specimen captures `TextQuizV2` alone.
 *
 * Design bar (outside repo): ~/Downloads/handoff/
 */
export function HomeSpecimen(): JSX.Element {
  return (
    <div data-gauntlet-specimen="home">
      <HomeV2Loaded
        cta={DEFAULT_HOME_PRESET.cta}
        entries={DEFAULT_HOME_PRESET.entries}
      />
    </div>
  );
}
