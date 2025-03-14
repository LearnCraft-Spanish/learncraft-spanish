import type {
  BundleCredit,
  CreateBundleCreditInput,
  UpdateBundleCreditInput,
} from 'src/hooks/CoachingData/useBundleCredits';
import type { UserData } from 'src/types/interfaceDefinitions';
import React, { useState } from 'react';
import ContextualControls from 'src/components/ContextualControls';
import { useBundleCredits } from 'src/hooks/CoachingData/useBundleCredits';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useModal } from 'src/hooks/useModal';
import { useUserData } from 'src/hooks/UserData/useUserData';

interface BundleCreditRowProps {
  credit: BundleCredit;
}

interface BundleCreditViewProps {
  studentId: number;
  credit?: BundleCredit; // if provided, we're editing. if not, we're creating
}

interface FormDataType {
  totalCredits: string;
  usedCredits: string;
  expiration?: string;
}

function BundleCreditView({ studentId, credit }: BundleCreditViewProps) {
  const { setContextualRef, closeContextual } = useContextualMenu();
  const { createBundleCredit, updateBundleCredit, deleteBundleCredit } =
    useBundleCredits(studentId);
  const { openModal, closeModal } = useModal();
  const [formData, setFormData] = useState<FormDataType>({
    totalCredits: credit?.totalCredits?.toString() ?? '',
    usedCredits: credit?.usedCredits?.toString() ?? '',
    expiration: credit?.expiration
      ? new Date(credit.expiration).toISOString().split('T')[0]
      : undefined,
  });

  const validateForm = () => {
    // Check for whole numbers
    const totalCredits = Number(formData.totalCredits);
    const usedCredits = Number(formData.usedCredits);

    if (
      formData.totalCredits !== '' &&
      (!Number.isInteger(totalCredits) || totalCredits < 0)
    ) {
      openModal({
        title: 'Validation Error',
        body: 'Total credits must be a non-negative whole number',
        type: 'error',
      });
      return false;
    }

    if (
      formData.usedCredits !== '' &&
      (!Number.isInteger(usedCredits) || usedCredits < 0)
    ) {
      openModal({
        title: 'Validation Error',
        body: 'Used credits must be a non-negative whole number',
        type: 'error',
      });
      return false;
    }

    // Check if used credits exceed total credits
    if (
      formData.totalCredits !== '' &&
      formData.usedCredits !== '' &&
      usedCredits > totalCredits
    ) {
      openModal({
        title: 'Validation Error',
        body: 'Used credits cannot exceed total credits',
        type: 'error',
      });
      return false;
    }

    // expiration is required, and must be a valid date
    if (!formData.expiration) {
      openModal({
        title: 'Validation Error',
        body: 'Please enter a valid expiration date',
        type: 'error',
      });
      return false;
    }

    return true;
  };

  const handleDelete = async () => {
    closeModal();
    try {
      if (credit) {
        await deleteBundleCredit.mutateAsync(credit.recordId);
        closeContextual();
      }
    } catch (error) {
      console.error('Failed to delete bundle credit:', error);
      openModal({
        title: 'Error',
        body: 'Failed to delete bundle credit. Please try again.',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const parsedTotalCredits =
        formData.totalCredits === '' ? 0 : Number(formData.totalCredits);
      const parsedUsedCredits =
        formData.usedCredits === '' ? 0 : Number(formData.usedCredits);

      if (credit) {
        await updateBundleCredit.mutateAsync(
          {
            recordId: credit.recordId,
            totalCredits: parsedTotalCredits,
            usedCredits: parsedUsedCredits,
            expiration: formData.expiration
              ? `${formData.expiration}T08:00:00`
              : undefined,
          } as UpdateBundleCreditInput,
          {
            onSuccess: () => {
              closeContextual();
            },
          },
        );
      } else {
        await createBundleCredit.mutateAsync(
          {
            relatedStudent: studentId,
            totalCredits: parsedTotalCredits,
            usedCredits: parsedUsedCredits,
            expiration: formData.expiration
              ? `${formData.expiration}T08:00:00`
              : undefined,
          } as CreateBundleCreditInput,
          {
            onSuccess: () => {
              closeContextual();
            },
          },
        );
      }
    } catch (error) {
      console.error('Failed to save bundle credit:', error);
      openModal({
        title: 'Error',
        body: 'Failed to save bundle credit. Please try again.',
        type: 'error',
      });
    }
  };

  const confirmDelete = () => {
    openModal({
      title: 'Confirm Delete',
      body: 'Are you sure you want to delete this bundle credit? This action cannot be undone.',
      type: 'confirm',
      confirmFunction: handleDelete,
    });
  };

  return (
    <div className="contextualWrapper">
      <div className="contextual" ref={setContextualRef}>
        <ContextualControls />
        <h3>{credit ? 'Edit Bundle Credit' : 'Create Bundle Credit'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="totalCredits">Total Credits:</label>
            <input
              type="number"
              id="totalCredits"
              value={formData.totalCredits}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalCredits: e.target.value,
                })
              }
              min="0"
              step="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="usedCredits">Used Credits:</label>
            <input
              type="number"
              id="usedCredits"
              value={formData.usedCredits}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usedCredits: e.target.value,
                })
              }
              min="0"
              step="1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="expiration">Expiration Date (UTC):</label>
            <input
              type="date"
              id="expiration"
              value={formData.expiration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expiration: e.target.value || undefined,
                })
              }
            />
          </div>
          <div className="button-group">
            <button type="submit" className="primary">
              {credit ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={closeContextual}
              className="secondary"
            >
              Cancel
            </button>
            {credit && (
              <button type="button" onClick={confirmDelete} className="danger">
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function BundleCreditRow({ credit }: BundleCreditRowProps) {
  const { contextual, openContextual } = useContextualMenu();
  const userDataQuery = useUserData();
  const isAdmin = (userDataQuery.data as UserData)?.roles.adminRole === 'admin';

  return (
    <>
      {contextual === `bundle-credit-${credit.recordId}` && (
        <BundleCreditView studentId={credit.relatedStudent} credit={credit} />
      )}
      <div key={credit.recordId} className="credit-details">
        <div className="info-row">
          <div className="info-label">Credits Used:</div>
          <div className="info-value">{credit.usedCredits}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Credits Remaining:</div>
          <div className="info-value">{credit.creditsRemaining}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Total Credits:</div>
          <div className="info-value">{credit.totalCredits}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Expiration Date:</div>
          <div className="info-value">
            {credit.expiration
              ? new Date(credit.expiration).toLocaleDateString()
              : 'No expiration'}
          </div>
        </div>
        <div className="info-row">
          <div className="info-label">Status:</div>
          <div className="info-value">
            {credit.expired
              ? 'Expired'
              : credit.studentActive
                ? 'Active'
                : 'Inactive'}
          </div>
        </div>
        {isAdmin && (
          <div className="admin-controls">
            <button
              onClick={() => openContextual(`bundle-credit-${credit.recordId}`)}
              className="edit-button"
              type="button"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </>
  );
}

interface BundleCreditsSectionProps {
  studentId: number;
}

export function BundleCreditsSection({ studentId }: BundleCreditsSectionProps) {
  const { bundleCreditsQuery } = useBundleCredits(studentId);
  const userDataQuery = useUserData();
  const isAdmin = (userDataQuery.data as UserData)?.roles.adminRole === 'admin';
  const { contextual, openContextual } = useContextualMenu();

  return (
    <div className="bundle-credits-section">
      <div className="section-header">
        <h3>Bundle Credits</h3>
        {isAdmin && (
          <button
            onClick={() => openContextual('create-bundle-credit')}
            className="create-button primary"
            type="button"
          >
            Create New Bundle Credit
          </button>
        )}
      </div>

      {contextual === 'create-bundle-credit' && (
        <BundleCreditView studentId={studentId} />
      )}

      {bundleCreditsQuery.isLoading ? (
        <div>Loading bundle credits...</div>
      ) : bundleCreditsQuery.error ? (
        <div>Error loading bundle credits</div>
      ) : bundleCreditsQuery.data && bundleCreditsQuery.data.length > 0 ? (
        <div className="bundle-credits-list">
          {bundleCreditsQuery.data.map((credit: BundleCredit) => (
            <BundleCreditRow key={credit.recordId} credit={credit} />
          ))}
        </div>
      ) : (
        <div>No bundle credits found</div>
      )}
    </div>
  );
}
