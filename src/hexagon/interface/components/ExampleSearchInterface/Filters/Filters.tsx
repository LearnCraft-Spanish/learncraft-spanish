import type { SearchByIdsProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByIds';
import type { SearchByMaxFrequencyProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByMaxFrequency';
import type { SearchByQuizProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import type { SearchByRecentlyEditedProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByRecentlyEdited';
import type { SearchByTextProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByText';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { SearchByIds } from '@interface/components/ExampleSearchInterface/Filters/SearchByIds';
import { SearchByMaxFrequency } from '@interface/components/ExampleSearchInterface/Filters/SearchByMaxFrequency';
import { SearchByQuiz } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import { SearchByRecentlyEdited } from '@interface/components/ExampleSearchInterface/Filters/SearchByRecentlyEdited';
import { SearchByText } from '@interface/components/ExampleSearchInterface/Filters/SearchByText';
import { FilterPanel } from '@interface/components/Filters/FilterPanel';
import './Filters.scss';
export function Filters({
  mode,
  onFilterChange,
  searchByQuizProps,
  searchByTextProps,
  searchByIdsProps,
  searchByRecentlyEditedProps,
  searchByMaxFrequencyProps,
}: {
  mode: ExampleSearchMode;
  onFilterChange: () => void;
  searchByQuizProps: SearchByQuizProps;
  searchByTextProps: SearchByTextProps;
  searchByIdsProps: SearchByIdsProps;
  searchByRecentlyEditedProps: SearchByRecentlyEditedProps;
  searchByMaxFrequencyProps: SearchByMaxFrequencyProps;
}) {
  if (mode === 'filter') {
    return (
      <div className="searchInterfaceFilterPanel">
        <FilterPanel
          onFilterChange={onFilterChange}
          requireAudioOnly={false}
          requireNoSpanglish={false}
        />
      </div>
    );
  } else if (mode === 'recentlyEdited') {
    return (
      <div className="searchInterfaceFilterPanel">
        <SearchByRecentlyEdited {...searchByRecentlyEditedProps} />
      </div>
    );
  } else if (mode === 'quiz') {
    return (
      <div className="searchInterfaceFilterPanel">
        <SearchByQuiz {...searchByQuizProps} />
      </div>
    );
  } else if (mode === 'text') {
    return (
      <div className="searchInterfaceFilterPanel">
        <SearchByText {...searchByTextProps} />
      </div>
    );
  } else if (mode === 'ids') {
    return (
      <div className="searchInterfaceFilterPanel">
        <SearchByIds {...searchByIdsProps} />
      </div>
    );
  } else if (mode === 'max-frequency') {
    return (
      <div className="searchInterfaceFilterPanel">
        <SearchByMaxFrequency {...searchByMaxFrequencyProps} />
      </div>
    );
  }
  return <p>ERROR: Invalid mode</p>;
}
