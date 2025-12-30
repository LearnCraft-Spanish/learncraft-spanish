import type { LocalFilterPanelProps } from '@interface/components/ExampleSearchInterface/Filters/LocalFilterPanel';
import type { SearchByIdsProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByIds';
import type { SearchByQuizProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import type { SearchByRecentlyEditedProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByRecentlyEdited';
import type { SearchByTextProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByText';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { LocalFilterPanel } from '@interface/components/ExampleSearchInterface/Filters/LocalFilterPanel';
import { SearchByIds } from '@interface/components/ExampleSearchInterface/Filters/SearchByIds';
import { SearchByQuiz } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import { SearchByRecentlyEdited } from '@interface/components/ExampleSearchInterface/Filters/SearchByRecentlyEdited';
import { SearchByText } from '@interface/components/ExampleSearchInterface/Filters/SearchByText';

export function Filters({
  mode,
  localFilterProps,
  searchByQuizProps,
  searchByTextProps,
  searchByIdsProps,
  searchByRecentlyEditedProps,
}: {
  mode: ExampleSearchMode;
  localFilterProps: LocalFilterPanelProps;
  searchByQuizProps: SearchByQuizProps;
  searchByTextProps: SearchByTextProps;
  searchByIdsProps: SearchByIdsProps;
  searchByRecentlyEditedProps: SearchByRecentlyEditedProps;
}) {
  if (mode === 'filter') {
    return <LocalFilterPanel {...localFilterProps} />;
  } else if (mode === 'recentlyEdited') {
    return <SearchByRecentlyEdited {...searchByRecentlyEditedProps} />;
  } else if (mode === 'quiz') {
    return <SearchByQuiz {...searchByQuizProps} />;
  } else if (mode === 'text') {
    return <SearchByText {...searchByTextProps} />;
  } else if (mode === 'ids') {
    return <SearchByIds {...searchByIdsProps} />;
  }
  return <p>ERROR: Invalid mode</p>;
}
