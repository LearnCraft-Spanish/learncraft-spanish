import { useIncludeUnpublished } from '@application/coordinators/hooks/useIncludeUnpublished';
import { ToggleSwitch } from '@interface/components/general';

export function FrequensayIncludeUnpublishedToggle() {
  const { includeUnpublished, updateIncludeUnpublished, isAdmin } =
    useIncludeUnpublished();

  if (!isAdmin) {
    return null;
  }

  return (
    <ToggleSwitch
      id="includeUnpublished"
      ariaLabel="includeUnpublished"
      label="Include unpublished courses and lessons: "
      checked={includeUnpublished ?? false}
      onChange={() => updateIncludeUnpublished(!(includeUnpublished ?? false))}
    />
  );
}
