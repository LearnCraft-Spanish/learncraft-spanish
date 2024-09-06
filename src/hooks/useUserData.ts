import { useQuery } from '@tanstack/react-query'
import { useBackend } from './useBackend'

export function useUserData() {
  const { getUserDataFromBackend } = useBackend()
  const userDataQuery = useQuery({ queryKey: ['userData'], queryFn: getUserDataFromBackend })
  return userDataQuery
}
