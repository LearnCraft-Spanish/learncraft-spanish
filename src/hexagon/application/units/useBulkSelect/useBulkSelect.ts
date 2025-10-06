import { useCallback, useState } from 'react';

export default function useBulkSelect(
  bulkOperation: (ids: number[]) => Promise<void>,
) {
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [bulkOperationInProgress, setBulkOperationInProgress] = useState(false);

  const [bulkSelectIds, setBulkSelectIds] = useState<number[]>([]);

  const addToBulkSelect = useCallback((id: number) => {
    setBulkSelectIds((prev) => [...prev, id]);
  }, []);

  const addAllToBulkSelect = useCallback((ids: number[]) => {
    setBulkSelectIds((prev) => {
      const newIds = new Set([...prev, ...ids]);
      return Array.from(newIds);
    });
  }, []);

  const removeFromBulkSelect = useCallback((id: number) => {
    setBulkSelectIds((prev) => prev.filter((bulkId) => bulkId !== id));
  }, []);

  const clearBulkSelect = useCallback(() => {
    setBulkSelectIds([]);
  }, []);

  const toggleBulkSelectMode = useCallback(() => {
    setBulkSelectMode((prev) => !prev);
  }, []);

  const triggerBulkOperation = useCallback(async () => {
    setBulkOperationInProgress(true);
    setBulkSelectIds((currentIds) => {
      bulkOperation(currentIds)
        .then(() => {
          clearBulkSelect();
        })
        .finally(() => {
          setBulkOperationInProgress(false);
        });
      return currentIds; // Return unchanged to avoid state update
    });
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

    addAllToBulkSelect,
  };
}
