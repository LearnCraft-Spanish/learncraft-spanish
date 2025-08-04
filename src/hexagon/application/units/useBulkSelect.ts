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
    await bulkOperation(bulkSelectIds);
    setBulkOperationInProgress(false);
    clearBulkSelect();
  }, [bulkOperation, clearBulkSelect]);

  return {
    bulkSelectMode,
    bulkOperationInProgress,
    bulkSelectIds,
    addToBulkSelect,
    removeFromBulkSelect,
    clearBulkSelect,
    toggleBulkSelectMode,
    triggerBulkOperation,
  };
}
