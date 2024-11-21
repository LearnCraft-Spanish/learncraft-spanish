import React, { useEffect, useMemo, useState } from 'react';
import {
  formatEnglishText,
  formatSpanishText,
} from '../../functions/formatFlashcardText';

export default function ExampleCreator() {
  const [spanishExample, setSpanishExample] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');

  const spanglish = useMemo(() => {
    const hasAsterisk = spanishExample.includes('*');
    if (hasAsterisk) {
      return 'spanglish';
    } else {
      return 'esp';
    }
  }, [spanishExample]);

  return (
    <div>
      <div>
        <h2>Example Creator</h2>
      </div>
      <div>
        <div>
          {formatSpanishText(spanglish, spanishExample)}
          {formatEnglishText(englishTranslation)}
          {spanglish === 'spanglish' && <p>Spanglish Detected</p>}
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <label id="spanishExample">Spanish Example</label>
          <input
            id="spanishExample"
            type="textarea"
            value={spanishExample}
            onChange={(e) => setSpanishExample(e.target.value)}
          />
          <label id="englishTranslation">English Translation</label>
          <input
            id="englishTranslation"
            type="textarea"
            value={englishTranslation}
            onChange={(e) => setEnglishTranslation(e.target.value)}
          />
          <button type="submit">Save Example</button>
        </form>
      </div>
    </div>
  );
}
