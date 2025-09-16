// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH FLASHCARD FINDER, i think :)
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';

import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';
import { useCallback, useState } from 'react';
import { useContextualMenu } from '../../hooks/useContextualMenu';
import ExampleListItemFactory from './ExampleListItemFactory';
import AddPendingRemove from './units/AddPendingRemove';
// import BulkAddButton from './units/BulkAddButton';
import MoreInfoButton from './units/MoreInfoButton';
import MoreInfoViewExample from './units/MoreInfoViewExample';

export default function ExampleListItem({
  example,
  isCollected,
  isAdding,
  isRemoving,
  handleAdd,
  handleRemove,
  lessonPopup,
}: {
  example: Flashcard | ExampleWithVocabulary | null;
  isCollected: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  handleAdd: () => void;
  handleRemove: () => void;
  lessonPopup: LessonPopup;
}) {
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
  const { openContextual, setContextualRef, contextual } = useContextualMenu();

  const onClickMoreInfo = useCallback(() => {
    setIsMoreInfoOpen(!isMoreInfoOpen);
  }, [isMoreInfoOpen]);

  if (!example) {
    return null;
  }

  return (
    <div className="exampleCardWithMoreInfo">
      <ExampleListItemFactory
        // preTextComponents={[
        //   <BulkAddButton
        //     key="bulkAddButton"
        //     id={example.id}
        //     isCollected={isCollected}
        //     handleSelect={handleSelect}
        //     handleRemoveSelected={handleRemoveSelected}
        //     isSelected={isSelected ?? false}
        //     isPending={isPending || pending}
        //   />,
        // ]}
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
            isAdding={isAdding}
            isRemoving={isRemoving}
            handleAdd={handleAdd}
            handleRemove={handleRemove}
            key="addPendingRemove"
          />,
        ]}
      />
      <MoreInfoViewExample
        example={example}
        isOpen={isMoreInfoOpen}
        openContextual={openContextual}
        contextual={contextual}
        setContextualRef={setContextualRef}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
