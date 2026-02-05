import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { useBulkButton } from '@application/units/ExampleSearchInterface/useBulkButton';
import ExampleListItemFactory from '@interface/components/ExampleListItem/ExampleListItemFactory';
import BulkAddButton from '@interface/components/ExampleListItem/units/BulkAddButton';
import Pagination from '@interface/components/general/Pagination/Pagination';
import { InlineLoading } from '@interface/components/Loading';

export interface PaginationProps {
  page: number;
  maxPage: number;
  nextPage: () => void;
  previousPage: () => void;
}

export interface BaseResultsComponentProps {
  bulkOption?: 'selectAll' | 'deselectAll' | undefined;
  isLoading: boolean;
  error: Error | null;
  examples: ExampleWithVocabulary[] | undefined;
  info?: string;
  pagination?: PaginationProps;
  title?: string;
}
/**
 * BaseResultsComponent is a component that displays the search results.
 * all implementations will be a wrapper fetching, then displaying the results.
 */
export function BaseResultsComponent({
  bulkOption = undefined,
  isLoading,
  error,
  examples,
  info,
  pagination,
  title,
}: BaseResultsComponentProps) {
  const {
    addSelectedExample,
    removeSelectedExample,
    selectedExampleIds,
    clearSelectedExamples,
  } = useSelectedExamplesContext();

  const { allAlreadySelected, selectAllExamplesOnPage } = useBulkButton(
    examples ?? [],
  );
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
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
