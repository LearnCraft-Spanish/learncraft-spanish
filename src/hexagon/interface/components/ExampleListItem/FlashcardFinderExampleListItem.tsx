// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH FLASHCARD FINDER, i think :)
import type {
  ExampleWithVocabulary,
  Flashcard,
  Lesson,
} from '@learncraft-spanish/shared';

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
  handleAdd,
  handleRemoveSelected,
  handleSelect,
  handleRemove,
  bulkSelectMode,
  isSelected,
  lessonsByVocabulary,
  lessonsLoading,
}: {
  example: Flashcard | ExampleWithVocabulary | null;
  isCollected: boolean;
  isPending: boolean;
  handleAdd: () => void;
  handleRemoveSelected: () => void;
  handleSelect: () => void;
  handleRemove: () => void;
  bulkSelectMode: boolean;
  isSelected?: boolean;
  lessonsByVocabulary: Lesson[];
  lessonsLoading: boolean;
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
        example={example}
        postTextComponents={[
          <MoreInfoButton
            onClickFunction={onClickMoreInfo}
            isOpen={isMoreInfoOpen}
            key="moreInfoButton"
          />,
          bulkSelectMode ? (
            <BulkAddButton
              id={example.id}
              isCollected={isCollected}
              handleSelect={handleSelect}
              handleRemoveSelected={handleRemoveSelected}
              isSelected={isSelected ?? false}
              isPending={isPending}
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
      <MoreInfoViewExample
        example={example}
        isOpen={isMoreInfoOpen}
        openContextual={openContextual}
        contextual={contextual}
        setContextualRef={setContextualRef}
        lessonsByVocabulary={lessonsByVocabulary}
        lessonsLoading={lessonsLoading}
      />
    </div>
  );
}
