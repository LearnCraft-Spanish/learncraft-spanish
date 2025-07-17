// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH EXAMPLE MANAGER, i think :)
import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';

import { useCallback, useState } from 'react';
import ExampleListItemFactory from './ExampleListItemFactory';
import AddPendingRemove from './units/AddPendingRemove';
import BulkAddRemove from './units/BulkAddRemove';
import MoreInfoButton from './units/MoreInfoButton';
import MoreInfoViewExample from './units/MoreInfoViewExample';

export default function ExampleListItem({
  example,
  isCollected,
  isPending,
  handleAdd,
  handleRemove,
  bulkAddMode,
  isSelected,
}: {
  example: ExampleWithVocabulary | null;
  isCollected: boolean;
  isPending: boolean;
  handleAdd: () => void;
  handleRemove: () => void;
  bulkAddMode: boolean;
  isSelected?: boolean;
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
          bulkAddMode ? (
            <BulkAddRemove
              id={example.id}
              isCollected={isCollected}
              handleAdd={handleAdd}
              handleRemove={handleRemove}
              key="addPendingRemove"
              isSelected={isSelected ?? false}
            />
          ) : (
            <AddPendingRemove
              id={example.id}
              isCollected={isCollected}
              isPending={isPending}
              handleAdd={handleAdd}
              handleRemove={handleRemove}
              key="addPendingRemove"
            />
          ),
        ]}
      />
      <MoreInfoViewExample example={example} isOpen={isMoreInfoOpen} />
    </div>
  );
}
