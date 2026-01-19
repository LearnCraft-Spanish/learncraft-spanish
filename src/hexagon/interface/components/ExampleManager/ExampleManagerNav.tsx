import { useSelectedExamplesContext } from '@application/coordinators/hooks/useSelectedExamplesContext';
import { SafeLink } from '@interface/components/general';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './ExampleManager.scss';
export default function ExampleManagerNav() {
  const { selectedExampleIds } = useSelectedExamplesContext();
  const location = useLocation();

  // Get the active segment from the location pathname
  const activeSegment = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const managerIndex = segments.indexOf('example-manager');
    if (managerIndex === -1) return undefined;
    return segments[managerIndex + 1];
  }, [location.pathname]);

  // Default to search if no active segment is found
  const resolvedActiveSegment = activeSegment ?? 'search';

  // Get the class name for the active nav option
  const getNavOptionClassName = (segment: string) =>
    ['exampleManagerNavOption', resolvedActiveSegment === segment && 'isActive']
      .filter(Boolean)
      .join(' ');

  // Check if no examples are selected, disables interfaces requiring examples
  const noExamplesSelected = useMemo(
    () => selectedExampleIds.length === 0,
    [selectedExampleIds],
  );
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
