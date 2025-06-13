import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useVocabularyAdapter } from 'src/hexagon/application/adapters/vocabularyAdapter';

export default function DeleteVocabularyRecord({
  recordId,
}: {
  recordId: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="paginated-vocabulary__table-delete-button"
        onClick={() => setIsModalOpen(true)}
      >
        Delete
      </button>
      {isModalOpen && (
        <DeleteVocabularyRecordModal
          recordId={recordId}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </>
  );
}

function DeleteVocabularyRecordModal({
  recordId,
  setIsModalOpen,
}: {
  recordId: string;
  setIsModalOpen: (isModalOpen: boolean) => void;
}) {
  const { getRelatedRecords, deleteVocabulary } = useVocabularyAdapter();

  const {
    data: relatedRecords,
    isLoading: isRelatedRecordsLoading,
    error: relatedRecordsError,
  } = useQuery({
    queryKey: ['vocabulary-related-records', recordId],
    queryFn: () => getRelatedRecords(Number(recordId)),
    enabled: !!recordId,
    staleTime: Infinity,
  });

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    const promise = deleteVocabulary([Number(recordId)]);
    toast.promise(promise, {
      pending: 'Deleting vocabulary...',
      success: 'Vocabulary deleted successfully',
      error: 'Failed to delete vocabulary',
    });
    setIsModalOpen(false);
  };
  return (
    <div className="modal-container">
      <div className="modal">
        {isRelatedRecordsLoading && <div>Loading...</div>}
        {relatedRecordsError && <div>Error: {relatedRecordsError.message}</div>}
        {relatedRecords && (
          <>
            <h2>Delete Vocabulary</h2>
            <p>Are you sure you want to delete this vocabulary?</p>
            <p>This will also delete the following records:</p>
            <ul>
              <li>
                <p>
                  {`${relatedRecords.vocabularyExampleRecords.length} Vocabulary Example Records`}
                </p>
              </li>
              <li>
                <p>
                  {`${relatedRecords.vocabularyLessonRecords.length} Vocabulary Lesson Records`}
                </p>
              </li>
              <li>
                <p>
                  {`${relatedRecords.vocabularySpellingRecords.length} Vocabulary Spelling Records`}
                </p>
              </li>
            </ul>
          </>
        )}
        <div className="buttonBox">
          <button className="removeButton" type="button" onClick={handleCancel}>
            Go Back
          </button>
          <button type="button" className="addButton" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
