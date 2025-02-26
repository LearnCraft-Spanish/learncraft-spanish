import type { Flashcard, NewFlashcard } from 'src/types/interfaceDefinitions';
import React, { useMemo, useState } from 'react';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import { useUnverifiedExamples } from 'src/hooks/ExampleData/useUnverifiedExamples';
import EditOrCreateExample from '../editOrCreateExample';
import ExamplesTable from '../FlashcardFinder/ExamplesTable';
import 'src/App.css';
import './ExampleCreator.css';

export default function ExampleCreator() {
  const [singleOrSet, setSingleOrSet] = useState<'single' | 'set'>('set');
  const [spanishExample, setSpanishExample] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [spanishAudioLa, setSpanishAudioLa] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [flashcardSet, setFlashcardSet] = useState<NewFlashcard[]>([]);
  const [englishAudio, setEnglishAudio] = useState('');

  const toggleSingleOrSet = () => {
    if (singleOrSet === 'single') {
      setSingleOrSet('set');
    } else {
      setSingleOrSet('single');
    }
  };

  const parsedAreaInput: NewFlashcard[] = useMemo(() => {
    const lines = areaInput.split('\n').map((line) => line.split('\t'));
    return lines.map((line) => {
      return {
        spanishExample: line[0],
        englishTranslation: line[1],
        spanglish: line[0].includes('*') ? 'spanglish' : 'esp',
        spanishAudioLa: line[2] || '',
        englishAudio: line[3] || '',
        vocabComplete: false,
      };
    });
  }, [areaInput]);

  const { unverifiedExamplesQuery, addUnverifiedExample } =
    useUnverifiedExamples();

  const tableData = unverifiedExamplesQuery.data ?? [];

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

  return (
    <div>
      <h2>Example Creator</h2>
      <div id="singleOrSet">
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
                      <tr key={example.spanishExample}>
                        <td>
                          {formatSpanishText(
                            example.spanglish,
                            example.spanishExample,
                          )}
                        </td>
                        <td>{formatEnglishText(example.englishTranslation)}</td>
                        <td>{example.spanishAudioLa}</td>
                        <td>{example.englishAudio}</td>
                        <td>{example.spanglish}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <button
                type="button"
                onClick={() => {
                  setFlashcardSet(parsedAreaInput);
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
