import React from 'react';

interface EditableTableFooterProps {
  hasUnsavedChanges: boolean;
  isValid: boolean;
  isSaving: boolean;
  onSave?: () => Promise<void>;
  onDiscard?: () => void;
}

export function EditableTableFooter({
  hasUnsavedChanges,
  isValid,
  isSaving,
  onSave,
  onDiscard,
}: EditableTableFooterProps) {
  if (!onSave && !onDiscard) {
    return null;
  }

  return (
    <div className="paste-table__footer">
      <div className="paste-table__hints">
        {!isValid && (
          <p className="paste-table__hint paste-table__hint--error">
            Please fix validation errors before saving
          </p>
        )}
        {hasUnsavedChanges && isValid && (
          <p className="paste-table__hint paste-table__hint--validation">
            You have unsaved changes
          </p>
        )}
      </div>
      <div className="paste-table__actions">
        {onDiscard && (
          <button
            className="paste-table__action-button paste-table__action-button--secondary"
            onClick={onDiscard}
            type="button"
            disabled={!hasUnsavedChanges || isSaving}
          >
            Discard
          </button>
        )}
        {onSave && (
          <button
            className="paste-table__action-button paste-table__action-button--primary"
            onClick={onSave}
            type="button"
            disabled={!hasUnsavedChanges || !isValid || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}

