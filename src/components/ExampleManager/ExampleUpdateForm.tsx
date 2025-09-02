import {
  formatEnglishText,
  formatSpanishText,
} from 'src/functions/formatFlashcardText';
import { AudioControl } from './AudioControl';

interface ExampleUpdateFormProps {
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
}
export default function ExampleUpdateForm({
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
}: ExampleUpdateFormProps) {
  const spanglish = spanishExample.includes('*') ? 'spanglish' : 'esp';

  return (
    <>
      {/* <form id="exampleForm" onSubmit={(e) => handleAddExample(e)}> */}
      <form id="exampleForm" onSubmit={(e) => onSubmit(e)}>
        <h3>{editOrCreate === 'create' ? 'Create Example' : 'Edit Example'}</h3>
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
            {formatSpanishText(spanishExample)}
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
    </>
  );
}
