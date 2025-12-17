import type { LocalFilterPanelResultsProps } from '@interface/components/ExampleSearchInterface/Results/LocalFilterPanelResults';
import type { SearchByIdsResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByIdsResults';
import type { SearchByQuizResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByQuizResults';
import type { SearchByTextResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByTextResults';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { LocalFilterPanelResults } from '@interface/components/ExampleSearchInterface/Results/LocalFilterPanelResults';
import { SearchByIdsResults } from '@interface/components/ExampleSearchInterface/Results/SearchByIdsResults';
import { SearchByQuizResults } from '@interface/components/ExampleSearchInterface/Results/SearchByQuizResults';
import { SearchByRecentlyEditedResults } from '@interface/components/ExampleSearchInterface/Results/SearchByRecentlyEditedResults';
import { SearchByTextResults } from '@interface/components/ExampleSearchInterface/Results/SearchByTextResults';
export function Results({
  mode,
  localFilterResultsProps,
  quizResultsProps,
  textResultsProps,
  idsResultsProps,
}: {
  mode: ExampleSearchMode;
  localFilterResultsProps: LocalFilterPanelResultsProps;
  quizResultsProps: SearchByQuizResultsProps;
  textResultsProps: SearchByTextResultsProps;
  idsResultsProps: SearchByIdsResultsProps;
}) {
  if (mode === 'filter') {
    return <LocalFilterPanelResults {...localFilterResultsProps} />;
  } else if (mode === 'recentlyEdited') {
    return <SearchByRecentlyEditedResults />;
  } else if (mode === 'quiz') {
    return <SearchByQuizResults {...quizResultsProps} />;
  } else if (mode === 'text') {
    return <SearchByTextResults {...textResultsProps} />;
  } else if (mode === 'ids') {
    return <SearchByIdsResults {...idsResultsProps} />;
  }
  return <p>ERROR: Invalid mode</p>;
}
