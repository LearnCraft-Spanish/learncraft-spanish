import { PreSetQuizPreset } from '@application/units/Filtering/FilterPresets/preSetQuizzes';
import '@interface/components/Filters/FilterPanel.scss';

export default function PresetSelector({
  setFilterPreset,
  filterPreset,
}: {
  setFilterPreset: (preset: PreSetQuizPreset) => void;
  filterPreset: PreSetQuizPreset;
}) {
  return (
    <div className="presetSelectorContent">
      <label htmlFor="preset">
        <p>Preset:</p>
        <select
          name="preset"
          id="preset"
          className="styledInput"
          value={filterPreset}
          onChange={(e) => setFilterPreset(e.target.value as PreSetQuizPreset)}
        >
          {Object.values(PreSetQuizPreset).map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
