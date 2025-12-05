import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';

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
    <ul>
      {examples.map((example) => (
        <li key={example.id}>
          {example.id} - <strong>{example.spanish}</strong> — {example.english}
        </li>
      ))}
    </ul>
  );
}
