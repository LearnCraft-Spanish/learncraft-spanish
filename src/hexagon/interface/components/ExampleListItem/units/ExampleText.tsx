import { formatEnglishText, formatSpanishText } from './helpers';

export default function ExampleText({
  isSpanglish,
  spanishExample,
  englishTranslation,
}: {
  isSpanglish: boolean;
  spanishExample: string;
  englishTranslation: string;
}) {
  return (
    <>
      <div className="exampleCardSpanishText">
        {formatSpanishText(isSpanglish, spanishExample)}
      </div>
      <div className="exampleCardEnglishText">
        {formatEnglishText(englishTranslation)}
      </div>
    </>
  );
}
