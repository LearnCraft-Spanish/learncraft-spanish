import { SectionHeader } from '@interface/components/general';
import { useState } from 'react';
import FilterPanel from 'src/hexagon/interface/components/Filters/FilterPanel';
import Instructions from './units/Instructions';
import './FlashcardFinder.scss';
import 'src/App.css';

export default function FlashcardFinderFilter({
  requireAudioOnly = false,
  requireNoSpanglish = false,
  closeable = true,
}: {
  requireAudioOnly?: boolean;
  requireNoSpanglish?: boolean;
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
      {filtersOpen && (
        <FilterPanel
          requireAudioOnly={requireAudioOnly}
          requireNoSpanglish={requireNoSpanglish}
        />
      )}
    </div>
  );
}
