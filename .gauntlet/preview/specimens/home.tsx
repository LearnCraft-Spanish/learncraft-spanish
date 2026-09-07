import type { JSX } from 'react';
import { HomeV2 } from '@interface/pages/Home/HomeV2';

/**
 * Auth0-free specimen for the Home v2 redesign loop, wired to the real
 * `HomeV2` presentational tree — no fixtures needed. `HomeV2` is entirely
 * static/presentational (only `useNavigate`, already supplied by
 * `PreviewProviders`' `MemoryRouter`); it renders `QuizCTA`, `EntryCard`,
 * and `HelpRow` with the same copy as production.
 *
 * `AppHeader` / `PrimaryTabBar` chrome is deliberately not mounted here.
 * The bar capture (`capture-bar.mjs`) crops the design frame's header out
 * before writing `*-body.png`, and sizes the app capture's viewport to
 * that same header-stripped height — so a faithful comparison means
 * capturing `HomeV2`'s body alone, exactly as the `text-quiz` specimen
 * captures `TextQuizV2` alone.
 *
 * Design bar (outside repo): ~/Downloads/handoff/
 */
export function HomeSpecimen(): JSX.Element {
  return (
    <div data-gauntlet-specimen="home">
      <HomeV2 />
    </div>
  );
}
