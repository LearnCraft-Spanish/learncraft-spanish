import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react'; // Adjust the import based on your project structure
import { useBackend } from '../hooks/useBackend';
import { useUserData } from './useUserData';
// import useAuth from '../hooks/useAuth';

export function usePMFData() {
  const { getPMFDataForUser, createPMFDataForUser, updatePMFDataForUser } =
    useBackend();
  const userDataQuery = useUserData();
  const userData = userDataQuery.data;

  const getPMFData = useCallback(async () => {
    if (userData) {
      return await getPMFDataForUser(userData.recordId);
    }
  }, [userData, getPMFDataForUser]);

  const pmfDataQuery = useQuery({
    queryKey: ['pmfData', userData?.recordId],
    queryFn: getPMFData,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!userData,
  });

  const createPMFData = useCallback(async () => {
    if (userData) {
      if (pmfDataQuery.data) {
        return await createPMFDataForUser(userData.recordId);
      } else {
        return await updatePMFDataForUser(userData.recordId);
      }
    }
  }, [userData, pmfDataQuery.data, createPMFDataForUser, updatePMFDataForUser]);

  const canShowPMF = useMemo(() => {
    if (pmfDataQuery.data) {
      if (pmfDataQuery.data?.length > 0) {
        const intervalInDays = 60; // number of days for comparison

        const date = new Date().toISOString();
        const storedDate = pmfDataQuery.data; // Stored date will be in ISOString format
        // const exampleDate = '2024-11-01T00:00:00.000Z';
        const storedDateInDays = Math.floor(Date.parse(storedDate) / 86400000);
        const currentDateInDays = Math.floor(Date.parse(date) / 86400000);

        const diff = currentDateInDays - storedDateInDays;
        if (diff < intervalInDays) {
          return false;
          // calcualte if we should show the PMF via random number
        }
      }
    }
    console.log('can i show it?');
    const randomNumber = Math.floor(Math.random() * 200) + 1;
    console.log('random number', randomNumber);
    if (randomNumber === 1) {
      return true;
    }
    return false;
  }, [pmfDataQuery.data]);

  return { pmfDataQuery, createPMFData, canShowPMF };
}
