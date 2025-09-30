import { ToggleSwitch } from '@interface/components/general';

import FilterPanel from '../Filters/FilterPanel';
import 'src/App.css';
import './FlashcardManagerFilters.scss';

export default function FlashcardManagerFilters({
  filterOwnedFlashcards,
  setFilterOwnedFlashcards,
  requireNoSpanglish,
  requireAudioOnly,
}: {
  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
  requireNoSpanglish: boolean;
  requireAudioOnly: boolean;
}) {
  return (
    <div className="flashcardManagerFilters">
      <div className="ToggleFlashcardFilters">
        <ToggleSwitch
          id="filtersEnabled"
          ariaLabel="filtersEnabled"
          label="Flashcard Filtering: "
          checked={filterOwnedFlashcards}
          onChange={() => setFilterOwnedFlashcards(!filterOwnedFlashcards)}
        />
      </div>
      {filterOwnedFlashcards && (
        <FilterPanel
          requireAudioOnly={requireAudioOnly}
          requireNoSpanglish={requireNoSpanglish}
        />
      )}
    </div>
  );
}
