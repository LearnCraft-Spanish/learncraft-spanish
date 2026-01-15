import { useSelectedExamples } from '@application/units/ExampleSearchInterface/useSelectedExamples';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
export default function useExampleManagerNav() {
  const { selectedExamples } = useSelectedExamples();
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
    () => selectedExamples.length === 0,
    [selectedExamples],
  );
  return {
    noExamplesSelected,
    activeSegment: resolvedActiveSegment,
    getNavOptionClassName,
  };
}
