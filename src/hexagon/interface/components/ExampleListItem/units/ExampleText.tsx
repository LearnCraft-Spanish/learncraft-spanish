import { AudioControl } from '@interface/components/general';
import { formatEnglishText, formatSpanishText } from './helpers';

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
    <>
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
    </>
  );
}
