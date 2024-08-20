import React, { createContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserData } from '../interfaceDefinitions'

interface UserDataContextProps {
  qbUserData: UserData | null
  setQbUserData: (data: UserData | null) => void
}

const UserDataContext = createContext<UserDataContextProps | undefined>(undefined)

interface UserDataProviderProps {
  children: ReactNode
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const [qbUserData, setQbUserData] = useState<UserData | null>(null)

  const value = useMemo(
    () => ({ qbUserData, setQbUserData }),
    [qbUserData],
  )

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserDataContext
