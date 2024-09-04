import type { ReactNode } from 'react'
import { createContext, useMemo } from 'react'
import type { UserData } from '../../interfaceDefinitions'
import { sampleStudent } from '../../../tests/mockData'

interface UserDataContextProps {
  userData: UserData | null
}

interface UserDataProviderProps {
  children: ReactNode
  userData: UserData
};

export const UserDataContext = createContext<UserDataContextProps>({ userData: sampleStudent })

export function UserDataProvider({ children }: UserDataProviderProps) {
  const value = useMemo(
    () => ({ userData: sampleStudent }),
    [],
  )
  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}
