import { useContext } from 'react'
import ActiveStudentContext from '../contexts/ActiveStudentContext'

export function useActiveStudent() {
  const context = useContext(ActiveStudentContext)
  if (!context) {
    throw new Error('useActiveStudent must be used within an ActiveStudentProvider')
  }
  return context
}
