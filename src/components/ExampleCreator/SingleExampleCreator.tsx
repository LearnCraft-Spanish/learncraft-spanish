import type { NewFlashcard } from 'src/types/interfaceDefinitions';
import React, { useMemo, useState } from 'react';
import { useRecentlyEditedExamples } from 'src/hooks/ExampleData/useRecentlyEditedExamples';
import EditOrCreateExample from '../editOrCreateExample';
import ExamplesTable from '../ExamplesTable/ExamplesTable';

interface SingleExampleCreatorProps {
  editOrCreate: 'create' | 'edit';
  exampleDetails: {
    spanishExample: string;
    englishTranslation: string;
    spanishAudioLa: string;
    englishAudio: string;
  };
  setExampleDetails: React.Dispatch<
    React.SetStateAction<{
      spanishExample: string;
      englishTranslation: string;
      spanishAudioLa: string;
      englishAudio: string;
    }>
  >;
  vocabIncluded: string[];
  setVocabIncluded: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function SingleExampleCreator({
  editOrCreate,
  exampleDetails,
  setExampleDetails,
  vocabIncluded,
  setVocabIncluded,
}: SingleExampleCreatorProps) {
  const { recentlyEditedExamplesQuery, addUnverifiedExample } =
    useRecentlyEditedExamples();

  const spanglish = useMemo(() => {
    return exampleDetails.spanishExample.includes('*') ? 'spanglish' : 'esp';
  }, [exampleDetails.spanishExample]);

  const newFlashcard: NewFlashcard = useMemo(() => {
    return {
      ...exampleDetails,
      spanglish,
      vocabComplete: false,
    };
  }, [exampleDetails, spanglish]);

  function handleAddExample(e: React.FormEvent) {
    e.preventDefault();
    addUnverifiedExample(newFlashcard);
    setExampleDetails({
      spanishExample: '',
      englishTranslation: '',
      spanishAudioLa: '',
      englishAudio: '',
    });
  }

  const displayOrder =
    recentlyEditedExamplesQuery.data?.map((example) => ({
      recordId: example.recordId,
    })) ?? [];

  return (
    <>
      <div id="exampleCreator">
        <EditOrCreateExample
          editOrCreate={editOrCreate}
          onSubmit={handleAddExample}
          spanishExample={exampleDetails.spanishExample}
          setSpanishExample={(value) =>
            setExampleDetails((prev) => ({ ...prev, spanishExample: value }))
          }
          spanglish={spanglish}
          englishTranslation={exampleDetails.englishTranslation}
          setEnglishTranslation={(value) =>
            setExampleDetails((prev) => ({
              ...prev,
              englishTranslation: value,
            }))
          }
          spanishAudioLa={exampleDetails.spanishAudioLa}
          setSpanishAudioLa={(value) =>
            setExampleDetails((prev) => ({ ...prev, spanishAudioLa: value }))
          }
          englishAudio={exampleDetails.englishAudio}
          setEnglishAudio={(value) =>
            setExampleDetails((prev) => ({ ...prev, englishAudio: value }))
          }
        />
      </div>
    </>
  );
}
