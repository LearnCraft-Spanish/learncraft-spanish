// THIS WILL NOT LIVE IN THIS FOLDER. IT SHOULD BE LOCATED WITH EXAMPLE MANAGER, i think :)
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';

import type { LessonPopup } from 'src/hexagon/application/units/useLessonPopup';
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
  lessonPopup,
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
  lessonPopup: LessonPopup;
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
        lessonPopup={lessonPopup}
      />
    </div>
  );
}
