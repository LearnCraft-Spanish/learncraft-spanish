import { useGetHelpMenu } from '@application/useCases/useGetHelpMenu';
import { useCallback, useMemo, useState } from 'react';
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

  const [searchTerm, setSearchTerm] = useState('');

  // Filter vocabulary based on search term
  const filteredVocabulary = useMemo(() => {
    if (!searchTerm.trim()) {
      return vocabularyList;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return vocabularyList.filter((vocab) => {
      // Use only properties that we know exist
      const wordMatch = vocab.word?.toLowerCase().includes(lowerSearchTerm);
      const descriptorMatch = vocab.descriptor
        ?.toLowerCase()
        .includes(lowerSearchTerm);

      return wordMatch || descriptorMatch;
    });
  }, [vocabularyList, searchTerm]);

  // Handle vocabulary selection
  const handleVocabSelect = useCallback(
    (vocabId: number) => {
      updateSelectedVocabId(vocabId);
    },
    [updateSelectedVocabId],
  );

  // Get selected vocabulary item
  const selectedVocabulary = useMemo(() => {
    return vocabularyList.find((vocab) => vocab.id === selectedVocabId);
  }, [vocabularyList, selectedVocabId]);

  if (isLoading) {
    return (
      <div className="get-help-page">
        <div className="get-help-page__loading">
          <p>Loading vocabulary data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="get-help-page">
        <div className="get-help-page__error">
          <h2>Error</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="get-help-page">
      <h1>Get Help</h1>

      <div className="get-help-page__content">
        {/* Search Section */}
        <div className="get-help-page__search-section">
          <h2>Search Vocabulary</h2>
          <div className="get-help-page__search-container">
            <input
              type="text"
              placeholder="Search vocabulary by word or descriptor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="get-help-page__search-input"
            />
          </div>
        </div>

        {/* Vocabulary List */}
        <div className="get-help-page__vocabulary-section">
          <h2>Vocabulary ({filteredVocabulary.length})</h2>
          <div className="get-help-page__vocabulary-list">
            {filteredVocabulary.length === 0 ? (
              <div className="get-help-page__empty-state">
                <p>No vocabulary found matching your search.</p>
              </div>
            ) : (
              <table className="get-help-page__vocabulary-table">
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>Descriptor</th>
                    <th>Subcategory</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocabulary.map((vocab) => (
                    <tr
                      key={vocab.id}
                      className={`get-help-page__vocabulary-row ${
                        selectedVocabId === vocab.id
                          ? 'get-help-page__vocabulary-row--selected'
                          : ''
                      }`}
                      onClick={() => handleVocabSelect(vocab.id)}
                    >
                      <td>{vocab.word}</td>
                      <td>{vocab.descriptor}</td>
                      <td>{vocab.subcategory?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Lessons Section */}
        {selectedVocabulary && (
          <div className="get-help-page__lessons-section">
            <h2>Lessons Teaching "{selectedVocabulary.word}"</h2>
            <div className="get-help-page__lessons-list">
              {!lessonsByVocabulary || lessonsByVocabulary.length === 0 ? (
                <div className="get-help-page__empty-state">
                  <p>No lessons found that teach this vocabulary.</p>
                </div>
              ) : (
                <table className="get-help-page__lessons-table">
                  <thead>
                    <tr>
                      <th>Lesson</th>
                      <th>Course</th>
                      <th>Lesson Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessonsByVocabulary.map((lesson) => (
                      <tr key={lesson.id} className="get-help-page__lesson-row">
                        <td>
                          {lesson.subtitle || `Lesson ${lesson.lessonNumber}`}
                        </td>
                        <td>{lesson.courseName}</td>
                        <td>{lesson.lessonNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
