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
import ExamplesTable from 'src/components/ExamplesTable/ExamplesTable';
import LoadingMessage from 'src/components/Loading';
import StudentSearch from 'src/components/StudentSearch';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import { useBackend } from 'src/hooks/useBackend';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';
import { AudioControl } from './AudioControl';

interface SetExampleCreatorProps {
  hasAccess: boolean;
}

export default function ExampleSetCreator({
  hasAccess,
}: SetExampleCreatorProps) {
  const queryClient = useQueryClient();
  const { getExampleSetBySpanishText, createMultipleUnverifiedExamples } =
    useBackend();

  const [pastingOrEditing, setPastingOrEditing] = useState<
    'pasting' | 'editing' | 'assigning'
  >('pasting');
  const [unsavedFlashcardSet, setUnsavedFlashcardSet] = useState<Flashcard[]>(
    [],
  );
  const [flashcardSpanish, setFlashcardSpanish] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');
  const awaitingAddResolution = useRef(0);
  const tempId = useRef(-1);

  const { activeStudentQuery } = useActiveStudent();
  const { addFlashcardMutation } = useStudentFlashcards();

  // Clear all state and restart
  const clearAndRestart = useCallback(() => {
    setPastingOrEditing('pasting');
    setUnsavedFlashcardSet([]);
    setFlashcardSpanish([]);
    setAreaInput('');
    awaitingAddResolution.current = 0;
    tempId.current = -1;
  }, []);

  // Parse the pasted input into flashcard objects
  const parsedAreaInput = useMemo(() => {
    const lines = areaInput
      .split('\n')
      // Skip completely empty lines or lines with just whitespace/tabs
      .filter((line) => line.trim().length > 0)
      .map((line) => line.split('\t'));

    const parsedRecords = lines
      .map((line) => {
        const spanishText = line[0]?.trim() || '';
        const englishText = line[1]?.trim() || '';
        const hasSpanish = !!spanishText;
        const hasEnglish = !!englishText;

        // Skip invalid rows by returning null
        if (!hasSpanish || !hasEnglish) {
          return null;
        }

        return {
          spanishExample: spanishText,
          englishTranslation: englishText,
          spanglish: spanishText.includes('*') ? 'spanglish' : 'esp',
          spanishAudioLa: line[2]?.trim() || '',
          englishAudio: line[3]?.trim() || '',
          vocabComplete: false,
          recordId: tempId.current--,
          vocabIncluded: [],
        } as Flashcard;
      })
      .filter((record): record is Flashcard => record !== null);

    return parsedRecords;
  }, [areaInput]);

  // Query for existing flashcard set
  const exampleSetQuery = useQuery({
    queryKey: ['flashcardSet'],
    queryFn: () => getExampleSetBySpanishText(flashcardSpanish),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: hasAccess && flashcardSpanish.length > 0,
  });

  // Check for existing examples in the database
  const existingExamples = useMemo(() => {
    if (!exampleSetQuery.data) return new Set<string>();
    return new Set(exampleSetQuery.data.map((ex) => ex.spanishExample));
  }, [exampleSetQuery.data]);

  // Calculate validation summary
  const validationSummary = useMemo(() => {
    if (!areaInput.trim()) return null;

    const totalRows = areaInput
      .split('\n')
      .filter((line) => line.trim().length > 0).length;

    // Track which Spanish examples we've seen to detect duplicates
    const seenSpanishExamples = new Set<string>();

    const validRows = parsedAreaInput.filter((ex) => {
      // Check for errors and existing examples
      if (
        ex.spanishExample.includes('ERROR') ||
        ex.englishTranslation.includes('ERROR') ||
        existingExamples.has(ex.spanishExample)
      ) {
        return false;
      }

      // Check for duplicates
      if (seenSpanishExamples.has(ex.spanishExample)) {
        return false;
      }
      seenSpanishExamples.add(ex.spanishExample);

      return true;
    }).length;

    return {
      total: totalRows,
      valid: validRows,
      invalid: totalRows - validRows,
    };
  }, [areaInput, parsedAreaInput, existingExamples]);

  // Add parsed input to the flashcard set
  const addInputToFlashcardSet = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
    // Keep only the first instance of each Spanish example and filter out any remaining invalid rows
    const uniqueExamples = parsedAreaInput.reduce((acc, current) => {
      if (
        !acc.some((item) => item.spanishExample === current.spanishExample) &&
        current.spanishExample &&
        current.englishTranslation
      ) {
        acc.push(current);
      }
      return acc;
    }, [] as Flashcard[]);

    const newSpanish = uniqueExamples.map((example) => example.spanishExample);
    setFlashcardSpanish((prev) => [...new Set([...prev, ...newSpanish])]);
    setUnsavedFlashcardSet((prev) => [...prev, ...uniqueExamples]);
    setPastingOrEditing('editing');
    setAreaInput('');
  }, [queryClient, parsedAreaInput]);

  // Prepare flashcards for backend
  const sendExampleSet = useCallback(
    (flashcards: Flashcard[]) => {
      const newFlashcardSet: NewFlashcard[] = flashcards.map((flashcard) => ({
        spanishExample: flashcard.spanishExample,
        englishTranslation: flashcard.englishTranslation,
        spanglish: flashcard.spanglish,
        spanishAudioLa: flashcard.spanishAudioLa,
        englishAudio: flashcard.englishAudio,
        vocabComplete: false,
      }));
      return createMultipleUnverifiedExamples(newFlashcardSet);
    },
    [createMultipleUnverifiedExamples],
  );

  // Mutation for saving flashcard set
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
      return {
        previousFlashcardSet,
        unsavedFlashcardSet: [...unsavedFlashcardSet],
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
        const spanishToRestore = unsavedFlashcardsToRestore.map(
          (unsavedFlashcard) => unsavedFlashcard.spanishExample,
        );
        setUnsavedFlashcardSet(unsavedFlashcardsToRestore);
        setFlashcardSpanish([...flashcardSpanish, ...spanishToRestore]);
        queryClient.setQueryData(
          ['flashcardSet'],
          context.previousFlashcardSet,
        );
        awaitingAddResolution.current++;
      }
    },
    onSuccess: async () => {
      toast.success('Examples saved...');
      awaitingAddResolution.current++;
      setPastingOrEditing('assigning');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSet'] });
    },
  });

  // Handle resolution of saved examples
  useEffect(() => {
    if (!exampleSetQuery.data?.length) return;

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
  }, [exampleSetQuery.data, unsavedFlashcardSet]);

  // Update flashcard values
  const updateFlashcardSetValues = useCallback(
    (changedObjTempId: number, field: string, newValue: string) => {
      let newSpanglish = '';
      if (field === 'spanishExample') {
        const oldSpanish = unsavedFlashcardSet.find(
          (flashcard) => flashcard.recordId === changedObjTempId,
        )?.spanishExample;
        const spanishIndex = flashcardSpanish.findIndex(
          (spanish) => spanish === oldSpanish,
        );
        const newSpanishArray = [...flashcardSpanish];
        newSpanishArray[spanishIndex] = newValue;
        setFlashcardSpanish(newSpanishArray);
        newSpanglish = newValue.includes('*') ? 'spanglish' : 'esp';
      }
      const newFlashcardSet = unsavedFlashcardSet.map((flashcard) => {
        if (flashcard.recordId === changedObjTempId) {
          return {
            ...flashcard,
            [field]: newValue,
            spanglish:
              field === 'spanishExample' ? newSpanglish : flashcard.spanglish,
          };
        }
        return flashcard;
      });
      setUnsavedFlashcardSet(newFlashcardSet);
    },
    [unsavedFlashcardSet, flashcardSpanish],
  );

  // Handle student selection
  useEffect(() => {
    if (activeStudentQuery.data && pastingOrEditing === 'assigning') {
      // Add each flashcard to the student
      const addFlashcards = async () => {
        for (const flashcard of unsavedFlashcardSet) {
          await addFlashcardMutation.mutateAsync(flashcard);
        }
        // Clear state and return to initial view
        clearAndRestart();
      };
      addFlashcards();
    }
  }, [
    activeStudentQuery.data,
    pastingOrEditing,
    unsavedFlashcardSet,
    addFlashcardMutation,
    clearAndRestart,
  ]);

  if (!hasAccess) {
    return <div>You do not have access to create example sets.</div>;
  }

  return (
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
          {validationSummary && (
            <div className="validation-summary">
              Found {validationSummary.total} rows: {validationSummary.valid}{' '}
              valid, {validationSummary.invalid} with errors
            </div>
          )}
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
                    // Build validation state for this row
                    const validationMessages: string[] = [];

                    // Check for missing required fields
                    const hasSpanish =
                      example.spanishExample &&
                      !example.spanishExample.includes('ERROR');
                    const hasEnglish =
                      example.englishTranslation &&
                      !example.englishTranslation.includes('ERROR');
                    if (!hasSpanish || !hasEnglish) {
                      validationMessages.push(
                        `Missing ${!hasSpanish ? 'Spanish' : ''}${!hasSpanish && !hasEnglish ? ' and ' : ''}${!hasEnglish ? 'English' : ''} text`,
                      );
                    }

                    // Find duplicates (only if the row is valid)
                    if (validationMessages.length === 0) {
                      const duplicateInstances = parsedAreaInput.filter(
                        (e) =>
                          e.spanishExample === example.spanishExample &&
                          !e.spanishExample.includes('ERROR'),
                      );
                      // Only mark as duplicate if this is not the first instance
                      if (
                        duplicateInstances.length > 1 &&
                        duplicateInstances[0].recordId !== example.recordId
                      ) {
                        validationMessages.push(
                          'This duplicate will be removed, keeping the first instance',
                        );
                      }
                    }

                    // Check for existing examples
                    const isExisting = existingExamples.has(
                      example.spanishExample,
                    );
                    if (isExisting) {
                      validationMessages.push(
                        'This example already exists in the database',
                      );
                    }

                    const showError = validationMessages.length > 0;

                    return (
                      <tr
                        key={example.recordId}
                        className={showError ? 'duplicate-row' : ''}
                      >
                        <td>
                          <div
                            className={
                              showError ? 'duplicate-content-wrapper' : ''
                            }
                          >
                            {!hasSpanish ? (
                              <span>{example.spanishExample}</span>
                            ) : (
                              formatSpanishText(
                                example.spanglish,
                                example.spanishExample,
                              )
                            )}
                            {validationMessages.length > 0 && (
                              <div className="validation-note">
                                {validationMessages.join(', ')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div
                            className={
                              showError ? 'duplicate-content-wrapper' : ''
                            }
                          >
                            {formatEnglishText(example.englishTranslation)}
                          </div>
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
                  onClick={addInputToFlashcardSet}
                  disabled={parsedAreaInput.every((ex) => {
                    const hasErrors =
                      !ex.spanishExample ||
                      ex.spanishExample.includes('ERROR') ||
                      !ex.englishTranslation ||
                      ex.englishTranslation.includes('ERROR');
                    return hasErrors || existingExamples.has(ex.spanishExample);
                  })}
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
              {unsavedFlashcardSet.map((example) => (
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
              ))}
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
                  {unsavedFlashcardSet.map((example) => (
                    <tr key={example.recordId}>
                      <td className="tdWithoutPadding">
                        <textarea
                          rows={3}
                          className="inputWithoutStyle"
                          onChange={(e) =>
                            updateFlashcardSetValues(
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
                            updateFlashcardSetValues(
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
                            updateFlashcardSetValues(
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
                            updateFlashcardSetValues(
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
                  ))}
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
            <button type="button" onClick={clearAndRestart}>
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
              <button type="button" onClick={() => exampleSetQuery.refetch()}>
                Retry
              </button>
            </div>
          )}
          {exampleSetQuery.data && exampleSetQuery.data.length > 0 && (
            <ExamplesTable
              dataSource={exampleSetQuery.data}
              displayOrder={exampleSetQuery.data.map((ex) => ({
                recordId: ex.recordId,
              }))}
              studentContext={false}
            />
          )}
        </div>
      )}
      {pastingOrEditing === 'assigning' && (
        <div>
          <h3>Assign Examples to Student</h3>
          <div className="student-selector">
            <StudentSearch />
          </div>
          <div className="buttonBox">
            <button
              type="button"
              onClick={() => setPastingOrEditing('pasting')}
            >
              Back to Paste
            </button>
            <button type="button" onClick={clearAndRestart}>
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
