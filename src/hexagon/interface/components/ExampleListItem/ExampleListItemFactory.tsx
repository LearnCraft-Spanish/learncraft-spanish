import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import type { ReactNode } from 'react';
import { ExampleText } from './units';

import './ExampleListItem.scss';

export default function ExampleListItemFactory({
  example,
  preTextComponents,
  postTextComponents,
}: {
  example: ExampleWithVocabulary;
  preTextComponents?: ReactNode[]; // should this be ReactElement (jsx only)?
  postTextComponents?: ReactNode[]; // should this be ReactElement (jsx only)?
}) {
  return (
    <div className="exampleCard" key={example.id}>
      {preTextComponents && [...preTextComponents]}
      <ExampleText
        isSpanglish={example.spanglish}
        spanishExample={example.spanish}
        englishTranslation={example.english}
        spanishAudio={example.spanishAudio}
        englishAudio={example.englishAudio}
      />
      {postTextComponents && [...postTextComponents]}
    </div>
  );
}
