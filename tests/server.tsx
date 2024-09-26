// src/mocks/server.js
import { setupServer } from 'msw/node'

// Setup requests interception in Node.js environment
export const server = setupServer()
