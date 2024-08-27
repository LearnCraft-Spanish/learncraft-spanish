import type { ReactNode } from 'react'
import { createContext, useMemo } from 'react'
import type { UserData } from '../../interfaceDefinitions'

interface UserDataContextProps {
  userData: UserData | null
}

interface UserDataProviderProps {
  children: ReactNode
  userData: UserData
};

export const UserDataContext = createContext<UserDataContextProps | undefined>(undefined)

export function UserDataProvider({ children, userData }: UserDataProviderProps) {
  const value = useMemo(
    () => ({ userData }),
    [userData],
  )
  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}
