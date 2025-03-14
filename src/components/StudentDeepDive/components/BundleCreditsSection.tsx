import type {
  BundleCredit,
  CreateBundleCreditInput,
  UpdateBundleCreditInput,
} from 'src/hooks/CoachingData/useBundleCredits';
import type { UserData } from 'src/types/interfaceDefinitions';
import React, { useState } from 'react';
import { useBundleCredits } from 'src/hooks/CoachingData/useBundleCredits';
import { useUserData } from 'src/hooks/UserData/useUserData';

interface BundleCreditRowProps {
  credit: BundleCredit;
}

interface BundleCreditViewProps {
  studentId: number;
  credit?: BundleCredit; // if provided, we're editing. if not, we're creating
  onClose: () => void;
}

function BundleCreditView({
  studentId,
  credit,
  onClose,
}: BundleCreditViewProps) {
  const { createBundleCredit, updateBundleCredit, deleteBundleCredit } =
    useBundleCredits(studentId);
  const [formData, setFormData] = useState<Partial<CreateBundleCreditInput>>({
    totalCredits: credit?.totalCredits || 0,
    usedCredits: credit?.usedCredits || 0,
    expiration: credit?.expiration
      ? new Date(credit.expiration).toISOString().split('T')[0]
      : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (credit) {
        await updateBundleCredit.mutateAsync({
          recordId: credit.recordId,
          totalCredits: formData.totalCredits,
          usedCredits: formData.usedCredits,
          expiration: formData.expiration
            ? `${formData.expiration}T08:00:00`
            : undefined,
        } as UpdateBundleCreditInput);
      } else {
        await createBundleCredit.mutateAsync({
          relatedStudent: studentId,
          totalCredits: formData.totalCredits || 0,
          usedCredits: formData.usedCredits || 0,
          expiration: formData.expiration
            ? `${formData.expiration}T08:00:00`
            : undefined,
        } as CreateBundleCreditInput);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save bundle credit:', error);
    }
  };

  return (
    <div className="bundle-credit-modal">
      <div className="bundle-credit-modal-content">
        <h3>{credit ? 'Edit Bundle Credit' : 'Create Bundle Credit'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="totalCredits">Total Credits:</label>
            <input
              type="number"
              id="totalCredits"
              value={formData.totalCredits || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalCredits: Number(e.target.value),
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="usedCredits">Used Credits:</label>
            <input
              type="number"
              id="usedCredits"
              value={formData.usedCredits || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usedCredits: Number(e.target.value),
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="expiration">Expiration Date (UTC):</label>
            <input
              type="date"
              id="expiration"
              value={formData.expiration || ''}
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
            <button type="button" onClick={onClose} className="secondary">
              Cancel
            </button>
            {/* delete button */}
            {credit && (
              <button
                type="button"
                onClick={() => deleteBundleCredit.mutateAsync(credit.recordId)}
                className="danger"
              >
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
  const [isEditing, setIsEditing] = useState(false);
  const userDataQuery = useUserData();
  const isAdmin = (userDataQuery.data as UserData)?.roles.adminRole === 'admin';

  return (
    <>
      {isEditing && (
        <BundleCreditView
          studentId={credit.relatedStudent}
          credit={credit}
          onClose={() => setIsEditing(false)}
        />
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
              onClick={() => setIsEditing(true)}
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
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="bundle-credits-section">
      <div className="section-header">
        <h3>Bundle Credits</h3>
        {isAdmin && (
          <button
            onClick={() => setIsCreating(true)}
            className="create-button primary"
            type="button"
          >
            Create New Bundle Credit
          </button>
        )}
      </div>

      {isCreating && (
        <BundleCreditView
          studentId={studentId}
          onClose={() => setIsCreating(false)}
        />
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
