import type { LocalFilterPanelResultsProps } from '@interface/components/ExampleSearchInterface/Results/LocalFilterPanelResults';
import type { SearchByDateResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByDateResults';
import type { SearchByQuizResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByQuizResults';
import type { SearchByTextsOrIdsResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByTextsOrIdsResults';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { LocalFilterPanelResults } from '@interface/components/ExampleSearchInterface/Results/LocalFilterPanelResults';
import { SearchByDateResults } from '@interface/components/ExampleSearchInterface/Results/SearchByDateResults';
import { SearchByQuizResults } from '@interface/components/ExampleSearchInterface/Results/SearchByQuizResults';
import { SearchByTextsOrIdsResults } from '@interface/components/ExampleSearchInterface/Results/SearchByTextsOrIdsResults';

export function Results({
  mode,
  localFilterResultsProps,
  dateResultsProps,
  quizResultsProps,
  textsOrIdsResultsProps,
}: {
  mode: ExampleSearchMode;
  localFilterResultsProps: LocalFilterPanelResultsProps;
  dateResultsProps: SearchByDateResultsProps;
  quizResultsProps: SearchByQuizResultsProps;
  textsOrIdsResultsProps: SearchByTextsOrIdsResultsProps;
}) {
  if (mode === 'filter') {
    return <LocalFilterPanelResults {...localFilterResultsProps} />;
  } else if (mode === 'date') {
    return <SearchByDateResults {...dateResultsProps} />;
  } else if (mode === 'quiz') {
    return <SearchByQuizResults {...quizResultsProps} />;
  } else if (mode === 'text') {
    return <SearchByTextsOrIdsResults {...textsOrIdsResultsProps} />;
  }
  return <p>ERROR: Invalid mode</p>;
}
