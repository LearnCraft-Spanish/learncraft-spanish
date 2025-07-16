import useFlashcardFinder from 'src/hexagon/application/useCases/useFlashcardFinder';
import FlashcardFinderFilter from '../components/FlashcardFinder/FlashcardFinderFilter';
import FlashcardFinderResults from '../components/FlashcardFinder/FlashcardFinderResults';

export default function FlashcardFinder() {
  const { exampleFilter, exampleQuery, flashcardsQuery, totalPages, pageSize } =
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
        totalCount={exampleQuery.totalCount}
        pageSize={pageSize}
      />
    </div>
  );
}
