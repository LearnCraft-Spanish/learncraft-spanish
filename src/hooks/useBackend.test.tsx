import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import MockAuth0Provider from '../mocks/MockAuth0Provider'
import { useBackend } from './useBackend'

describe('useBackend Hook', () => {
  let hookResult: ReturnType<typeof useBackend>

  // Initialize the hook before all tests
  beforeAll(() => {
    const { result } = renderHook(() => useBackend(), { wrapper: MockAuth0Provider })
    hookResult = result.current // Store the current hook result once
  })

  it('renders without crashing', async () => {
    expect(hookResult).toBeDefined()
  })

  // Reusable test function for array-returning functions
  async function testArrayFetchFunction({
    functionName,
    expectedLength,
    requiredFields,
  }: {
    functionName: keyof ReturnType<typeof useBackend>
    expectedLength?: number
    requiredFields: string[]
  }) {
    describe(`${String(functionName)} function`, () => {
      let data: any[]

      it('resolves the fetch function and returns truthy data', async () => {
        const fetchFunction = hookResult[functionName] as () => Promise<any[]>

        // Explicitly handle the async call inside the test case
        try {
          await act(async () => {
            data = await fetchFunction()
          })
          expect(data).toBeDefined()
        }
        catch (error) {
          // Fail the test if the promise rejects
          throw new Error(`Failed to fetch data in ${String(functionName)}: ${error}`)
        }
      })

      if (expectedLength !== undefined) {
        it(`returns an array of length ${expectedLength}`, () => {
          expect(data).toHaveLength(expectedLength)
        })
      }

      requiredFields.forEach((field) => {
        it(`has the required field: ${field}`, () => {
          data.forEach((item) => {
            expect(item[field]).toBeDefined()
          })
        })
      })
    })
  }

  // Reusable test function for object-returning functions
  async function testObjectFetchFunction({
    functionName,
    requiredFields,
  }: {
    functionName: keyof ReturnType<typeof useBackend>
    requiredFields: string[]
  }) {
    describe(`${String(functionName)} function`, () => {
      let data: any

      it('resolves the fetch function and returns truthy data', async () => {
        const fetchFunction = hookResult[functionName] as () => Promise<any>

        // Explicitly handle the async call inside the test case
        try {
          await act(async () => {
            data = await fetchFunction()
          })
          expect(data).toBeDefined()
        }
        catch (error) {
          // Fail the test if the promise rejects
          throw new Error(`Failed to fetch data in ${String(functionName)}: ${error}`)
        }
      })

      requiredFields.forEach((field) => {
        it(`has the required field: ${field}`, () => {
          expect(data[field]).toBeDefined()
        })
      })
    })
  }

  testArrayFetchFunction({
    functionName: 'getProgramsFromBackend',
    expectedLength: 4,
    requiredFields: ['recordId', 'name'],
  })

  testArrayFetchFunction({
    functionName: 'getLessonsFromBackend',
    requiredFields: ['recordId', 'lesson'],
  })

  testArrayFetchFunction({
    functionName: 'getVocabFromBackend',
    requiredFields: ['recordId', 'wordIdiom'],
  })

  testArrayFetchFunction({
    functionName: 'getSpellingsFromBackend',
    requiredFields: ['relatedWordIdiom', 'spellingOption'],
  })

  testArrayFetchFunction({
    functionName: 'getVerifiedExamplesFromBackend',
    requiredFields: ['recordId', 'spanishExample', 'englishTranslation'],
  })

  testArrayFetchFunction({
    functionName: 'getLcspQuizzesFromBackend',
    requiredFields: ['recordId', 'quizNickname'],
  })

  testArrayFetchFunction({
    functionName: 'getAllUsersFromBackend',
    requiredFields: ['isAdmin'],
  })

  testObjectFetchFunction({
    functionName: 'getUserDataFromBackend',
    requiredFields: ['recordId', 'emailAddress', 'role'],
  })

  testObjectFetchFunction({
    functionName: 'getMyExamplesFromBackend',
    requiredFields: ['examples', 'studentExamples'],
  })

  describe('createMyStudentExample function', () => {
    it('creates a student example', async () => {
      const response = await hookResult.createMyStudentExample(1)
      expect(response).toBe('1')
    })
    it('returns 0 when creating a student example with bad exampleId', async () => {
      const response = await hookResult.createMyStudentExample(-1)
      expect(response).toBe('0')
    })
  })
  describe('createStudentExample function', () => {
    it('creates a student example', async () => {
      const response = await hookResult.createStudentExample(1, 1)
      expect(response).toBe('1')
    })

    it('returns 0 when creating a student example with bad exampleId', async () => {
      const response = await hookResult.createStudentExample(-1, 1)
      expect(response).toBe('0')
    })
    it ('returns 0 when creating a student example with bad studentId', async () => {
      const response = await hookResult.createStudentExample(1, -1)
      expect(response).toBe('0')
    })
  })
  describe('updateMyStudentExample function', () => {
    it('updates a student example', async () => {
      const response = await hookResult.updateMyStudentExample(1, 2)
      expect(response).toBe('1')
    })
    it('returns 0 when updating a student example with bad updateId', async () => {
      const response = await hookResult.updateMyStudentExample(-1, 2)
      expect(response).toBe('0')
    })
  })
  describe('updateStudentExample function', () => {
    it('updates a student example', async () => {
      const response = await hookResult.updateStudentExample(1, 2)
      expect(response).toBe('1')
    })
    it('returns 0 when updating a student example with bad updateId', async () => {
      const response = await hookResult.updateStudentExample(-1, 2)
      expect(response).toBe('0')
    })
  })

  describe('deleteMyStudentExample function', () => {
    it('deletes a student example', async () => {
      const response = await hookResult.deleteMyStudentExample(1)
      expect(response).toBe('1')
    })
    it('returns 0 when deleting a student example with bad recordId', async () => {
      const response = await hookResult.deleteMyStudentExample(-1)
      expect(response).toBe('0')
    })
  })

  describe('deleteStudentExample function', () => {
    it('deletes a student example', async () => {
      const response = await hookResult.deleteStudentExample(1)
      expect(response).toBe('1')
    })
    it('returns 0 when deleting a student example with bad recordId', async () => {
      const response = await hookResult.deleteStudentExample(-1)
      expect(response).toBe('0')
    })
  })
})
