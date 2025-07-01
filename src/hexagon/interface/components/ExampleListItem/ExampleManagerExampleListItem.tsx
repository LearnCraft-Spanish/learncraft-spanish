// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH EXAMPLE MANAGER, i think :)
import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';

import { useCallback, useState } from 'react';
import ExampleListItemFactory from './ExampleListItemFactory';
import MoreInfoButton from './units/MoreInfoButton';
import MoreInfoViewFlashcard from './units/MoreInfoViewFlashcard';

export default function ExampleListItem({
  example,
}: {
  example: ExampleWithVocabulary;
}) {
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);

  const onClickMoreInfo = useCallback(() => {
    setIsMoreInfoOpen(!isMoreInfoOpen);
  }, [isMoreInfoOpen]);

  return (
    <div className="exampleCardWithMoreInfo">
      <ExampleListItemFactory
        example={example}
        postTextComponents={[
          <MoreInfoButton
            onClickFunction={onClickMoreInfo}
            isOpen={isMoreInfoOpen}
            key="moreInfoButton"
          />,
        ]}
      />
      <MoreInfoViewFlashcard
        example={example}
        isCustom={false} // ADD A REAL WAY TO CHECK THIS
        isOpen={isMoreInfoOpen}
      />
    </div>
  );
}
