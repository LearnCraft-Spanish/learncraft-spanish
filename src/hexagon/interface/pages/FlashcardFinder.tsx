import useFlashcardFinderFilter from 'src/hexagon/application/units/useExampleFilter';
import FlashcardFinderFilter from '../components/FlashcardFinder/FlashcardFinderFilter';
import FlashcardFinderResults from '../components/FlashcardFinder/FlashcardFinderResults';
import useFlashcardFinder from 'src/hexagon/application/useCases/useFlashcardFinder';

export default function FlashcardFinder() {
  const { exampleFilter, exampleQuery, flashcardsQuery, totalPages } =
    useFlashcardFinder();

  const { filterState, skillTagSearch } = exampleFilter;

  return (
    <div>
      <FlashcardFinderFilter
        filterState={filterState}
        skillTagSearch={skillTagSearch}
      />
      <FlashcardFinderResults
        filteredFlashcards={exampleQuery.filteredExamples}
      />
    </div>
  );
}
