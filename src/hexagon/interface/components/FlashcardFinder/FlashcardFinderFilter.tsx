import FilterPanel from '@interface/components/ExampleListItem/Filters/FilterPanel';
import { SectionHeader } from '@interface/components/general';
import { useState } from 'react';
import Instructions from './units/Instructions';
import './FlashcardFinder.scss';
import 'src/App.css';

export default function FlashcardFinderFilter({
  requireAudioOnly = false,
  closeable = true,
}: {
  requireAudioOnly?: boolean;
  closeable?: boolean;
}) {
  const [filtersOpen, setFiltersOpen] = useState(true);

  return (
    <div className="flashcardFinderFilter">
      {closeable && (
        <SectionHeader
          title="Flashcard Finder Filters"
          isOpen={filtersOpen}
          openFunction={() => setFiltersOpen(!filtersOpen)}
          button={<Instructions />}
          buttonAlwaysVisible
        />
      )}
      {filtersOpen && <FilterPanel requireAudioOnly={requireAudioOnly} />}
    </div>
  );
}
