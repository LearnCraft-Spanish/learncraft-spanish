import data from '../../../mocks/data/mockBackendData.json'

export function useBackend() {
  const getProgramsFromBackend = () => {
    return data.api.programsTable
  }
  const getLessonsFromBackend = () => {
    return data.api.lessonsTable
  }

  return {
    getProgramsFromBackend,
    getLessonsFromBackend,
  }
}
