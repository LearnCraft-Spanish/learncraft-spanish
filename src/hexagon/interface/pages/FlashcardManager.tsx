import Loading from 'src/components/Loading/Loading';
import useFlashcardManager from 'src/hexagon/application/useCases/useFlashcardManager';
import FlashcardFinderFilter from '../components/FlashcardFinder/FlashcardFinderFilter';
import FlashcardTable from '../components/Tables/FlashcardTable';

export default function FlashcardManager() {
  const { exampleFilter, allFlashcards, paginationState } =
    useFlashcardManager();

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
        <FlashcardTable
          dataSource={allFlashcards ?? []}
          paginationState={paginationState}
        />
      ) : (
        <div>
          Please press "Get Examples" or "close without saving" to see results
        </div>
      )}
    </div>
  );
}
