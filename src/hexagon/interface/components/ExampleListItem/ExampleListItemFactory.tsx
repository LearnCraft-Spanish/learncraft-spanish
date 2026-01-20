import type {
  Example,
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import type { ReactNode } from 'react';
import { ExampleText } from '@interface/components/ExampleListItem/units';

import './ExampleListItem.scss';

export default function ExampleListItemFactory({
  example,
  preTextComponents,
  postTextComponents,
}: {
  example: ExampleWithVocabulary | Flashcard | Example;
  preTextComponents?: ReactNode[]; // should this be ReactElement (jsx only)?
  postTextComponents?: ReactNode[]; // should this be ReactElement (jsx only)?
}) {
  let exampleWithVocabulary: ExampleWithVocabulary | Example;
  if ('vocabulary' in example) {
    exampleWithVocabulary = example as ExampleWithVocabulary;
  } else if ('example' in example) {
    exampleWithVocabulary = example.example as ExampleWithVocabulary;
  } else {
    exampleWithVocabulary = example as Example;
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
