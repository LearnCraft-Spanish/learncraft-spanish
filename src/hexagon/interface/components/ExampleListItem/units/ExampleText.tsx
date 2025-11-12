import {
  formatEnglishText,
  formatSpanishText,
} from '@interface/components/ExampleListItem/units/helpers';
import { AudioControl } from '@interface/components/general';

export default function ExampleText({
  isSpanglish,
  spanishExample,
  englishTranslation,
  spanishAudio,
  englishAudio,
}: {
  isSpanglish: boolean;
  spanishExample: string;
  englishTranslation: string;
  spanishAudio: string;
  englishAudio: string;
}) {
  return (
    <div className="exampleCardText">
      <div className="exampleCardSpanishText">
        {formatSpanishText(isSpanglish, spanishExample)}
        {spanishAudio && (
          <div className="audioWrapper">
            <AudioControl audioLink={spanishAudio} />
          </div>
        )}
      </div>
      <div className="exampleCardEnglishText">
        {formatEnglishText(englishTranslation)}
        {englishAudio && (
          <div className="audioWrapper">
            <AudioControl audioLink={englishAudio} />
          </div>
        )}
      </div>
    </div>
  );
}
