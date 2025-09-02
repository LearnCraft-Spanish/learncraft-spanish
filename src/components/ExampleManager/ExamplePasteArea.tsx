import type { Flashcard } from 'src/types/interfaceDefinitions';
import React from 'react';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';

interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
}

interface ExamplePasteAreaProps {
  areaInput: string;
  onInputChange: (value: string) => void;
  validationSummary: ValidationSummary | null;
  parsedAreaInput: Flashcard[];
  existingExamples: Set<string>;
  onNext: () => void;
}

export function ExamplePasteArea({
  areaInput,
  onInputChange,
  validationSummary,
  parsedAreaInput,
  existingExamples,
  onNext,
}: ExamplePasteAreaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const allowTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = `${areaInput.substring(0, start)}\t${areaInput.substring(end)}`;
      onInputChange(newValue);
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
  };

  return (
    <div className="setCreatorContainer">
      <textarea
        ref={textareaRef}
        value={areaInput}
        onChange={handleChange}
        onKeyDown={allowTab}
        placeholder={
          'Paste table here in the following format: \nSpanish Example\tEnglish Translation\tSpanish Audio\tEnglish Audio'
        }
        rows={6}
        cols={120}
      />
      {validationSummary && (
        <div className="validation-summary">
          Found {validationSummary.total} rows: {validationSummary.valid} valid,{' '}
          {validationSummary.invalid} with errors
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
                const errorMessages: string[] = [];

                // Check for missing required fields
                const hasSpanish =
                  example.spanishExample &&
                  !example.spanishExample.includes('ERROR');
                const hasEnglish =
                  example.englishTranslation &&
                  !example.englishTranslation.includes('ERROR');
                if (!hasSpanish || !hasEnglish) {
                  const message = `Missing ${!hasSpanish ? 'Spanish' : ''}${!hasSpanish && !hasEnglish ? ' and ' : ''}${!hasEnglish ? 'English' : ''} text`;
                  validationMessages.push(message);
                  errorMessages.push(message);
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
                    errorMessages.push(
                      'This duplicate will be removed, keeping the first instance',
                    );
                  }
                }

                // Check for existing examples
                const isExisting = existingExamples.has(example.spanishExample);
                if (isExisting) {
                  validationMessages.push(
                    'This example already exists in the database',
                  );
                }

                const showError = errorMessages.length > 0;

                return (
                  <tr
                    key={example.recordId}
                    className={showError ? 'duplicate-row' : ''}
                  >
                    <td>
                      <div
                        className={showError ? 'duplicate-content-wrapper' : ''}
                      >
                        {!hasSpanish ? (
                          <span>{example.spanishExample}</span>
                        ) : (
                          formatSpanishText(example.spanishExample)
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
                        className={showError ? 'duplicate-content-wrapper' : ''}
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
              onClick={onNext}
              disabled={parsedAreaInput.every((ex) => {
                const hasErrors =
                  !ex.spanishExample ||
                  ex.spanishExample.includes('ERROR') ||
                  !ex.englishTranslation ||
                  ex.englishTranslation.includes('ERROR');
                return hasErrors;
              })}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamplePasteArea;
