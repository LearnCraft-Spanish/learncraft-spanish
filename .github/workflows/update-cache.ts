// Load environment variables from .env file if running locally
import fs from 'node:fs';
import path from 'node:path';
import { env, exit } from 'node:process';
import { fileURLToPath } from 'node:url'; // New import to handle __dirname in ES modules
import axios from 'axios';
import dotenv from 'dotenv';

// Simulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file if running locally
if (env.CI !== 'true') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const rootPath = env.ACTION === 'true' ? './' : '../../';

// Define environment variables
const AUTH0_DOMAIN = env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = env.AUTH0_CLIENT_SECRET;
const AUTH0_AUDIENCE = env.AUTH0_AUDIENCE;
const BACKEND_URL = env.BACKEND_URL;
const MOCKDATA_PATH = path.resolve(
  __dirname,
  `${rootPath}mocks/data/serverlike/actualServerData.json`,
);

// Ensure required environment variables are available
if (
  !AUTH0_DOMAIN ||
  !AUTH0_CLIENT_ID ||
  !AUTH0_CLIENT_SECRET ||
  !AUTH0_AUDIENCE
) {
  console.error(
    'Missing required environment variables. Please check your .env file or environment settings.',
  );
  exit(1);
}

// Step 1: Fetch Auth0 token
async function fetchAuthToken() {
  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: AUTH0_AUDIENCE,
      grant_type: 'client_credentials',
    });

    const token = response.data.access_token;
    if (!token) {
      throw new Error('Failed to fetch Auth0 token.');
    }
    /* eslint-disable-next-line no-console */
    console.log('Auth0 token fetched successfully.');
    return token;
  } catch (error) {
    console.error('Error fetching Auth0 token:', error.message);
    exit(1);
  }
}

// Step 2: Fetch mock data
async function fetchMockData(token) {
  try {
    const response = await axios.get(`${BACKEND_URL}/serve-mock-data`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'stream',
    });

    // Ensure the mockdata directory exists
    fs.mkdirSync(path.dirname(MOCKDATA_PATH), { recursive: true });

    // Write the mock data to a file
    const writer = fs.createWriteStream(MOCKDATA_PATH);
    response.data.pipe(writer);

    writer.on('finish', () => {
      /* eslint-disable-next-line no-console */
      console.log('Mock data fetched and saved to target directory.');
    });

    writer.on('error', (error) => {
      console.error('Error writing mock data:', error.message);
      exit(1);
    });
  } catch (error) {
    console.error('Error fetching mock data:', error.message);
    exit(1);
  }
}

// Main function to update cache
(async function updateCache() {
  const token = await fetchAuthToken();
  await fetchMockData(token);
})();
