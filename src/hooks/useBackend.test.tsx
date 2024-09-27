import { act } from 'react'
import { beforeAll, describe, expect, it } from 'vitest'
import { RenderHookResult, renderHook } from '@testing-library/react'
import MockAuth0Provider from '../mocks/MockAuth0Provider'
import type * as types from '../interfaceDefinitions'
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

      beforeAll(async () => {
        const fetchFunction = hookResult[functionName] as () => Promise<any[]>

        await act(async () => {
          data = await fetchFunction() // Call the function from hookResult
        })
      })

      it('returns something truthy', () => {
        expect(data).toBeDefined()
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

      beforeAll(async () => {
        const fetchFunction = hookResult[functionName] as () => Promise<any[]>

        await act(async () => {
          data = await fetchFunction() // Call the function from hookResult
        })
      })

      it('returns something truthy', () => {
        expect(data).toBeDefined()
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
    functionName: 'getMyExamplesFromBackend',
    requiredFields: ['examples', 'studentExamples'],
  })
})
