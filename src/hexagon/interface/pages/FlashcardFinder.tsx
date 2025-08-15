import useFlashcardFinder from '@application/useCases/useFlashcardFinder';
import Loading from 'src/components/Loading/Loading';
import FlashcardFinderFilter from '../components/FlashcardFinder/FlashcardFinderFilter';
import { ExampleTable } from '../components/Tables';

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
          firstPageLoading={exampleQuery.isLoading && exampleQuery.page === 1}
          newPageLoading={exampleQuery.isLoading && exampleQuery.page > 1}
          lessonPopup={lessonPopup}
          manageThese={manageThese}
        />
      )}
    </div>
  );
}
