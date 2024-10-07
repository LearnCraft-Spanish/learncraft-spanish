// src/mocks/server.js
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup requests interception in Node.js environment
export const server = setupServer(...handlers)
