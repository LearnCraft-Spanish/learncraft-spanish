import type { UseVocabLookupResult } from '@application/useCases/useVocabLookup';
import type { JSX } from 'react';
import useVocabLookup from '@application/useCases/useVocabLookup';
import { SetupHeader } from '@interface/components/customQuiz/SetupHeader';
import { Icon } from '@interface/components/general/Icon/Icon';
import { PageShell } from '@interface/components/general/PageShell/PageShell';
import { VocabSearchCard } from '@interface/components/getHelp/VocabSearchCard';
import { useNavigate } from 'react-router-dom';
import styles from './VocabLookupV2.module.scss';

export interface VocabLookupV2LoadedProps {
  lookup: UseVocabLookupResult;
}

/**
 * Presentational tree, no adapters -- exported so the gauntlet specimen
 * (`.gauntlet/preview/specimens/vocab-lookup.tsx`) can mount the real
 * markup with a fixture `lookup` instead of duplicating it.
 *
 * `back` sits outside `.measure` so it stays flush with `PageShell`'s full
 * 1240 column instead of shrinking/centering with the narrower tool below --
 * the eyebrow/title/caption and the search card share `.measure`'s max
 * width and are centered on the page together, but text inside stays left
 * aligned (see VocabLookupV2.module.scss).
 */
export function VocabLookupV2Loaded({
  lookup,
}: VocabLookupV2LoadedProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className={styles.page}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate('/get-help')}
        >
          <Icon name="arrowLeft" />
          Help & walkthroughs
        </button>
        <div className={styles.measure}>
          <SetupHeader
            eyebrow="Get help"
            title="Vocab lookup"
            caption="Search a word or idiom to see where it is taught."
          />
          {lookup.error !== null && (
            <p className={styles.error}>{lookup.error.message}</p>
          )}
          <VocabSearchCard
            searchTerm={lookup.tagSearchTerm}
            suggestions={lookup.tagSuggestions}
            onSearchTermChange={lookup.updateTagSearchTerm}
            onSelectTag={lookup.selectTag}
            selectedVocabulary={lookup.selectedVocabulary}
            selectionLoading={lookup.selectionLoading}
            panelOpen={lookup.panelOpen}
            onClosePanel={lookup.closePanel}
            onToggleWordPanel={lookup.toggleWordPanel}
            vocabInfoHook={lookup.vocabInfoHook}
            onClearSelection={lookup.clearSelection}
          />
        </div>
      </div>
    </PageShell>
  );
}

/**
 * v2 vocab lookup at `/get-help/vocab`. One use-case hook (`useVocabLookup`).
 */
export function VocabLookupV2(): JSX.Element {
  const lookup = useVocabLookup();

  return <VocabLookupV2Loaded lookup={lookup} />;
}

export default VocabLookupV2;
