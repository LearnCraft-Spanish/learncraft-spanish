import React from 'react';

interface CreateTableFooterProps {
  hasData: boolean;
  isValid: boolean;
  isSaving: boolean;
  onSave?: () => Promise<void>;
  onReset?: () => void;
}

export function CreateTableFooter({
  hasData,
  isValid,
  isSaving,
  onSave,
  onReset,
}: CreateTableFooterProps) {
  if (!onSave && !onReset) {
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
        {hasData && isValid && (
          <p className="paste-table__hint paste-table__hint--validation">
            Ready to save
          </p>
        )}
        {!hasData && (
          <p className="paste-table__hint">Add data to the table to save</p>
        )}
      </div>
      <div className="paste-table__actions">
        {onReset && (
          <button
            className="paste-table__action-button paste-table__action-button--secondary"
            onClick={onReset}
            type="button"
            disabled={!hasData || isSaving}
          >
            Reset
          </button>
        )}
        {onSave && (
          <button
            className="paste-table__action-button paste-table__action-button--primary"
            onClick={onSave}
            type="button"
            disabled={!hasData || !isValid || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}
