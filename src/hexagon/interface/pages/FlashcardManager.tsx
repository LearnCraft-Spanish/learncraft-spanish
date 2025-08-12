import Loading from 'src/components/Loading/Loading';
import useFlashcardManager from 'src/hexagon/application/useCases/useFlashcardManager';
import FlashcardManagerFilters from '../components/FlashcardManagerFilters';
import FlashcardTable from '../components/Tables/FlashcardTable';
export default function FlashcardManager() {
  const {
    exampleFilter,
    filteredFlashcards,
    paginationState,
    filtersEnabled,
    toggleFilters,
    somethingIsLoading,
    initialLoading,
    lessonPopup,
    findMore,
  } = useFlashcardManager();

  const { filterState, skillTagSearch } = exampleFilter;

  if (initialLoading) {
    return <Loading message="Loading Flashcard Manager" />;
  }

  return (
    <div>
      <FlashcardManagerFilters
        filterState={filterState}
        skillTagSearch={skillTagSearch}
        filtersEnabled={filtersEnabled}
        toggleFilters={toggleFilters}
      />
      <FlashcardTable
        findMore={findMore}
        somethingIsLoading={somethingIsLoading}
        dataSource={filteredFlashcards}
        paginationState={paginationState}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
