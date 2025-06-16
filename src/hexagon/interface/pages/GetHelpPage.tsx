import { useGetHelpMenu } from '@application/useCases/useGetHelpMenu';
import { useCallback, useMemo } from 'react';
import LessonsTable from '../components/LessonsTable/LessonsTable';
import VocabularySearch from '../components/VocabularySearch/VocabularySearch';
import './GetHelpPage.scss';

export default function GetHelpPage() {
  const {
    vocabularyList,
    lessonsByVocabulary,
    isLoading,
    error,
    selectedVocabId,
    updateSelectedVocabId,
  } = useGetHelpMenu();

  // Get selected vocabulary item
  const selectedVocabulary = useMemo(() => {
    return vocabularyList.find((vocab) => vocab.id === selectedVocabId);
  }, [vocabularyList, selectedVocabId]);

  // Handle vocabulary selection
  const handleVocabSelect = useCallback(
    (vocabId: number) => {
      updateSelectedVocabId(vocabId);
    },
    [updateSelectedVocabId],
  );

  return (
    <div className="get-help-page">
      <h1>Get Help</h1>

      <div className="get-help-page__content">
        {/* Search Section - Always visible */}
        <div className="get-help-page__search-section">
          <h2>Search Vocabulary</h2>
          <div className="get-help-page__search-container">
            <VocabularySearch
              vocabularyList={vocabularyList}
              onVocabularySelect={handleVocabSelect}
              selectedVocabId={selectedVocabId}
              placeholder="Search vocabulary by word or descriptor..."
              minSearchLength={2}
              maxResults={10}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="get-help-page__error">
            <h2>Error</h2>
            <p>{error.message}</p>
          </div>
        )}

        {/* Lessons Section - Shows loading or lessons */}
        <div className="get-help-page__lessons-section">
          {selectedVocabulary ? (
            <LessonsTable
              lessons={lessonsByVocabulary}
              selectedVocabularyWord={selectedVocabulary.word}
              isLoading={isLoading}
            />
          ) : (
            <div className="get-help-page__no-selection">
              <p>Search and select a vocabulary item to see related lessons.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
