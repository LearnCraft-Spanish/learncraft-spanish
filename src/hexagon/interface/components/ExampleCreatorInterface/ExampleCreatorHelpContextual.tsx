import ContextualView from '@interface/components/Contextual/ContextualView';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
export function ExampleCreatorHelpContextual() {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div>
      <button
        type="button"
        onClick={() => openContextual('example-creator-help')}
      >
        Help
      </button>
      {contextual === 'example-creator-help' && (
        <ContextualView>
          <h2>Why your examples may not have saved</h2>
          <p>Here’s how to check:</p>
          <p>
            If any examples remain in the Create table after you tried to save,
            those examples did not save.
          </p>
          <p>
            The most common cause is a duplicate Spanish text already exists.
          </p>
          <p>
            To confirm, copy the Spanish text and paste it into the “Search by
            text” filter in the Search Examples tab.
          </p>
          <p>
            If the text appears in search results, it already exists and cannot
            be saved again.
          </p>
        </ContextualView>
      )}
    </div>
  );
}
