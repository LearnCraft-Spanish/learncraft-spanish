import Providers from '@composition/providers/Providers';
import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Tokens must evaluate before App.css so :root exists before first paint.
// Layer order is reserved in index.html; this import order is for load timing.
/* eslint-disable perfectionist/sort-imports */
import '@interface/styles/tokens.css';
import './index.css';
import App from './App';
/* eslint-enable perfectionist/sort-imports */

// error reload key prevents infinite reloads if reload doesnt fix the error
const CHUNK_ERROR_RELOAD_KEY = 'chunk_load_error_reloaded';
window.addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY)) return;
  sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, '1');
  window.location.reload();
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
const root = ReactDOM.createRoot(rootElement);

// Move QueryClient outside BrowserRouter and Providers
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
      {/* Provide the QueryClient at the highest level */}
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Providers>
            <App />
          </Providers>
        </BrowserRouter>
        {/* On by default; set VITE_QUERY_DEVTOOLS=false to get the floating
            button out of the way when checking a mobile layout. */}
        {import.meta.env.VITE_QUERY_DEVTOOLS !== 'false' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
