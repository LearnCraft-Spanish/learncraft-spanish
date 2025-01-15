import React, { useMemo, useState } from 'react';
import {
  formatEnglishText,
  formatSpanishText,
} from '../../functions/formatFlashcardText';
import type { NewFlashcard } from '../../types/interfaceDefinitions';
import { useUnverifiedExamples } from '../../hooks/useUnverifiedExamples';
import ExamplesTable from '../FlashcardFinder/ExamplesTable';
import { AudioControl } from './AudioControl';
import '../../App.css';
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
        <form id="exampleForm" onSubmit={(e) => handleAddExample(e)}>
          <h3>Create Example</h3>
          <div>
            <div className="inputWrapper">
              <label id="spanishExample" className="required">
                Spanish Example
              </label>
              <input
                id="spanishExample"
                type="textarea"
                value={spanishExample}
                onChange={(e) => setSpanishExample(e.target.value)}
                required
                className="styledInput"
              />
            </div>
            <div className="inputWrapper">
              <label id="englishTranslation" className="required">
                English Translation
              </label>
              <input
                id="englishTranslation"
                type="textarea"
                value={englishTranslation}
                onChange={(e) => setEnglishTranslation(e.target.value)}
                required
                className="styledInput"
              />
            </div>
          </div>
          <div>
            <div className="inputWrapper">
              <label id="spanishAudioLa">Spanish Audio Link</label>
              <input
                id="spanishAudioLa"
                type="url"
                value={spanishAudioLa}
                onChange={(e) => setSpanishAudioLa(e.target.value)}
                className="styledInput"
              />
            </div>
            <div className="inputWrapper">
              <label id="englishAudio">English Audio Link</label>
              <input
                id="englishAudio"
                type="url"
                value={englishAudio}
                onChange={(e) => setEnglishAudio(e.target.value)}
                className="styledInput"
              />
            </div>
          </div>
          <button type="submit">Save Example</button>
        </form>
        <div id="examplePreview">
          <h3>Example Preview</h3>
          <div>
            <h4>Spanish Example:</h4>
            <div className="previewCard">
              {formatSpanishText(spanglish, spanishExample)}
              <AudioControl audioLink={spanishAudioLa} />
            </div>
          </div>
          <div>
            <h4>English Example:</h4>
            <div className="previewCard">
              {formatEnglishText(englishTranslation)}
              <AudioControl audioLink={englishAudio} />
            </div>
          </div>
        </div>
      </div>

      <div id="newExamples">
        <h3>New Examples</h3>
        <ExamplesTable dataSource={tableData} displayOrder={displayOrder} />
      </div>
    </div>
  );
}
