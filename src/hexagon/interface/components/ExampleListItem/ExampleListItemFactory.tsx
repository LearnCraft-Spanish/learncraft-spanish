import type { ExampleRecord } from '@LearnCraft-Spanish/shared';
import type { ReactNode } from 'react';
import { ExampleText } from './units';

import './ExampleListItem.scss';

export default function ExampleListItemFactory({
  example,
  preTextComponents,
  postTextComponents,
}: {
  example: ExampleRecord;
  preTextComponents?: ReactNode[]; // should this be ReactElement (jsx only)?
  postTextComponents?: ReactNode[]; // should this be ReactElement (jsx only)?
}) {
  return (
    <div className="exampleCard" key={example.recordId}>
      {preTextComponents && [...preTextComponents]}
      <ExampleText
        spanglish={example.spanglish}
        spanishExample={example.spanishExample}
        englishTranslation={example.englishTranslation}
      />
      {postTextComponents && [...postTextComponents]}
    </div>
  );
}
