// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH EXAMPLE MANAGER, i think :)
import type { Flashcard } from '@learncraft-spanish/shared';

import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';
import { useCallback, useState } from 'react';
import { useContextualMenu } from '../../hooks/useContextualMenu';
import ExampleListItemFactory from './ExampleListItemFactory';
import BulkRemoveButton from './units/BulkRemoveButton';
import DeleteFlashcard from './units/DeleteFlashcard';
import MoreInfoButton from './units/MoreInfoButton';
import MoreInfoViewFlashcard from './units/MoreInfoViewFlashcard';

export default function ExampleListItem({
  flashcard,
  isCollected,
  isAdding,
  isRemoving,
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
          <DeleteFlashcard handleRemove={handleRemove} key="deleteFlashcard" />,
        ]}
      />

      <MoreInfoViewFlashcard
        flashcard={flashcard}
        isCustom={false} // TODO: add custom flashcard
        isOpen={isMoreInfoOpen}
        openContextual={openContextual}
        contextual={contextual}
        closeContextual={closeContextual}
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
