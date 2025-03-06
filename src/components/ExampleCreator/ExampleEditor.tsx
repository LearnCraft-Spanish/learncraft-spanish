import type { Flashcard, Vocabulary } from 'src/types/interfaceDefinitions';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ExamplesTable from 'src/components/ExamplesTable/ExamplesTable';
import quizCourses from 'src/functions/QuizCourseList';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useModal } from 'src/hooks/useModal';
import EditOrCreateExample from '../EditOrCreateExample';
import { VocabTag } from './VocabTag';
import './ExampleEditor.css';
import '../ExampleCreator/ExampleCreator.css';
import '../../App.css';

export default function ExampleEditor() {
  const { contextual, openContextual, setContextualRef } = useContextualMenu();
  const { vocabularyQuery } = useVocabulary();
  const [selectedExampleId, setSelectedExampleId] = useState(
    null as number | null,
  );

  function handleEditExample(e: React.FormEvent) {
    e.preventDefault();
    if (selectedExampleId !== null) {
      if (selectedExampleId !== null) {
        if (!!tableOption && tableOption !== 'recently-edited') {
          updateQuizExample({
            recordId: selectedExampleId,
            spanishExample,
            englishTranslation,
            spanishAudioLa,
            spanglish,
            englishAudio,
            vocabComplete,
            vocabIncluded,
          });
        } else if (tableOption === 'recently-edited') {
          updateRecentlyEditedExample({
            recordId: selectedExampleId,
            spanishExample,
            englishTranslation,
            spanishAudioLa,
            spanglish,
            englishAudio,
            vocabComplete,
            vocabIncluded,
          });
        }
      }
    }
  }

  // Reset Properties when active example changes
  useEffect(() => {
    if (selectedExampleId !== null) {
      const example = tableData?.find(
        (example: Flashcard) => example.recordId === selectedExampleId,
      );
      if (example) {
        setSpanishExample(example.spanishExample);
        setEnglishTranslation(example.englishTranslation);
        setSpanishAudioLa(example.spanishAudioLa);
        setEnglishAudio(example.englishAudio);
        setVocabIncluded(example.vocabIncluded);
        setVocabComplete(example.vocabComplete);
      }
    }
  }, [
    recentlyEditedExamplesQuery.data,
    quizExamplesQuery.data,
    tableData,
    vocabularyQuery.data,
    selectedExampleId,
  ]);

  // search functionality for vocab tags
  useEffect(() => {
    filterTagsByInput(vocabSearchTerm);
  }, [vocabSearchTerm, filterTagsByInput]);

  // Update default quiz when tableOption changes
  useEffect(() => {
    if (!firstQuiz) {
      setQuizId(undefined);
    } else {
      setQuizId(firstQuiz.recordId);
    }
  }, [firstQuiz]);

  return (
    <div>
      <div>
        <h2>Example Editor</h2>
      </div>
      <div>
        {!selectedExampleId && (
          <div>
            <h4>Please select an example to preview/edit</h4>
          </div>
        )}
        {selectedExampleId && (
          <>
            <div id="exampleEditor">
              <EditOrCreateExample
                editOrCreate="edit"
                onSubmit={() =>
                  new Error('this should not be called in ExampleEditor')
                }
                spanishExample={spanishExample}
                setSpanishExample={setSpanishExample}
                spanglish={spanglish}
                englishTranslation={englishTranslation}
                setEnglishTranslation={setEnglishTranslation}
                spanishAudioLa={spanishAudioLa}
                setSpanishAudioLa={setSpanishAudioLa}
                englishAudio={englishAudio}
                setEnglishAudio={setEnglishAudio}
              />
            </div>
            <form onSubmit={(e) => handleEditExample(e)}>
              <div id="vocabTagging">
                <div className="halfOfScreen tagSearchBox">
                  <h3>Search for Vocab</h3>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={vocabSearchTerm}
                    placeholder="Search names, emails, or notes"
                    className="searchBox"
                    onChange={(e) => updateVocabSearchTerm(e.target)}
                    onFocus={(e) => updateVocabSearchTerm(e.target)}
                  />
                  {/* Contextual with results from search bar */}
                  {!!vocabSearchTerm.length &&
                    contextual === 'tagSuggestionBox' &&
                    !!suggestedTags.length && (
                      <div className="tagSuggestionBox" ref={setContextualRef}>
                        {suggestedTags.map((item) => (
                          <div
                            key={item.recordId}
                            className="vocabTag tagCard"
                            onClick={() => addToSelectedVocab(item.vocabName)}
                          >
                            <h4 className="vocabName">
                              {item.descriptionOfVocabularySkill}
                            </h4>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                <div className="halfOfScreen">
                  <h3>Vocab Included</h3>
                  <div className="vocabTagBox">
                    {includedVocabObjects.map((vocab) => (
                      <VocabTag
                        key={vocab.recordId}
                        vocab={vocab}
                        removeFromVocabList={removeFromVocabIncluded}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="buttonBox">
                <p>Vocab Complete:</p>
                <label htmlFor="vocabComplete" className="switch">
                  <input
                    alt="Vocab Complete"
                    type="checkbox"
                    name="Vocab Complete"
                    id="vocabComplete"
                    checked={vocabComplete}
                    onChange={(e) =>
                      handleVerifyExampleChange(e.target.checked)
                    }
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="buttonBox">
                <button type="submit">Save Example</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
