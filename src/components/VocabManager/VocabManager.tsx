import type { Vocabulary } from 'src/types/interfaceDefinitions';
import React, { useRef, useState } from 'react';
import { useSubcategories } from 'src/hooks/CourseData/useSubcategories';
import { useVerbs } from 'src/hooks/CourseData/useVerbs';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import { useUserData } from 'src/hooks/UserData/useUserData';
import 'src/App.css';

export interface ParsedVocabulary extends Omit<Vocabulary, 'recordId'> {
  tempId?: number;
  use: string;
  vocabName: string;
}

export default function VocabManager() {
  const userDataQuery = useUserData();
  const adminRole = userDataQuery.data?.roles.adminRole;
  const hasAccess = adminRole === 'admin';

  const {
    verbsQuery,
    createVerbMutation: _createVerbMutation,
    updateVerbMutation: _updateVerbMutation,
    deleteVerbMutation: _deleteVerbMutation,
  } = useVerbs();
  const {
    subcategoriesQuery,
    createSubcategoryMutation: _createSubcategoryMutation,
    updateSubcategoryMutation: _updateSubcategoryMutation,
    deleteSubcategoryMutation: _deleteSubcategoryMutation,
  } = useSubcategories();
  const {
    vocabularyQuery,
    createVocabularyMutation,
    updateVocabularyMutation,
    createSpellingMutation,
    deleteSpellingMutation,
  } = useVocabulary();

  const [vocabularyData, setVocabularyData] = useState('');
  const [parsedVocabulary, setParsedVocabulary] = useState<ParsedVocabulary[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedVocabulary, setSelectedVocabulary] =
    useState<Vocabulary | null>(null);
  const [newSpelling, setNewSpelling] = useState('');
  const nextTempId = useRef(-1);

  const getNextTempId = () => {
    nextTempId.current -= 1;
    return nextTempId.current;
  };

  if (!hasAccess) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVocabularyData(e.target.value);
    setError(null);
  };

  const parseTable = () => {
    try {
      const lines = vocabularyData.split('\n').filter((line) => line.trim());
      const parsed: ParsedVocabulary[] = lines.map((line, index) => {
        const [
          wordIdiom,
          descriptionOfVocabularySkill,
          frequencyRank,
          vocabularySubcategorySubcategoryName,
          verbInfinitive,
          conjugationTags,
        ] = line.split('\t');

        if (!wordIdiom || !descriptionOfVocabularySkill || !frequencyRank) {
          throw new Error(`Missing required fields in line ${index + 1}`);
        }

        return {
          tempId: getNextTempId(),
          wordIdiom,
          descriptionOfVocabularySkill,
          frequencyRank: Number.parseInt(frequencyRank, 10),
          vocabularySubcategorySubcategoryName:
            vocabularySubcategorySubcategoryName || '',
          verbInfinitive: verbInfinitive || '',
          conjugationTags: conjugationTags ? conjugationTags.split(',') : [],
          spellings: [],
          use: '',
          vocabName: '',
        };
      });

      setParsedVocabulary(parsed);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error parsing vocabulary data',
      );
    }
  };

  const handleSubmit = async () => {
    if (!parsedVocabulary.length) return;

    try {
      for (const vocab of parsedVocabulary) {
        if (vocab.tempId) {
          // This is a new vocabulary item
          await createVocabularyMutation.mutateAsync(vocab);
        } else {
          // This is an existing vocabulary item
          await updateVocabularyMutation.mutateAsync(vocab as Vocabulary);
        }
      }
      setParsedVocabulary([]);
      setVocabularyData('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving vocabulary');
    }
  };

  const handleAddSpelling = async () => {
    if (!selectedVocabulary || !newSpelling.trim()) return;

    try {
      await createSpellingMutation.mutateAsync({
        relatedWordIdiom: selectedVocabulary.recordId,
        spellingOption: newSpelling.trim(),
      });
      setNewSpelling('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding spelling');
    }
  };

  const handleDeleteSpelling = async (spellingToDelete: string) => {
    if (!selectedVocabulary) return;
    try {
      await deleteSpellingMutation.mutateAsync({
        relatedWordIdiom: selectedVocabulary.recordId,
        spellingOption: spellingToDelete,
      });
    } catch (error) {
      console.error('Failed to delete spelling:', error);
    }
  };

  return (
    <div>
      <h2>Vocabulary Management</h2>
      <div className="vocabulary-manager">
        {/* Verbs Section */}
        <section>
          <h3>Verbs</h3>
          {verbsQuery.isLoading && <div>Loading verbs...</div>}
          {verbsQuery.isError && <div>Error loading verbs</div>}
          {verbsQuery.data && (
            <div>
              {/* Verb management UI will go here */}
              <p>Verb management interface coming soon...</p>
            </div>
          )}
        </section>

        {/* Subcategories Section */}
        <section>
          <h3>Subcategories</h3>
          {subcategoriesQuery.isLoading && <div>Loading subcategories...</div>}
          {subcategoriesQuery.isError && <div>Error loading subcategories</div>}
          {subcategoriesQuery.data && (
            <div>
              {/* Subcategory management UI will go here */}
              <p>Subcategory management interface coming soon...</p>
            </div>
          )}
        </section>

        {/* Vocabulary Section */}
        <section>
          <h3>Vocabulary</h3>
          {vocabularyQuery.isLoading && <div>Loading vocabulary...</div>}
          {vocabularyQuery.isError && <div>Error loading vocabulary</div>}
          {vocabularyQuery.data && (
            <div className="vocabulary-section">
              <div className="vocabulary-input">
                <textarea
                  value={vocabularyData}
                  onChange={handleChange}
                  placeholder="Paste vocabulary data here (tab-separated)"
                  rows={10}
                />
                <button type="button" onClick={parseTable}>
                  Parse Data
                </button>
                {error && <div className="error">{error}</div>}
              </div>

              {parsedVocabulary.length > 0 && (
                <div className="vocabulary-preview">
                  <h4>Preview</h4>
                  <ul>
                    {parsedVocabulary.map((vocab) => (
                      <li key={vocab.tempId}>
                        {vocab.wordIdiom} - {vocab.descriptionOfVocabularySkill}
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={handleSubmit}>
                    Save Vocabulary
                  </button>
                </div>
              )}

              <div className="spelling-management">
                <h4>Manage Spellings</h4>
                <select
                  value={selectedVocabulary?.recordId || ''}
                  onChange={(e) => {
                    const vocab = vocabularyQuery.data.find(
                      (v) => v.recordId === Number.parseInt(e.target.value, 10),
                    );
                    setSelectedVocabulary(vocab || null);
                  }}
                >
                  <option value="">Select a vocabulary item</option>
                  {vocabularyQuery.data.map((vocab) => (
                    <option key={vocab.recordId} value={vocab.recordId}>
                      {vocab.wordIdiom}
                    </option>
                  ))}
                </select>

                {selectedVocabulary && (
                  <>
                    <div className="spelling-list">
                      <h5>Current Spellings:</h5>
                      <ul>
                        {selectedVocabulary.spellings?.map((spelling) => (
                          <li
                            key={`${selectedVocabulary.recordId}-${spelling}`}
                          >
                            {spelling}
                            <button
                              type="button"
                              onClick={() => handleDeleteSpelling(spelling)}
                              className="delete-button"
                            >
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="add-spelling">
                      <input
                        type="text"
                        value={newSpelling}
                        onChange={(e) => setNewSpelling(e.target.value)}
                        placeholder="Enter new spelling"
                      />
                      <button type="button" onClick={handleAddSpelling}>
                        Add Spelling
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
