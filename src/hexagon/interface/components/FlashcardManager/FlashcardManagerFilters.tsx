import { ToggleSwitch } from '@interface/components/general';

import FilterPanel from '../Filters/FilterPanel';
import 'src/App.css';
import './FlashcardManagerFilters.scss';

export default function FlashcardManagerFilters({
  filterOwnedFlashcards,
  setFilterOwnedFlashcards,
}: {
  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
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
      {filterOwnedFlashcards && <FilterPanel requireAudioOnly={false} />}
    </div>
  );
}
