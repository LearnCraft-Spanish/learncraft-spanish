import type { JSX } from 'react';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { EntryCard } from '@interface/components/home/EntryCard/EntryCard';
import { useNavigate } from 'react-router-dom';
import styles from './GetHelpV2.module.scss';

/** Placeholder until the real walkthrough videos are ready. */
const GETTING_STARTED_VIDEO_URL = 'https://www.google.com';
const FLASHCARD_FINDER_VIDEO_URL = 'https://www.google.com';

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
            meta="Details and lessons that teach a word"
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
            title="Flashcard finder & custom quizzing"
            meta="Short video guide"
            href={FLASHCARD_FINDER_VIDEO_URL}
          />
        </div>
      </div>
    </PageShell>
  );
}

export default GetHelpV2;
