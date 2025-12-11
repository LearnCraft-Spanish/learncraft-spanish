import type { LessonRange, SkillTag } from '@learncraft-spanish/shared';
import { useLocalFilterPanelResults } from '@application/units/ExampleSearchInterface/Results/useLocalFilterPanelResults';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface LocalFilterPanelResultsProps {
  skillTags: SkillTag[];
  excludeSpanglish: boolean;
  audioOnly: boolean;
  lessonRanges: LessonRange[];
}
export function LocalFilterPanelResults({
  skillTags,
  excludeSpanglish,
  audioOnly,
  lessonRanges,
}: LocalFilterPanelResultsProps) {
  const { examples, isLoading, error } = useLocalFilterPanelResults({
    skillTags,
    excludeSpanglish,
    audioOnly,
    lessonRanges,
  });

  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error}
      examples={examples}
    />
  );
}
