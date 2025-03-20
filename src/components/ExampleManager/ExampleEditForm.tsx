import type { UseQueryResult } from '@tanstack/react-query';
import type { Flashcard } from 'src/types/interfaceDefinitions';
import React from 'react';
import ExamplesTable from 'src/components/ExamplesTable/ExamplesTable';
import { Loading } from 'src/components/Loading';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import { AudioControl } from './AudioControl';

interface ExampleEditFormProps {
  unsavedFlashcardSet: Flashcard[];
  onUpdateExample: (recordId: number, field: string, value: string) => void;
  onSave: () => void;
  onBack: () => void;
  onContinue: () => void;
  onRestart: () => void;
  isSaving: boolean;
  exampleSetQuery: UseQueryResult<Flashcard[], unknown>;
}

export function ExampleEditForm({
  unsavedFlashcardSet,
  onUpdateExample,
  onSave,
  onBack,
  onContinue,
  onRestart,
  isSaving,
  exampleSetQuery,
}: ExampleEditFormProps) {
  return (
    <div>
      {unsavedFlashcardSet.length > 0 && (
        <>
          <h3>Example Preview</h3>
          {unsavedFlashcardSet.map((example) => (
            <div key={example.recordId} className="exampleCard">
              <div className="exampleCardSpanishText exampleAudioWrapper">
                {formatSpanishText(example.spanglish, example.spanishExample)}
                <AudioControl audioLink={example.spanishAudioLa} />
              </div>
              <div className="halfWrapper"></div>
              <div className="exampleCardEnglishText exampleAudioWrapper">
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
                        onUpdateExample(
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
                        onUpdateExample(
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
                        onUpdateExample(
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
                        onUpdateExample(
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
        {unsavedFlashcardSet.length > 0 && (
          <button type="button" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Example Set'}
          </button>
        )}
        {unsavedFlashcardSet.length === 0 &&
          exampleSetQuery.data &&
          exampleSetQuery.data.length > 0 && (
            <button type="button" onClick={onContinue}>
              Continue to Assignment
            </button>
          )}
      </div>
      {exampleSetQuery.isLoading && (
        <Loading message="Checking for examples..." />
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
      <div className="buttonBox">
        <button type="button" onClick={onBack}>
          Back to Paste
        </button>
        <button type="button" onClick={onRestart}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default ExampleEditForm;
