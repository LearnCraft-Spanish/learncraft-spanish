import type { JSX } from 'react';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { EntryCard } from '@interface/components/home/EntryCard/EntryCard';
import { useNavigate } from 'react-router-dom';
import styles from './GetHelpV2.module.scss';

/** Placeholder until the real walkthrough videos are ready. */
const GETTING_STARTED_VIDEO_URL = 'https://youtu.be/lwJnttax4ww';
const USING_SEARCH_FEATURES = 'https://youtu.be/BPesokkSv3E';
const RECOMMENDED_DAILY_ROUTINE = 'https://youtu.be/IGrrDC6bDrs';

/**
 * Help hub (v2): vocab lookup plus short video walkthroughs. No use-case
 * hook — this page only routes or opens external links.
 */
export function GetHelpV2(): JSX.Element {
  const navigate = useNavigate();

  const goToVocabLookup = (): void => navigate('/get-help/vocab');

  return (
    <PageShell>
      <div className={styles.column}>
        <h1 className={styles.title}>Help &amp; walkthroughs</h1>
        <div className={styles.entries}>
          <EntryCard
            icon="search"
            title="Vocab lookup"
            meta="Find what lessons teach a word"
            onGo={goToVocabLookup}
          />
          <EntryCard
            icon="playerPlay"
            title="Getting started with the app"
            meta="Short video guide"
            href={GETTING_STARTED_VIDEO_URL}
          />
          <EntryCard
            icon="playerPlay"
            title="Using search features"
            meta="Short video guide"
            href={USING_SEARCH_FEATURES}
          />
          <EntryCard
            icon="playerPlay"
            title="Recommended daily routine"
            meta="Short video guide"
            href={RECOMMENDED_DAILY_ROUTINE}
          />
        </div>
      </div>
    </PageShell>
  );
}

export default GetHelpV2;
