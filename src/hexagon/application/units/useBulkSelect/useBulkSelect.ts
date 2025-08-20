import { useCallback, useState } from 'react';

export default function useBulkSelect(
  bulkOperation: (ids: number[]) => Promise<void>,
) {
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [bulkOperationInProgress, setBulkOperationInProgress] = useState(false);

  const [bulkSelectIds, setBulkSelectIds] = useState<number[]>([]);

  const addToBulkSelect = useCallback(
    (id: number) => {
      setBulkSelectIds([...bulkSelectIds, id]);
    },
    [bulkSelectIds],
  );

  const addAllToBulkSelect = useCallback(
    (ids: number[]) => {
      const newIds = new Set([...bulkSelectIds, ...ids]);
      setBulkSelectIds(Array.from(newIds));
    },
    [bulkSelectIds],
  );

  const removeFromBulkSelect = useCallback(
    (id: number) => {
      setBulkSelectIds(bulkSelectIds.filter((bulkId) => bulkId !== id));
    },
    [bulkSelectIds],
  );

  const clearBulkSelect = useCallback(() => {
    setBulkSelectIds([]);
  }, []);

  const toggleBulkSelectMode = useCallback(() => {
    setBulkSelectMode(!bulkSelectMode);
  }, [bulkSelectMode]);

  const triggerBulkOperation = useCallback(async () => {
    setBulkOperationInProgress(true);
    bulkOperation(bulkSelectIds)
      .then(() => {
        clearBulkSelect();
      })
      .finally(() => {
        setBulkOperationInProgress(false);
      });
  }, [bulkOperation, clearBulkSelect, bulkSelectIds]);

  return {
    bulkSelectMode,
    bulkOperationInProgress,
    bulkSelectIds,
    addToBulkSelect,
    removeFromBulkSelect,
    clearBulkSelect,
    toggleBulkSelectMode,
    triggerBulkOperation,

    addAllToBulkSelect,
  };
}
