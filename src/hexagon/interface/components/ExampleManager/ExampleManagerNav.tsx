import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { SafeLink } from '@interface/components/general';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './ExampleManager.scss';

export default function ExampleManagerNav() {
  const { selectedExamples } = useSelectedExamples();
  const noExamplesSelected = useMemo(
    () => selectedExamples.length === 0,
    [selectedExamples],
  );
  const location = useLocation();
  const activeSegment = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const managerIndex = segments.indexOf('example-manager');
    if (managerIndex === -1) return undefined;
    return segments[managerIndex + 1];
  }, [location.pathname]);
  const resolvedActiveSegment = activeSegment ?? 'search';
  const getNavOptionClassName = (segment: string) =>
    ['exampleManagerNavOption', resolvedActiveSegment === segment && 'isActive']
      .filter(Boolean)
      .join(' ');
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
