import type { Vocabulary } from '@learncraft-spanish/shared';
import VocabTagContainer from '@interface/components/VocabTagDetails/VocabTagContainer';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useState } from 'react';
import useLessonPopup from 'src/hexagon/application/units/useLessonPopup';

export function GetHelpDisplay({ vocabulary }: { vocabulary: Vocabulary[] }) {
  const { contextual, setContextualRef, openContextual } = useContextualMenu();
  const [vocabTagSelected, setVocabTagSelected] = useState<number | null>(null);
  const { lessonPopup } = useLessonPopup();
  return (
    <div className="getHelpDisplay">
      {vocabulary.map((vocab) => (
        <VocabTagContainer
          key={vocab.id}
          exampleId={1}
          lessonPopup={lessonPopup}
          vocabulary={vocab}
          openContextual={openContextual}
          contextual={contextual}
          setContextualRef={setContextualRef}
          isSelected={vocabTagSelected === vocab.id}
          handleSelect={() => setVocabTagSelected(vocab.id)}
        />
      ))}
    </div>
  );
}
