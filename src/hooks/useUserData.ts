import { useContext } from 'react'
import UserDataContext from '../contexts/UserDataContext'

export function useUserData() {
  const context = useContext(UserDataContext)
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
}
