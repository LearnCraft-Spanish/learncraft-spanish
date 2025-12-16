import type { LocalFilterPanelProps } from '@interface/components/ExampleSearchInterface/Filters/LocalFilterPanel';
import type { SearchByIdsProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByIds';
import type { SearchByQuizProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import type { SearchByTextProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByText';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { LocalFilterPanel } from '@interface/components/ExampleSearchInterface/Filters/LocalFilterPanel';
import { SearchByIds } from '@interface/components/ExampleSearchInterface/Filters/SearchByIds';
import { SearchByQuiz } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import { SearchByText } from '@interface/components/ExampleSearchInterface/Filters/SearchByText';

export function Filters({
  mode,
  localFilterProps,
  searchByQuizProps,
  searchByTextProps,
  searchByIdsProps,
}: {
  mode: ExampleSearchMode;
  localFilterProps: LocalFilterPanelProps;
  searchByQuizProps: SearchByQuizProps;
  searchByTextProps: SearchByTextProps;
  searchByIdsProps: SearchByIdsProps;
}) {
  if (mode === 'filter') {
    return <LocalFilterPanel {...localFilterProps} />;
  } else if (mode === 'date') {
    return null;
  } else if (mode === 'quiz') {
    return <SearchByQuiz {...searchByQuizProps} />;
  } else if (mode === 'text') {
    return <SearchByText {...searchByTextProps} />;
  } else if (mode === 'ids') {
    return <SearchByIds {...searchByIdsProps} />;
  }
  return <p>ERROR: Invalid mode</p>;
}
