import type { LessonPopup } from '@application/units/useLessonPopup';

// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH EXAMPLE MANAGER, i think :)
import type { Flashcard } from '@learncraft-spanish/shared';
import ExampleListItemFactory from '@interface/components/ExampleListItem/ExampleListItemFactory';
import AddPendingRemove from '@interface/components/ExampleListItem/units/AddPendingRemove';
import BulkRemoveButton from '@interface/components/ExampleListItem/units/BulkRemoveButton';
import MoreInfoButton from '@interface/components/ExampleListItem/units/MoreInfoButton';
import MoreInfoViewFlashcard from '@interface/components/ExampleListItem/units/MoreInfoViewFlashcard';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useCallback, useState } from 'react';
export default function ExampleListItem({
  flashcard,
  isCollected,
  isAdding,
  isRemoving,
  isCustom,
  handleRemove,
  handleDeselect,
  handleSelect,
  isSelected,
  lessonPopup,
}: {
  flashcard: Flashcard | null;
  isCollected: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  isCustom: boolean;
  handleRemove: () => Promise<void>;
  handleDeselect: () => void;
  handleSelect: () => void;
  isSelected?: boolean;
  lessonPopup: LessonPopup;
}) {
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);

  const onClickMoreInfo = useCallback(() => {
    setIsMoreInfoOpen(!isMoreInfoOpen);
  }, [isMoreInfoOpen]);

  const { openContextual, closeContextual, contextual } = useContextualMenu();

  if (!flashcard) {
    return null;
  }

  return (
    <div className="exampleCardWithMoreInfo">
      <ExampleListItemFactory
        preTextComponents={[
          <BulkRemoveButton
            key="bulkRemoveButton"
            id={flashcard.example.id}
            isCollected={isCollected}
            handleSelect={handleSelect}
            handleDeselect={handleDeselect}
            isSelected={isSelected ?? false}
            isAdding={isAdding}
            isRemoving={isRemoving}
          />,
        ]}
        example={flashcard.example}
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
            handleAdd={() => {}}
            handleRemove={handleRemove}
            key="addPendingRemove"
          />,
        ]}
      />

      <MoreInfoViewFlashcard
        flashcard={flashcard}
        isCustom={isCustom}
        isOpen={isMoreInfoOpen}
        openContextual={openContextual}
        contextual={contextual}
        closeContextual={closeContextual}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
