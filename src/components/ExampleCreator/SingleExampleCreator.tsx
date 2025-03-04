import type { NewFlashcard } from 'src/types/interfaceDefinitions';
import React, { useMemo, useState } from 'react';
import { useRecentlyEditedExamples } from 'src/hooks/ExampleData/useRecentlyEditedExamples';
import EditOrCreateExample from '../editOrCreateExample';
import ExamplesTable from '../ExamplesTable/ExamplesTable';

export default function SingleExampleCreator() {
  const [spanishExample, setSpanishExample] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [spanishAudioLa, setSpanishAudioLa] = useState('');
  const [englishAudio, setEnglishAudio] = useState('');

  const { recentlyEditedExamplesQuery, addUnverifiedExample } =
    useRecentlyEditedExamples();

  const spanglish = useMemo(() => {
    return spanishExample.includes('*') ? 'spanglish' : 'esp';
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

  const displayOrder =
    recentlyEditedExamplesQuery.data?.map((example) => ({
      recordId: example.recordId,
    })) ?? [];

  return (
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
        <ExamplesTable
          dataSource={recentlyEditedExamplesQuery.data ?? []}
          displayOrder={displayOrder}
        />
      </div>
    </>
  );
}
