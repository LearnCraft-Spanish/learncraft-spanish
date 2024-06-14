// sum.test.js
import { expect, test } from 'vitest'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})

test('can test', () => {
  expect (test).toBeDefined()
})

test('can divide', () => {
  expect (6/3).toBe(2)
})

export function sum(a, b) {
    return a + b
  }

