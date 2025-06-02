import type { SpanglishType } from '@LearnCraft-Spanish/shared';
import { formatEnglishText, formatSpanishText } from './helpers';

export default function ExampleText({
  spanglish,
  spanishExample,
  englishTranslation,
}: {
  spanglish: SpanglishType;
  spanishExample: string;
  englishTranslation: string;
}) {
  return (
    <>
      <div className="exampleCardSpanishText">
        {formatSpanishText(spanglish, spanishExample)}
      </div>
      <div className="exampleCardEnglishText">
        {formatEnglishText(englishTranslation)}
      </div>
    </>
  );
}
