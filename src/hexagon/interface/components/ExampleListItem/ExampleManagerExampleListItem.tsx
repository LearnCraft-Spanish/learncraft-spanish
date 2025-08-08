// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH EXAMPLE MANAGER, i think :)
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';

import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';
import { useCallback, useState } from 'react';
import { useContextualMenu } from '../../hooks/useContextualMenu';
import ExampleListItemFactory from './ExampleListItemFactory';
import AddPendingRemove from './units/AddPendingRemove';
import BulkRemoveButton from './units/BulkRemoveButton';
import MoreInfoButton from './units/MoreInfoButton';
import MoreInfoViewFlashcard from './units/MoreInfoViewFlashcard';

export default function ExampleListItem({
  example,
  isCollected,
  isPending,
  handleSingleAdd,
  handleRemove,
  handleRemoveSelected,
  handleSelect,
  isSelected,
  lessonPopup,
}: {
  example: Flashcard | ExampleWithVocabulary | null;
  isCollected: boolean;
  isPending: boolean;
  handleSingleAdd: () => Promise<void>;
  handleRemove: () => Promise<void>;
  handleRemoveSelected: () => void;
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
      handleRemoveSelected();
    }
  }, [handleSingleAdd, isSelected, handleRemoveSelected]);

  const handleRemoveWrapper = useCallback(async () => {
    setPending(true);
    await handleRemove();
    setPending(false);
    if (isSelected) {
      handleRemoveSelected();
    }
  }, [handleRemove, isSelected, handleRemoveSelected]);
  const { openContextual, setContextualRef, contextual } = useContextualMenu();

  if (!example) {
    return null;
  }

  return (
    <div className="exampleCardWithMoreInfo">
      <ExampleListItemFactory
        preTextComponents={[
          <BulkRemoveButton
            key="bulkRemoveButton"
            id={example.id}
            isCollected={isCollected}
            handleSelect={handleSelect}
            handleRemoveSelected={handleRemoveSelected}
            isSelected={isSelected ?? false}
            isPending={isPending || pending}
          />,
        ]}
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
            isPending={isPending || pending}
            handleAdd={handleAddWrapper}
            handleRemove={handleRemoveWrapper}
            key="addPendingRemove"
          />,
        ]}
      />
      <MoreInfoViewFlashcard
        flashcard={example as Flashcard}
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
