import Loading from 'src/components/Loading/Loading';
import useFlashcardFinder from 'src/hexagon/application/useCases/useFlashcardFinder';
import FlashcardFinderFilter from '../components/FlashcardFinder/FlashcardFinderFilter';
import FlashcardFinderResults from '../components/FlashcardFinder/FlashcardFinderResults';

export default function FlashcardFinder() {
  const { exampleFilter, exampleQuery, flashcardsQuery, totalPages, pageSize } =
    useFlashcardFinder();

  const { filterState, skillTagSearch } = exampleFilter;

  if (exampleFilter.initialLoading) {
    return <Loading message="Loading Flashcard Finder" />;
  }

  return (
    <div>
      <FlashcardFinderFilter
        filterState={filterState}
        skillTagSearch={skillTagSearch}
      />
      {!filterState.filtersChanging ? (
        <FlashcardFinderResults
          filteredFlashcards={exampleQuery.filteredExamples}
          totalCount={exampleQuery.totalCount}
          pageSize={pageSize}
          fetchingExamples={exampleQuery.isLoading}
        />
      ) : (
        <div>
          Please press "Get Examples" or "close without saving" to see results
        </div>
      )}
    </div>
  );
}
