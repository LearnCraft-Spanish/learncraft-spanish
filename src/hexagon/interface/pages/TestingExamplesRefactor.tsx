import { useRecentlyEditedExamples } from '@application/units/examples/data/useRecentlyEditedExamples';
import { useSingleExample } from '@application/units/examples/data/useSingleExample';
import { Loading } from 'src/components/Loading';
export function TestingExamplesRefactor() {
  const { data, isLoading, error } = useSingleExample(100);
  const {
    data: recentlyEditedExamples,
    isLoading: _recentlyEditedExamplesLoading,
    error: _recentlyEditedExamplesError,
  } = useRecentlyEditedExamples();
  return (
    <div>
      <h1>Testing Examples Refactor</h1>
      {isLoading && <Loading message="Loading single example..." />}
      {(error || !data) && (
        <div>{error?.message || 'No data found for example Id provided'}</div>
      )}
      {data && (
        <div>
          <h2>{`Record ID: ${data.recordId}`}</h2>
          <h2>{`Spanish Example: ${data.spanishExample}`}</h2>
          <h2>{`English Translation: ${data.englishTranslation}`}</h2>
          <h2>{`Vocab Included: ${data.vocabIncluded}`}</h2>
          <h2>{`Date Created: ${data.dateCreated}`}</h2>
          <h2>{`Date Modified: ${data.dateModified}`}</h2>
        </div>
      )}
      {recentlyEditedExamples && (
        <div>
          <h2>Recently Edited Examples</h2>
          <h3>{`${recentlyEditedExamples.length} examples found`}</h3>
          {recentlyEditedExamples.map((example) => (
            <div key={example.recordId}>{example.spanishExample}</div>
          ))}
        </div>
      )}
    </div>
  );
}
