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
import BulkAddButton from './units/BulkAddButton';
import MoreInfoButton from './units/MoreInfoButton';
import MoreInfoViewExample from './units/MoreInfoViewExample';

export default function ExampleListItem({
  example,
  isCollected,
  isPending,
  handleSingleAdd,
  handleRemoveSelected,
  handleSelect,
  handleRemove,
  isSelected,
  lessonPopup,
}: {
  example: Flashcard | ExampleWithVocabulary | null;
  isCollected: boolean;
  isPending: boolean;
  handleSingleAdd: () => Promise<void>;
  handleRemoveSelected: () => void;
  handleSelect: () => void;
  handleRemove: () => Promise<void>;
  bulkSelectMode: boolean;
  isSelected?: boolean;
  lessonPopup: LessonPopup;
}) {
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
  const { openContextual, setContextualRef, contextual } = useContextualMenu();

  const onClickMoreInfo = useCallback(() => {
    setIsMoreInfoOpen(!isMoreInfoOpen);
  }, [isMoreInfoOpen]);

  const [pending, setPending] = useState(false);

  const handleAddWrapper = useCallback(async () => {
    setPending(true);
    handleSingleAdd()
      .then(() => {
        if (isSelected) {
          handleRemoveSelected();
        }
      })
      .finally(() => {
        setPending(false);
      });
  }, [handleSingleAdd, isSelected, handleRemoveSelected]);

  const handleRemoveWrapper = useCallback(async () => {
    setPending(true);
    handleRemove()
      .then(() => {
        if (isSelected) {
          handleRemoveSelected();
        }
      })
      .finally(() => {
        setPending(false);
      });
  }, [handleRemove, isSelected, handleRemoveSelected]);

  if (!example) {
    return null;
  }

  return (
    <div className="exampleCardWithMoreInfo">
      <ExampleListItemFactory
        preTextComponents={[
          <BulkAddButton
            key="bulkAddButton"
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
