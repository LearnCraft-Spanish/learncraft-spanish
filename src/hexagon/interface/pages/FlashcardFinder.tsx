import Loading from 'src/components/Loading/Loading';
import useFlashcardFinder from 'src/hexagon/application/useCases/useFlashcardFinder';
import FlashcardFinderFilter from '../components/FlashcardFinder/FlashcardFinderFilter';
import ExampleTable from '../components/Tables/ExampleTable';

export default function FlashcardFinder() {
  const {
    exampleFilter,
    exampleQuery,
    displayExamples,
    flashcardsQuery,
    pagination,
    filtersChanging,
    setFiltersChanging,
    lessonPopup,
    manageThese,
  } = useFlashcardFinder();

  const { filterState, skillTagSearch } = exampleFilter;

  if (exampleFilter.initialLoading) {
    return <Loading message="Loading Flashcard Finder" />;
  }

  return (
    <div>
      <FlashcardFinderFilter
        filterState={filterState}
        skillTagSearch={skillTagSearch}
        filtersChanging={filtersChanging}
        setFiltersChanging={setFiltersChanging}
      />
      {!filtersChanging && (
        <ExampleTable
          examples={displayExamples}
          totalCount={exampleQuery.totalCount ?? 0}
          studentFlashcards={flashcardsQuery}
          paginationState={pagination}
          fetchingExamples={exampleQuery.isLoading}
          lessonPopup={lessonPopup}
          manageThese={manageThese}
        />
      )}
    </div>
  );
}
