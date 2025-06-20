import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { AuthPort } from '../../application/ports/authPort';
import axios from 'axios';

export interface HttpClient {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  patch: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

// Helper function to create a client from an Axios instance
function createClientFromAxiosInstance(client: AxiosInstance): HttpClient {
  return {
    get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      const response = await client.get<T>(url, config);
      return response.data;
    },
    post: async <T>(
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const response = await client.post<T>(url, data, config);
      return response.data;
    },
    put: async <T>(
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const response = await client.put<T>(url, data, config);
      return response.data;
    },
    patch: async <T>(
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const response = await client.patch<T>(url, data, config);
      return response.data;
    },
    delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      const response = await client.delete<T>(url, config);
      return response.data;
    },
  };
}

/**
 * Creates a standard HTTP client.
 * For unauthenticated requests.
 */
export function createHttpClient(
  baseURL: string,
  config?: AxiosRequestConfig,
): HttpClient {
  const client = axios.create({
    baseURL,
    ...config,
  });

  return createClientFromAxiosInstance(client);
}

/**
 * Creates an authenticated HTTP client that automatically
 * includes the Auth0 token in requests.
 */
export function createAuthenticatedHttpClient(
  baseURL: string,
  authPort: AuthPort,
  config?: AxiosRequestConfig,
): HttpClient {
  const client = axios.create({
    baseURL,
    ...config,
  });

  // Add request interceptor to include auth token
  client.interceptors.request.use(async (config) => {
    try {
      const token = await authPort.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  });

  return createClientFromAxiosInstance(client);
}
