import type { JSX } from 'react';
import { VocabLookupV2Loaded } from '@interface/pages/GetHelp/VocabLookup/VocabLookupV2';
import {
  SUGGESTIONS,
  VOCABULARY,
  vocabInfoHook,
} from './vocab-lookup.fixtures';

/**
 * Auth0-free specimen for vocab lookup. Mounts the real presentational tree
 * (`VocabLookupV2Loaded`, no adapters) with a fixture `lookup` object -- no
 * use case, no adapters. Query `state`:
 * - `empty` (default): search field only
 * - `results`: suggestion sheet open
 * - `detail`: selected word chip + panel / modal
 */
export function VocabLookupSpecimen(): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const state = params.get('state') ?? 'empty';

  const searchTerm = state === 'results' ? 'cuan' : '';
  const suggestions = state === 'results' ? SUGGESTIONS : [];
  const selectedVocabulary = state === 'detail' ? VOCABULARY : null;

  return (
    <div data-gauntlet-specimen="vocab-lookup">
      <VocabLookupV2Loaded
        lookup={{
          tagSearchTerm: searchTerm,
          tagSuggestions: suggestions,
          updateTagSearchTerm: () => undefined,
          selectTag: () => undefined,
          clearSelection: () => undefined,
          selectedVocabulary,
          selectionLoading: false,
          panelOpen: state === 'detail',
          closePanel: () => undefined,
          toggleWordPanel: () => undefined,
          vocabInfoHook,
          isLoading: false,
          error: null,
        }}
      />
    </div>
  );
}
