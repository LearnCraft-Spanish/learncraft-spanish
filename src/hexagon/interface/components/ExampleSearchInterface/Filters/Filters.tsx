import type { LocalFilterPanelProps } from '@interface/components/ExampleSearchInterface/Filters/LocalFilterPanel';
import type { SearchByDateProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByDate';
import type { SearchByQuizProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import type { SearchByTextsOrIdsProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByTextsOrIds';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { LocalFilterPanel } from '@interface/components/ExampleSearchInterface/Filters/LocalFilterPanel';
import { SearchByDate } from '@interface/components/ExampleSearchInterface/Filters/SearchByDate';
import { SearchByQuiz } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import { SearchByTextsOrIds } from '@interface/components/ExampleSearchInterface/Filters/SearchByTextsOrIds';

export function Filters({
  mode,
  localFilterProps,
  searchByDateProps,
  searchByQuizProps,
  searchByTextsOrIdsProps,
}: {
  mode: ExampleSearchMode;
  localFilterProps: LocalFilterPanelProps;
  searchByDateProps: SearchByDateProps;
  searchByQuizProps: SearchByQuizProps;
  searchByTextsOrIdsProps: SearchByTextsOrIdsProps;
}) {
  if (mode === 'filter') {
    return <LocalFilterPanel {...localFilterProps} />;
  } else if (mode === 'date') {
    return <SearchByDate {...searchByDateProps} />;
  } else if (mode === 'quiz') {
    return <SearchByQuiz {...searchByQuizProps} />;
  } else if (mode === 'text') {
    return <SearchByTextsOrIds {...searchByTextsOrIdsProps} />;
  }
  return <p>ERROR: Invalid mode</p>;
}
