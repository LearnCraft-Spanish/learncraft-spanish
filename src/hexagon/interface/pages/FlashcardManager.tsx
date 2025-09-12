import useFlashcardManager from '@application/useCases/useFlashcardManager';
import FlashcardManagerFilters from '@interface/components/FlashcardManager/FlashcardManagerFilters';
import { Loading } from '@interface/components/Loading';
import { FlashcardTable } from '@interface/components/Tables';
export default function FlashcardManager() {
  const {
    allFlashcards,
    displayFlashcards,
    paginationState,
    filterOwnedFlashcards,
    setFilterOwnedFlashcards,
    isLoading,
    error,
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
        filterOwnedFlashcards={filterOwnedFlashcards}
        setFilterOwnedFlashcards={setFilterOwnedFlashcards}
      />
      <FlashcardTable
        allFlashcards={allFlashcards}
        displayFlashcards={displayFlashcards}
        paginationState={paginationState}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
