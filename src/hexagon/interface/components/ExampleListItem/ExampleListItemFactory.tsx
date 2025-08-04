import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import type { ReactNode } from 'react';
import { ExampleText } from './units';

import './ExampleListItem.scss';

export default function ExampleListItemFactory({
  example,
  preTextComponents,
  postTextComponents,
}: {
  example: ExampleWithVocabulary | Flashcard;
  preTextComponents?: ReactNode[]; // should this be ReactElement (jsx only)?
  postTextComponents?: ReactNode[]; // should this be ReactElement (jsx only)?
}) {
  let exampleWithVocabulary: ExampleWithVocabulary;
  if ('vocabulary' in example) {
    exampleWithVocabulary = example;
  } else {
    exampleWithVocabulary = example.example;
  }

  return (
    <div className="exampleCard" key={exampleWithVocabulary.id}>
      {preTextComponents && [...preTextComponents]}
      <ExampleText
        isSpanglish={exampleWithVocabulary.spanglish}
        spanishExample={exampleWithVocabulary.spanish}
        englishTranslation={exampleWithVocabulary.english}
        spanishAudio={exampleWithVocabulary.spanishAudio}
        englishAudio={exampleWithVocabulary.englishAudio}
      />
      {postTextComponents && [...postTextComponents]}
    </div>
  );
}
