// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH EXAMPLE MANAGER, i think :)
import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';

import { useCallback, useState } from 'react';
import ExampleListItemFactory from './ExampleListItemFactory';
import AddPendingRemove from './units/AddPendingRemove';
import MoreInfoButton from './units/MoreInfoButton';
import MoreInfoViewExample from './units/MoreInfoViewExample';

export default function ExampleListItem({
  example,
  isCollected,
  isPending,
  handleAdd,
  handleRemove,
}: {
  example: ExampleWithVocabulary | null;
  isCollected: boolean;
  isPending: boolean;
  handleAdd: () => void;
  handleRemove: () => void;
}) {
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);

  const onClickMoreInfo = useCallback(() => {
    setIsMoreInfoOpen(!isMoreInfoOpen);
  }, [isMoreInfoOpen]);

  if (!example) {
    return null;
  }

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
          <AddPendingRemove
            id={example.id}
            isCollected={isCollected}
            isPending={isPending}
            handleAdd={handleAdd}
            handleRemove={handleRemove}
            key="addPendingRemove"
          />,
        ]}
      />
      <MoreInfoViewExample example={example} isOpen={isMoreInfoOpen} />
    </div>
  );
}
