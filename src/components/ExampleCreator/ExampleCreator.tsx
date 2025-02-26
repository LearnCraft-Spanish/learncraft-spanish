import type { NewFlashcard } from 'src/types/interfaceDefinitions';
import React, { useMemo, useState } from 'react';
import { useUnverifiedExamples } from 'src/hooks/ExampleData/useUnverifiedExamples';
import EditOrCreateExample from '../editOrCreateExample';
import ExamplesTable from '../FlashcardFinder/ExamplesTable';
import 'src/App.css';
import './ExampleCreator.css';

export default function ExampleCreator() {
  const [spanishExample, setSpanishExample] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [spanishAudioLa, setSpanishAudioLa] = useState('');
  const [englishAudio, setEnglishAudio] = useState('');

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
    </div>
  );
}
