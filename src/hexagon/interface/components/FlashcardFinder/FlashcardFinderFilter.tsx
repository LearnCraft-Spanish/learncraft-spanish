import FilterPanel from 'src/hexagon/interface/components/Filters/FilterPanel';
import './FlashcardFinder.scss';
import 'src/App.css';

export default function FlashcardFinderFilter({
  requireAudioOnly = false,
  requireNoSpanglish = false,
}: {
  requireAudioOnly?: boolean;
  requireNoSpanglish?: boolean;
}) {
  return (
    <div className="flashcardFinderFilter">
      <FilterPanel
        requireAudioOnly={requireAudioOnly}
        requireNoSpanglish={requireNoSpanglish}
      />
    </div>
  );
}
