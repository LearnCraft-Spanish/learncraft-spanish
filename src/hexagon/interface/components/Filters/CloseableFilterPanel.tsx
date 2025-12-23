import { FilterPanel } from '@interface/components/Filters/FilterPanel';
import { ToggleSwitch } from '@interface/components/general';

import './FilterPanel.scss';

export function CloseableFilterPanel({
  isOpen,
  setIsOpen,
  requireNoSpanglish,
  requireAudioOnly,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  requireNoSpanglish: boolean;
  requireAudioOnly: boolean;
}) {
  return (
    <div className="CloseableFilterPanel">
      <div className="ToggleFilterPanel">
        <ToggleSwitch
          id="filtersEnabled"
          ariaLabel="filtersEnabled"
          label="Flashcard Filtering: "
          checked={isOpen}
          onChange={() => setIsOpen(!isOpen)}
        />
      </div>
      {isOpen && (
        <FilterPanel
          requireAudioOnly={requireAudioOnly}
          requireNoSpanglish={requireNoSpanglish}
        />
      )}
    </div>
  );
}
