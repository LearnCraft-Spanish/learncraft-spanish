import data from '../../mocks/data/mockBackendData.json'
import type { Program } from '../../interfaceDefinitions'

export function useBackend() {
  const getProgramsFromBackend = () => {
    return data.mockBackendData.getProgramsFromBackend
  }
  const getLessonsFromBackend = () => {
    return data.mockBackendData.getLessonsFromBackend
  }

  return {
    getProgramsFromBackend,
    getLessonsFromBackend,
  }
}
