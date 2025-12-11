import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import ExampleListItemFactory from '@interface/components/ExampleListItem/ExampleListItemFactory';
import BulkAddButton from '@interface/components/ExampleListItem/units/BulkAddButton';
/**
 * BaseResultsComponent is a component that displays the search results.
 * all implementations will be a wrapper fetching, then displaying the results.
 */
export function BaseResultsComponent({
  isLoading,
  error,
  examples,
  info,
}: {
  isLoading: boolean;
  error: Error | null;
  examples: ExampleWithVocabulary[] | undefined;
  info?: string;
}) {
  const { addSelectedExample, removeSelectedExample, selectedExampleIds } =
    useSelectedExamplesContext();

  if (info) {
    return <p>{info}</p>;
  }

  if (isLoading) {
    return <p>Loading results…</p>;
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

  return (
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
  );
}
