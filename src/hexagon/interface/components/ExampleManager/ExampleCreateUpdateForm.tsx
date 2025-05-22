import { VocabTag } from 'src/components/ExampleManager/VocabTag';
import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { AudioControl } from './AudioControl';

interface ExampleCreateUpdateFormProps {
  editOrCreate: 'edit' | 'create';
  onSubmit: (e: React.FormEvent) => void;
  spanishExample: string;
  setSpanishExample: (value: string) => void;
  englishTranslation: string;
  setEnglishTranslation: (value: string) => void;
  spanishAudioLa: string;
  setSpanishAudioLa: (value: string) => void;
  englishAudio: string;
  setEnglishAudio: (value: string) => void;
  selectedExampleId: number | null;
  vocabSearchTerm: string;
  setVocabSearchTerm: (value: string) => void;
  vocabComplete: boolean;
  setVocabComplete: (value: boolean) => void;
  tagsFilteredByInput: any[];
  addToSelectedVocab: (value: string) => void;
  includedVocabObjects: any[];
  removeFromVocabIncluded: (value: string) => void;
  handleVerifyExampleChange: (value: boolean) => void;
  updateVocabSearchTerm: (value: string) => void;
}
// Way to many params. simplify into a better object/setObject structure
export default function ExampleCreateUpdateForm({
  editOrCreate,
  onSubmit,
  spanishExample,
  setSpanishExample,
  englishTranslation,
  setEnglishTranslation,
  spanishAudioLa,
  setSpanishAudioLa,
  englishAudio,
  setEnglishAudio,
  selectedExampleId,
  vocabSearchTerm,
  // setVocabSearchTerm,
  vocabComplete,
  // setVocabComplete,
  tagsFilteredByInput,
  addToSelectedVocab,
  includedVocabObjects,
  removeFromVocabIncluded,
  updateVocabSearchTerm,
  handleVerifyExampleChange,
}: ExampleCreateUpdateFormProps) {
  const { setContextualRef, openContextual, contextual } = useContextualMenu();

  const spanglish = spanishExample.includes('*') ? 'spanglish' : 'esp';

  return (
    <div id="exampleCreateUpdateSection">
      {/* <form id="exampleForm" onSubmit={(e) => handleAddExample(e)}> */}
      <div id="exampleFormAndPreview">
        <form id="exampleForm" onSubmit={(e) => onSubmit(e)}>
          <h3>
            {editOrCreate === 'create' ? 'Create Example' : 'Edit Example'}
          </h3>
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
          {editOrCreate === 'create' && (
            <button type="submit">Create Example</button>
          )}
          {editOrCreate === 'edit' && (
            <button type="submit">Update Example</button>
          )}
        </form>
        <div id="examplePreview">
          <h3>Example Preview</h3>
          <div>
            <h4>Spanish Example:</h4>
            <div className="previewCard">
              {formatSpanishText(spanglish, spanishExample)}
              {spanishAudioLa && <AudioControl audioLink={spanishAudioLa} />}
            </div>
          </div>
          <div>
            <h4>English Example:</h4>
            <div className="previewCard">
              {formatEnglishText(englishTranslation)}
              {englishAudio && <AudioControl audioLink={englishAudio} />}
            </div>
          </div>
        </div>
      </div>
      {/* this is copy/paste from original file, please refactor */}
      {selectedExampleId && selectedExampleId > 0 && (
        <div id="vocabTagging">
          <div className="halfOfScreen tagSearchBox">
            <h3>Search for Vocab</h3>
            <input
              type="text"
              name="search"
              id="search"
              value={vocabSearchTerm}
              placeholder="Search vocabulary"
              className="searchBox"
              onChange={(e) => updateVocabSearchTerm(e.target.value)}
              onFocus={() => openContextual('vocabTagging')}
            />
            {!!vocabSearchTerm.length && contextual === 'vocabTagging' && (
              <div className="tagSuggestionBox" ref={setContextualRef}>
                {tagsFilteredByInput.map((item) => (
                  <div
                    key={item.recordId}
                    className="vocabTag tagCard"
                    onClick={() => addToSelectedVocab(item.vocabName)}
                  >
                    <h4 className="vocabName">
                      {item.descriptionOfVocabularySkill}
                    </h4>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="halfOfScreen">
            <h3>Vocab Included</h3>
            <div className="vocabTagBox">
              {includedVocabObjects.map((vocab) => (
                <VocabTag
                  key={vocab.recordId}
                  vocab={vocab}
                  removeFromVocabList={removeFromVocabIncluded}
                />
              ))}
            </div>
            <div className="vocabCompleteContainer">
              <p>Vocab Complete:</p>
              <label htmlFor="vocabComplete" className="switch">
                <input
                  type="checkbox"
                  id="vocabComplete"
                  checked={vocabComplete}
                  onChange={() => handleVerifyExampleChange(!vocabComplete)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
