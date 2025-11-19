import type { LessonPopup } from '@application/units/useLessonPopup';

// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH FLASHCARD FINDER, i think :)
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import ExampleListItemFactory from '@interface/components/ExampleListItem/ExampleListItemFactory';
import AddPendingRemove from '@interface/components/ExampleListItem/units/AddPendingRemove';
// import BulkAddButton from './units/BulkAddButton';
import MoreInfoButton from '@interface/components/ExampleListItem/units/MoreInfoButton';
import MoreInfoViewExample from '@interface/components/ExampleListItem/units/MoreInfoViewExample';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useCallback, useState } from 'react';

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
  const { openContextual, closeContextual, contextual } = useContextualMenu();

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
        closeContextual={closeContextual}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
