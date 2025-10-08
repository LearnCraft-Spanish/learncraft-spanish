import useFlashcardManager from '@application/useCases/useFlashcardManager';
import { CloseableFilterPanel } from '@interface/components/Filters';
import { Loading } from '@interface/components/Loading';
import { FlashcardTable } from '@interface/components/Tables';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function FlashcardManager() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check for URL parameter to enable filtering by default
  const searchParams = new URLSearchParams(location.search);
  const enableFiltering = searchParams.get('enableFiltering') === 'true';

  // Clean up URL parameter after initialization
  useEffect(() => {
    if (enableFiltering) {
      // Remove the parameter from the URL without causing a page refresh
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('enableFiltering');
      const newSearch = newSearchParams.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
      navigate(newUrl, { replace: true });
    }
  }, [enableFiltering, location.pathname, location.search, navigate]);

  const {
    allFlashcards,
    displayFlashcards,
    paginationState,
    filterOwnedFlashcards,
    onGoingToQuiz,
    setFilterOwnedFlashcards,
    studentFlashcardsLoading,
    filteredFlashcardsLoading,
    dependenciesLoading,
    error,
  } = useFlashcardManager({
    enableFilteringByDefault: enableFiltering,
  });

  if (studentFlashcardsLoading || dependenciesLoading) {
    return <Loading message="Loading Flashcard Manager" />;
  }
  if (error) {
    return <h2>Error Loading Flashcard Manager</h2>;
  }

  return (
    <div>
      <h2>Flashcard Manager</h2>
      <CloseableFilterPanel
        isOpen={filterOwnedFlashcards}
        setIsOpen={setFilterOwnedFlashcards}
        requireNoSpanglish={false}
        requireAudioOnly={false}
      />
      <FlashcardTable
        allFlashcards={allFlashcards}
        displayFlashcards={displayFlashcards}
        paginationState={paginationState}
        onGoingToQuiz={onGoingToQuiz}
        isLoading={filteredFlashcardsLoading}
        error={error}
      />
    </div>
  );
}
