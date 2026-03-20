import type { ExampleMaxFrequency } from '@learncraft-spanish/shared';
import type { ReactNode } from 'react';
import { useMaxFrequencyBulkButton } from '@application/useCases/ExampleSearch/useMaxFrequencyBulkButton';
import ExampleListItemFactory from '@interface/components/ExampleListItem/ExampleListItemFactory';
import BulkAddButton from '@interface/components/ExampleListItem/units/BulkAddButton';
import Pagination from '@interface/components/general/Pagination/Pagination';
import { InlineLoading } from '@interface/components/Loading';
import './MaxFrequencyResults.scss';
export interface PaginationProps {
  page: number;
  maxPage: number;
  nextPage: () => void;
  previousPage: () => void;
}

export interface MaxFrequencyResultsComponentProps {
  bulkOption?: 'selectAll' | 'deselectAll' | undefined;
  isLoading: boolean;
  error: Error | null;
  examples: ExampleMaxFrequency[] | undefined;
  pagination?: PaginationProps;
  info?: string;
  title?: string;
}

/**
 * Like `BaseResultsComponent`, but renders `maxFrequency` next to each example.
 * (This mode uses `ExampleMaxFrequency` objects from the max-frequency endpoint.)
 */
export function MaxFrequencyResultsComponent({
  bulkOption = undefined,
  isLoading,
  error,
  examples,
  info,
  pagination,
  title,
}: MaxFrequencyResultsComponentProps) {
  const {
    addSelectedExample,
    removeSelectedExample,
    selectedExampleIds,
    clearSelectedExamples,
    allAlreadySelected,
    selectAllExamplesOnPage,
  } = useMaxFrequencyBulkButton(examples ?? []);

  if (info) {
    return <p>{info}</p>;
  }

  if (isLoading) {
    return <InlineLoading message="Loading results..." />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!examples) {
    return <p>Perform a search to see results.</p>;
  }

  if (examples.length === 0) {
    return <p>No results.</p>;
  }

  const showPagination = pagination && pagination.maxPage > 1;

  return (
    <div>
      {title && <h3>{title}</h3>}
      {showPagination && (
        <Pagination
          page={pagination.page}
          maxPage={pagination.maxPage}
          nextPage={pagination.nextPage}
          previousPage={pagination.previousPage}
        />
      )}

      {bulkOption === 'selectAll' && (
        <button
          onClick={selectAllExamplesOnPage}
          type="button"
          className="selectAllButton"
          disabled={allAlreadySelected}
        >
          Select All on Page
        </button>
      )}

      {bulkOption === 'deselectAll' && (
        <button
          onClick={clearSelectedExamples}
          type="button"
          className="clearSelectionButton"
        >
          Clear Selection
        </button>
      )}

      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {examples.map((example) => (
          <li key={example.id}>
            <ExampleListItemFactory
              example={example}
              preTextComponents={[
                <BulkAddButton
                  key="bulkAddButton"
                  id={example.id}
                  handleSelect={() => addSelectedExample(example.id)}
                  handleRemoveSelected={() => removeSelectedExample(example.id)}
                  isSelected={selectedExampleIds.includes(example.id)}
                  // Unused Props
                  isCollected={false}
                  isPending={false}
                />,
              ]}
              postTextComponents={[
                <MaxFrequencyText
                  key="maxFrequencyText"
                  maxFrequency={example.maxFrequency}
                />,
              ]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MaxFrequencyText({
  maxFrequency,
}: {
  maxFrequency: number;
}): ReactNode {
  return (
    <div className="maxFrequencyCell">
      <span style={{ fontWeight: 500 }}>Max Frequency:</span>
      <span style={{ fontWeight: 500 }}>{maxFrequency}</span>
    </div>
  );
}
