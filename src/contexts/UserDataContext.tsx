import React, { createContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserData } from '../interfaceDefinitions'

interface UserDataContextProps {
  userData: UserData | null
  setUserData: (data: UserData | null) => void
}

const UserDataContext = createContext<UserDataContextProps | undefined>(undefined)

interface UserDataProviderProps {
  children: ReactNode
}

export function UserDataProvider({ children }: UserDataProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null)

  const value = useMemo(
    () => ({ userData, setUserData }),
    [userData],
  )

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserDataContext
