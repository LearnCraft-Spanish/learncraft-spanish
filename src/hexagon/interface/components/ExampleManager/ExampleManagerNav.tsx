import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { useModal } from '@interface/hooks/useModal';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ExampleManager.scss';
export default function ExampleManagerNav({
  hasUnsavedCreatedExamples,
  setHasUnsavedCreatedExamples,
}: {
  hasUnsavedCreatedExamples: boolean;
  setHasUnsavedCreatedExamples: (hasUnsavedCreatedExamples: boolean) => void;
}) {
  const { selectedExamples } = useSelectedExamples();
  const location = useLocation();
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();

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
    () => selectedExamples.length === 0,
    [selectedExamples],
  );

  const handleNavigate = (path: string) => {
    if (resolvedActiveSegment === 'create' && hasUnsavedCreatedExamples) {
      openModal({
        title: 'Warning: Unsaved Examples',
        body: 'You have unsaved examples. If you continue, you will lose your unsaved examples.',
        type: 'confirm',
        confirmFunction: () => {
          navigate(path);
          setHasUnsavedCreatedExamples(false);
          closeModal();
        },
        cancelFunction: () => {},
      });
      return;
    }
    navigate(path);
  };
  return (
    <div className="exampleManagerNav">
      <button
        type="button"
        className={getNavOptionClassName('search')}
        onClick={() => handleNavigate('search')}
      >
        Select Examples
      </button>
      <button
        type="button"
        className={getNavOptionClassName('create')}
        onClick={() => handleNavigate('create')}
      >
        Create New Examples
      </button>
      <button
        disabled={noExamplesSelected}
        type="button"
        className={` ${getNavOptionClassName('edit')} ${noExamplesSelected && 'disabled'}`}
        onClick={() => handleNavigate('edit')}
      >
        Edit Selected Examples
      </button>
      <button
        disabled={noExamplesSelected}
        type="button"
        className={` ${getNavOptionClassName('assign')} ${noExamplesSelected && 'disabled'}`}
        onClick={() => handleNavigate('assign')}
      >
        Assign Selected Examples
      </button>
    </div>
  );
}
