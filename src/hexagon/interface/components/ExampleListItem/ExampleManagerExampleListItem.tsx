// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH EXAMPLE MANAGER, i think :)
import type { Flashcard } from '@learncraft-spanish/shared';

import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';
import { useCallback, useState } from 'react';
import { useContextualMenu } from '../../hooks/useContextualMenu';
import ExampleListItemFactory from './ExampleListItemFactory';
import AddPendingRemove from './units/AddPendingRemove';
import BulkRemoveButton from './units/BulkRemoveButton';
import MoreInfoButton from './units/MoreInfoButton';
import MoreInfoViewFlashcard from './units/MoreInfoViewFlashcard';

export default function ExampleListItem({
  flashcard,
  isCollected,
  isPending,
  handleSingleAdd,
  handleRemove,
  handleDeselect,
  handleSelect,
  isSelected,
  lessonPopup,
}: {
  flashcard: Flashcard | null;
  isCollected: boolean;
  isPending: boolean;
  handleSingleAdd: () => Promise<void>;
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

  const [pending, setPending] = useState(false);

  const handleAddWrapper = useCallback(async () => {
    setPending(true);
    await handleSingleAdd();
    setPending(false);
    if (isSelected) {
      handleDeselect();
    }
  }, [handleSingleAdd, isSelected, handleDeselect]);

  const handleRemoveWrapper = useCallback(async () => {
    setPending(true);
    handleRemove()
      .then(() => {
        if (isSelected) {
          handleDeselect();
        }
      })
      .finally(() => {
        setPending(false);
      });
  }, [handleRemove, isSelected, handleDeselect]);
  const { openContextual, setContextualRef, contextual } = useContextualMenu();

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
            isPending={isPending || pending}
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
            id={flashcard.example.id}
            isCollected={isCollected}
            isPending={isPending || pending}
            handleAdd={handleAddWrapper}
            handleRemove={handleRemoveWrapper}
            key="addPendingRemove"
          />,
        ]}
      />

      <MoreInfoViewFlashcard
        flashcard={flashcard}
        isCustom={false} // TODO: add custom flashcard
        isOpen={isMoreInfoOpen}
        openContextual={openContextual}
        contextual={contextual}
        setContextualRef={setContextualRef}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
