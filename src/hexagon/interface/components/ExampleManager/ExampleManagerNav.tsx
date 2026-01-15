import { useExampleManagerNav } from '@application/units/ExampleManager';
import { SafeLink } from '@interface/components/general';
import './ExampleManager.scss';

export default function ExampleManagerNav() {
  const { noExamplesSelected, getNavOptionClassName } = useExampleManagerNav();
  return (
    <div className="exampleManagerNav">
      <SafeLink to="search" className={getNavOptionClassName('search')}>
        Select Examples
      </SafeLink>
      <SafeLink to="create" className={getNavOptionClassName('create')}>
        Create New Examples
      </SafeLink>
      <SafeLink
        to="edit"
        disabled={noExamplesSelected}
        className={`${getNavOptionClassName('edit')} ${noExamplesSelected && 'disabled'}`}
      >
        Edit Selected Examples
      </SafeLink>
      <SafeLink
        to="assign"
        disabled={noExamplesSelected}
        className={`${getNavOptionClassName('assign')} ${noExamplesSelected && 'disabled'}`}
      >
        Assign Selected Examples
      </SafeLink>
    </div>
  );
}
