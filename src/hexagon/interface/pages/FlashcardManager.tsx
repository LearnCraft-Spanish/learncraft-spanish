import useFlashcardManager from '@application/useCases/useFlashcardManager';
import Loading from 'src/components/Loading/Loading';
import FlashcardManagerFilters from '../components/FlashcardManager';
import { FlashcardTable } from '../components/Tables';
export default function FlashcardManager() {
  const {
    filteredFlashcards,
    paginationState,
    filtersEnabled,
    toggleFilters,
    exampleFilter,
    isLoading,
    isLoadingPartial,
    error,
    errorPartial,
    lessonPopup,
    findMore,
  } = useFlashcardManager();

  const { filterState, skillTagSearch } = exampleFilter;

  if (isLoading) {
    return <Loading message="Loading Flashcard Manager" />;
  }
  if (error) {
    return <h2>Error Loading Flashcard Manager</h2>;
  }

  return (
    <div>
      <h2>Flashcard Manager</h2>
      <FlashcardManagerFilters
        filterState={filterState}
        skillTagSearch={skillTagSearch}
        filtersEnabled={filtersEnabled}
        toggleFilters={toggleFilters}
      />
      <FlashcardTable
        findMore={findMore}
        isLoading={isLoadingPartial}
        error={errorPartial}
        dataSource={filteredFlashcards}
        paginationState={paginationState}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
