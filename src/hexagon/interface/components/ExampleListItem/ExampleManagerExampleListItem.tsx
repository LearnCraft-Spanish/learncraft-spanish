// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH EXAMPLE MANAGER, i think :)
import type {
  ExampleWithVocabulary,
  Flashcard,
  Lesson,
} from '@learncraft-spanish/shared';

import { useState } from 'react';
import { useContextualMenu } from '../../hooks/useContextualMenu';
import ExampleListItemFactory from './ExampleListItemFactory';
import BulkRemoveButton from './units/BulkRemoveButton';
import MoreInfoButton from './units/MoreInfoButton';
import MoreInfoViewExample from './units/MoreInfoViewExample';

export default function ExampleListItem({
  example,
  isCollected,
  isPending,
  handleRemoveSelected,
  handleSelect,
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

  if (!example) {
    return null;
  }

  return (
    <div className="exampleCardWithMoreInfo">
      <ExampleListItemFactory
        example={example}
        postTextComponents={[
          <MoreInfoButton
            onClickFunction={() => setIsMoreInfoOpen(!isMoreInfoOpen)}
            isOpen={isMoreInfoOpen}
            key="moreInfoButton"
          />,
          <BulkRemoveButton
            id={example.id}
            isCollected={isCollected}
            handleSelect={handleSelect}
            handleRemoveSelected={handleRemoveSelected}
            isSelected={isSelected ?? false}
            isPending={isPending}
            key="bulkRemoveButton"
          />,
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
