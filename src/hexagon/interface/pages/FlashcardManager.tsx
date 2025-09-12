import useFlashcardManager from '@application/useCases/useFlashcardManager';
import { Loading } from '@interface/components/Loading';
import FlashcardManagerFilters from '../components/FlashcardManager';
import { FlashcardTable } from '../components/Tables';
export default function FlashcardManager() {
  const {
    filteredFlashcards,
    paginationState,
    filterOwnedFlashcards,
    skillTagSearch,
    setFilterOwnedFlashcards,
    exampleFilter,
    isLoading,
    error,
    lessonPopup,
    findMore,
  } = useFlashcardManager();

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
        filterState={exampleFilter}
        skillTagSearch={skillTagSearch}
        filterOwnedFlashcards={filterOwnedFlashcards}
        setFilterOwnedFlashcards={setFilterOwnedFlashcards}
      />
      <FlashcardTable
        findMore={findMore}
        isLoading={isLoading}
        error={error}
        dataSource={filteredFlashcards}
        paginationState={paginationState}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
