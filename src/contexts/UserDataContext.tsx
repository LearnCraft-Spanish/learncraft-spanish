import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import type { UserData } from '../interfaceDefinitions'
import { useBackend } from '../hooks/useBackend'

interface UserDataContextProps {
  userData: UserData | null
  setupUserData: (data: UserData | null) => void
}

const UserDataContext = createContext<UserDataContextProps | undefined>(undefined)

interface UserDataProviderProps {
  children: ReactNode
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const { getUserDataFromBackend } = useBackend()
  const { isAuthenticated, isLoading } = useAuth0()
  const [userData, setUserData] = useState<UserData | null>(null)

  const setupUserData = useCallback(async () => {
    const userDataPromise = getUserDataFromBackend()
    userDataPromise
      .then((response) => {
        if (response)
          setUserData(response)
      })
  }, [getUserDataFromBackend])

  const value = useMemo(
    () => ({ userData, setupUserData }),
    [userData, setupUserData],
  )

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setupUserData()
    }
  }, [isAuthenticated, isLoading, setupUserData])

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserDataContext
