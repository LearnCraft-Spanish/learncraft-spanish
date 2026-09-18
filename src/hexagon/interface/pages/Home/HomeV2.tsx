import type { HomePresetCta, HomePresetEntry } from '@domain/homePresets/types';
import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { useHomeScreen } from '@application/useCases/useHomeScreen';
import { PrimaryTabBar } from '@interface/components/AppHeader/PrimaryTabBar';
import { Icon } from '@interface/components/general/Icon/Icon';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { EntryCard } from '@interface/components/home/EntryCard/EntryCard';
import { HelpRow } from '@interface/components/home/HelpRow/HelpRow';
import { QuizCTA } from '@interface/components/home/QuizCTA/QuizCTA';
import { Loading } from '@interface/components/Loading';
import { useNavigate } from 'react-router-dom';
import styles from './HomeV2.module.scss';

export interface HomeV2LoadedProps {
  cta: HomePresetCta;
  entries: readonly HomePresetEntry[];
}

/**
 * Presentational tree, no adapters — exported so the gauntlet specimen
 * (`.gauntlet/preview/specimens/home.tsx`) can mount the real markup with a
 * fixture preset instead of pulling in `useHomeScreen`.
 */
export function HomeV2Loaded({ cta, entries }: HomeV2LoadedProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className={styles.column}>
        <QuizCTA
          headline={cta.headline}
          eyebrow={cta.eyebrow}
          onGo={() => navigate(cta.path)}
        />

        <div className={styles.entries}>
          {entries.map((entry) => (
            <EntryCard
              key={entry.path}
              icon={entry.icon as IconName}
              title={entry.title}
              meta={entry.meta}
              onGo={() => navigate(entry.path)}
            />
          ))}
        </div>

        <div className={styles.footer}>
          <HelpRow onGo={() => navigate('/get-help')} />
          <a
            className={styles.feedbackLink}
            href="mailto:info@learncraftspanish.com"
          >
            give feedback / report a bug
            <Icon name="chevronRight" size="inline" tone="inherit" />
          </a>
        </div>
      </div>
    </PageShell>
  );
}

/**
 * The student v2 home screen. One responsive tree: the CTA is always the
 * first child of the scrolling column, followed by the preset's entry list
 * and a footer with help plus a beta-tester feedback mailto. Which CTA and
 * entries appear is resolved by `useHomeScreen` from the student's course
 * and lesson.
 *
 * The mobile tab bar lives here (not in `App.tsx`) so it only exists on
 * Home and rides out with this page during stack transitions.
 */
export function HomeV2(): JSX.Element {
  const { cta, entries, isLoading } = useHomeScreen();

  return (
    <div className={styles.homeShell}>
      {isLoading ? (
        <PageShell>
          <Loading message="Loading home..." />
        </PageShell>
      ) : (
        <HomeV2Loaded cta={cta} entries={entries} />
      )}
      <PrimaryTabBar />
    </div>
  );
}
