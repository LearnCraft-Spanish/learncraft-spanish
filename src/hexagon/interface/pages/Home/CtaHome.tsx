import type { HomeCta, HomePresetEntry } from '@domain/homePresets/types';
import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { EntryCard } from '@interface/components/home/EntryCard/EntryCard';
import { QuizCTA } from '@interface/components/home/QuizCTA/QuizCTA';
import { useNavigate } from 'react-router-dom';
import styles from './CtaHome.module.scss';

interface CtaHomeProps {
  ctas: readonly HomeCta[];
  entries: readonly HomePresetEntry[];
}

/**
 * The limited and free home: headline-only CTAs, then any regular menu
 * options. No help row or tab bar, since those lead to tools these users
 * cannot open.
 */
export function CtaHome({ ctas, entries }: CtaHomeProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className={styles.column}>
        {ctas.map((cta) => (
          <QuizCTA
            key={cta.path}
            headline={cta.headline}
            onGo={() => navigate(cta.path)}
          />
        ))}
        {entries.length > 0 && (
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
        )}
      </div>
    </PageShell>
  );
}
