import type { Flashcard, NewFlashcard } from 'src/types/interfaceDefinitions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import { useRecentlyEditedExamples } from 'src/hooks/ExampleData/useRecentlyEditedExamples';
import { useBackend } from 'src/hooks/useBackend';
import { useUserData } from 'src/hooks/UserData/useUserData';
import EditOrCreateExample from '../editOrCreateExample';
import ExamplesTable from '../FlashcardFinder/ExamplesTable';
import LoadingMessage from '../Loading';
import { AudioControl } from './AudioControl';
import 'src/App.css';
import './ExampleCreator.css';
export default function ExampleCreator() {
  const queryClient = useQueryClient();
  const { getExampleSetBySpanishText, createMultipleUnverifiedExamples } =
    useBackend();
  const [singleOrSet, setSingleOrSet] = useState<'single' | 'set'>('set');
  const [pastingOrEditing, setPastingOrEditing] = useState<
    'pasting' | 'editing'
  >('pasting');
  const [unsavedFlashcardSet, setUnsavedFlashcardSet] = useState<Flashcard[]>(
    [],
  );
  const [flashcardSpanish, setFlashcardSpanish] = useState<string[]>([]);
  const [spanishExample, setSpanishExample] = useState('');
  const awaitingAddResolution = useRef(0);
  const tempId = useRef(-1);
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [spanishAudioLa, setSpanishAudioLa] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [englishAudio, setEnglishAudio] = useState('');

  const toggleSingleOrSet = () => {
    if (singleOrSet === 'single') {
      setSingleOrSet('set');
    } else {
      setSingleOrSet('single');
    }
  };

  const parsedAreaInput: Flashcard[] = useMemo(() => {
    const lines = areaInput.split('\n').map((line) => line.split('\t'));
    const parsedRecords = lines.map((line) => {
      return {
        spanishExample: line[0] || `ERROR: ${-tempId.current}`,
        englishTranslation: line[1] || 'ERROR',
        spanglish: line[0].includes('*') ? 'spanglish' : 'esp',
        spanishAudioLa: line[2] || '',
        englishAudio: line[3] || '',
        vocabComplete: false,
        // Temporary values; parse out before sending to backend
        recordId: tempId.current--,
        vocabIncluded: [],
      };
    });
    const filteredRecords = parsedRecords.filter(
      (record) =>
        !record.spanishExample.includes('ERROR') &&
        !record.englishTranslation.includes('ERROR'),
    );
    return filteredRecords;
  }, [areaInput]);

  const addInputToFlashcardSet = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
    const newSpanish = parsedAreaInput.map((example) => example.spanishExample);
    setFlashcardSpanish((prev) => [...new Set([...prev, ...newSpanish])]);
    setUnsavedFlashcardSet((prev) => [...prev, ...parsedAreaInput]);
    setPastingOrEditing('editing');
    setAreaInput('');
  }, [parsedAreaInput]);

  const userDataQuery = useUserData();
  const adminRole = userDataQuery.data?.roles.adminRole;
  const hasAccess = adminRole === 'admin' || adminRole === 'coach';
  const { recentlyEditedExamplesQuery, addUnverifiedExample } =
    useRecentlyEditedExamples();

  const exampleSetQuery = useQuery({
    queryKey: ['flashcardSet'],
    queryFn: () => getExampleSetBySpanishText(flashcardSpanish),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: hasAccess && flashcardSpanish.length > 0,
  });

  const flashcardSet: Flashcard[] = useMemo(() => {
    const savedFlashcards: Flashcard[] = exampleSetQuery.data ?? [];
    const mappedFlashcards = flashcardSpanish.map((spanish) => {
      const foundSaved = savedFlashcards.find(
        (flashcard) => flashcard.spanishExample === spanish,
      );
      if (foundSaved) {
        return foundSaved;
      }
      const foundUnsaved = unsavedFlashcardSet.find(
        (flashcard) => flashcard.spanishExample === spanish,
      );
      if (foundUnsaved) {
        return foundUnsaved;
      }
      const tempFlashcard: Flashcard = {
        spanishExample: spanish,
        englishTranslation: 'ERROR',
        spanglish: 'esp',
        vocabIncluded: [],
        englishAudio: '',
        spanishAudioLa: '',
        vocabComplete: false,
        recordId: tempId.current--,
      };
      return tempFlashcard;
    });
    return mappedFlashcards;
  }, [exampleSetQuery.data, unsavedFlashcardSet, flashcardSpanish]);

  const sendExampleSet = useCallback(
    (flashcards: Flashcard[]) => {
      const newFlashcardSet: NewFlashcard[] = flashcards.map((flashcard) => {
        return {
          spanishExample: flashcard.spanishExample,
          englishTranslation: flashcard.englishTranslation,
          spanglish: flashcard.spanglish,
          spanishAudioLa: flashcard.spanishAudioLa,
          englishAudio: flashcard.englishAudio,
          vocabComplete: false,
        };
      });
      return createMultipleUnverifiedExamples(newFlashcardSet);
    },
    [createMultipleUnverifiedExamples],
  );

  const addFlashcardSetMutation = useMutation({
    mutationFn: sendExampleSet,
    onMutate: async (flashcards: Flashcard[]) => {
      await queryClient.cancelQueries({ queryKey: ['flashcardSet'] });
      const previousFlashcardSet: Flashcard[] =
        queryClient.getQueryData(['flashcardSet']) || [];
      queryClient.setQueryData(
        ['flashcardSet'],
        [...previousFlashcardSet, ...flashcards],
      );
      const flashcardsToSave = [...unsavedFlashcardSet];
      return {
        previousFlashcardSet,
        unsavedFlashcardSet: flashcardsToSave,
      };
    },
    onError: (_err, _variables, context) => {
      toast.error('Failed to save examples');
      if (context?.previousFlashcardSet && context?.unsavedFlashcardSet) {
        const unsavedFlashcardsToRestore = context.unsavedFlashcardSet.filter(
          (unsavedFlashcard) =>
            !context.previousFlashcardSet.some(
              (savedFlashcard) =>
                savedFlashcard.spanishExample ===
                unsavedFlashcard.spanishExample,
            ),
        );
        setUnsavedFlashcardSet(unsavedFlashcardsToRestore);
        setFlashcardSpanish(
          unsavedFlashcardsToRestore.map(
            (unsavedFlashcard) => unsavedFlashcard.spanishExample,
          ),
        );
        queryClient.setQueryData(
          ['flashcardSet'],
          context.previousFlashcardSet,
        );
      }
    },
    onSuccess: async () => {
      toast.success('Examples saved...');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
      awaitingAddResolution.current++;
    },
  });

  const updateFlaschardSetValues = useCallback(
    (changedObjTempId: number, field: string, newValue: string) => {
      let newSpanglish = '';
      if (field === 'spanishExample') {
        newSpanglish = newValue.includes('*') ? 'spanglish' : 'esp';
      }
      const newFlashcardSet = unsavedFlashcardSet.map((flashcard) => {
        if (flashcard.recordId === changedObjTempId) {
          return { ...flashcard, [field]: newValue, spanglish: newSpanglish };
        } else {
          return flashcard;
        }
      });
      setUnsavedFlashcardSet(newFlashcardSet);
    },
    [unsavedFlashcardSet],
  );

  const clearAndRestart = useCallback(() => {
    setUnsavedFlashcardSet([]);
    setFlashcardSpanish([]);
    setPastingOrEditing('pasting');
    queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
  }, []);

  const tableData =
    singleOrSet === 'single'
      ? (recentlyEditedExamplesQuery.data ?? [])
      : (exampleSetQuery.data ?? []);

  const displayOrder = tableData.map((example) => {
    return { recordId: example.recordId };
  });

  const spanglish = useMemo(() => {
    const hasAsterisk = spanishExample.includes('*');
    if (hasAsterisk) {
      return 'spanglish';
    } else {
      return 'esp';
    }
  }, [spanishExample]);

  const newFlashcard: NewFlashcard = useMemo(() => {
    return {
      spanishExample,
      englishTranslation,
      spanglish,
      englishAudio,
      spanishAudioLa,
      vocabComplete: false,
    };
  }, [
    spanishExample,
    englishTranslation,
    spanishAudioLa,
    englishAudio,
    spanglish,
  ]);

  function handleAddExample(e: React.FormEvent) {
    e.preventDefault();
    addUnverifiedExample(newFlashcard);
    setSpanishExample('');
    setEnglishTranslation('');
    setSpanishAudioLa('');
    setEnglishAudio('');
  }

  useEffect(() => {
    if (!exampleSetQuery.data?.length) {
      return;
    }
    if (exampleSetQuery.data.length) {
      if (awaitingAddResolution.current > 1) {
        awaitingAddResolution.current--;
      }
      if (awaitingAddResolution.current === 1) {
        if (unsavedFlashcardSet.length === 0 && exampleSetQuery.data.length) {
          toast.success('All examples saved');
        } else {
          toast.error('Some examples failed to save');
        }
        awaitingAddResolution.current = 0;
      }
      if (awaitingAddResolution.current === 0) {
        const savedFlashcards: Flashcard[] = exampleSetQuery.data;
        const filteredUnsavedSet = unsavedFlashcardSet.filter(
          (flashcard) =>
            !savedFlashcards.some(
              (savedFlashcard) =>
                savedFlashcard.spanishExample === flashcard.spanishExample,
            ),
        );
        if (filteredUnsavedSet.length !== unsavedFlashcardSet.length) {
          setUnsavedFlashcardSet(filteredUnsavedSet);
        }
      }
    }
  }, [exampleSetQuery.data, unsavedFlashcardSet]);

  return (
    <div>
      <h2>Example Creator</h2>
      <div className="buttonBox" id="singleOrSet">
        <button type="button" onClick={toggleSingleOrSet}>
          {singleOrSet === 'single' ? 'Create Set' : 'Create Single Example'}
        </button>
      </div>
      {singleOrSet === 'single' && (
        <>
          <div id="exampleCreator">
            <EditOrCreateExample
              editOrCreate="create"
              onSubmit={handleAddExample}
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
          <div id="newExamples">
            <h3>New Examples</h3>
            <ExamplesTable dataSource={tableData} displayOrder={displayOrder} />
          </div>
        </>
      )}
      {singleOrSet === 'set' && (
        <div>
          <h3>Set Creator</h3>
          {pastingOrEditing === 'pasting' && (
            <div className="setCreatorContainer">
              <textarea
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                placeholder={
                  'Paste table here in the following format: \nSpanish Example\tEnglish Translation\tSpanish Audio\tEnglish Audio'
                }
                rows={6}
                cols={120}
              />
              {!!areaInput.length && (
                <div>
                  <h3>Preview Set</h3>

                  <table>
                    <thead>
                      <tr>
                        <th>Spanish Example</th>
                        <th>English Translation</th>
                        <th>Spanish Audio</th>
                        <th>English Audio</th>
                        <th>Spanglish</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedAreaInput.map((example) => {
                        return (
                          <tr key={example.recordId}>
                            <td>
                              {formatSpanishText(
                                example.spanglish,
                                example.spanishExample,
                              )}
                            </td>
                            <td>
                              {formatEnglishText(example.englishTranslation)}
                            </td>
                            <td>{example.spanishAudioLa}</td>
                            <td>{example.englishAudio}</td>
                            <td>{example.spanglish}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="buttonBox">
                    <button
                      type="button"
                      onClick={() => {
                        addInputToFlashcardSet();
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {pastingOrEditing === 'editing' && (
            <div>
              {unsavedFlashcardSet.length > 0 && (
                <>
                  <h3>Example Preview</h3>
                  {unsavedFlashcardSet.map((example) => {
                    return (
                      <div key={example.recordId} className="exampleCard">
                        <div className="exampleCardSpanishText">
                          {formatSpanishText(
                            example.spanglish,
                            example.spanishExample,
                          )}
                          <AudioControl audioLink={example.spanishAudioLa} />
                        </div>
                        <div className="halfWrapper"></div>
                        <div className="exampleCardEnglishText">
                          {formatEnglishText(example.englishTranslation)}
                          <AudioControl audioLink={example.englishAudio} />
                        </div>
                      </div>
                    );
                  })}
                  <h3>Edit Examples</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Spanish Example</th>
                        <th>English Translation</th>
                        <th>Spanish Audio</th>
                        <th>English Audio</th>
                        <th>Spanglish</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unsavedFlashcardSet.map((example) => {
                        return (
                          <tr key={example.recordId}>
                            <td className="tdWithoutPadding">
                              <textarea
                                rows={3}
                                className="inputWithoutStyle"
                                onChange={(e) =>
                                  updateFlaschardSetValues(
                                    example.recordId,
                                    'spanishExample',
                                    e.target.value,
                                  )
                                }
                                value={example.spanishExample}
                              />
                            </td>
                            <td className="tdWithoutPadding">
                              <textarea
                                rows={3}
                                className="inputWithoutStyle"
                                onChange={(e) =>
                                  updateFlaschardSetValues(
                                    example.recordId,
                                    'englishTranslation',
                                    e.target.value,
                                  )
                                }
                                value={example.englishTranslation}
                              />
                            </td>
                            <td className="tdWithoutPadding">
                              <textarea
                                rows={3}
                                className="inputWithoutStyle"
                                onChange={(e) =>
                                  updateFlaschardSetValues(
                                    example.recordId,
                                    'spanishAudioLa',
                                    e.target.value,
                                  )
                                }
                                value={example.spanishAudioLa}
                              />
                            </td>
                            <td className="tdWithoutPadding">
                              <textarea
                                rows={3}
                                className="inputWithoutStyle"
                                onChange={(e) =>
                                  updateFlaschardSetValues(
                                    example.recordId,
                                    'englishAudio',
                                    e.target.value,
                                  )
                                }
                                value={example.englishAudio}
                              />
                            </td>
                            <td>{example.spanglish}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
              <div className="buttonBox">
                <button
                  type="button"
                  onClick={() => setPastingOrEditing('pasting')}
                >
                  Back to Paste
                </button>
                <button type="button" onClick={() => clearAndRestart()}>
                  Restart
                </button>
                {unsavedFlashcardSet.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      addFlashcardSetMutation.mutate(unsavedFlashcardSet)
                    }
                  >
                    Save Example Set
                  </button>
                )}
              </div>
              {exampleSetQuery.isLoading && (
                <LoadingMessage message="Loading examples..." />
              )}
              {exampleSetQuery.isError && (
                <div>
                  <p>Error loading examples</p>
                  <button
                    type="button"
                    onClick={() => exampleSetQuery.refetch()}
                  >
                    Retry
                  </button>
                </div>
              )}
              {tableData.length > 0 && (
                <ExamplesTable
                  dataSource={exampleSetQuery.data ?? []}
                  displayOrder={displayOrder}
                  studentContext={false}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
