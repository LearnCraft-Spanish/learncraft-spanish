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
    lessonPopup,
  } = useFlashcardManager();

  const { filterState, skillTagSearch } = exampleFilter;

  if (exampleFilter.initialLoading) {
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
        somethingIsLoading={somethingIsLoading}
        dataSource={filteredFlashcards}
        paginationState={paginationState}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
