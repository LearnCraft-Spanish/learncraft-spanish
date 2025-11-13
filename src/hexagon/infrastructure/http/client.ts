import type { AuthPort } from '@application/ports/authPort';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';

export interface HttpClient {
  get: <T>(
    url: string,
    scopes: string[] | null,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  post: <T>(
    url: string,
    scopes: string[] | null,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  put: <T>(
    url: string,
    scopes: string[] | null,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  patch: <T>(
    url: string,
    scopes: string[] | null,
    data?: unknown,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
  delete: <T>(
    url: string,
    scopes: string[] | null,
    config?: AxiosRequestConfig,
  ) => Promise<T>;
}

// Helper function to create a client from an Axios instance
function createClientFromAxiosInstance(
  client: AxiosInstance,
  authPort: AuthPort,
): HttpClient {
  return {
    get: async <T>(
      url: string,
      scopes: string[] | null,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const token = await authPort.getAccessToken(scopes);
      config = config ?? {};
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      const response = await client.get<T>(url, config);
      return response.data;
    },
    post: async <T>(
      url: string,
      scopes: string[] | null,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const token = await authPort.getAccessToken(scopes);
      config = config ?? {};
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      const response = await client.post<T>(url, data, config);
      return response.data;
    },
    put: async <T>(
      url: string,
      scopes: string[] | null,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const token = await authPort.getAccessToken(scopes);
      config = config ?? {};
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      const response = await client.put<T>(url, data, config);
      return response.data;
    },
    patch: async <T>(
      url: string,
      scopes: string[] | null,
      data?: unknown,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const token = await authPort.getAccessToken(scopes);
      config = config ?? {};
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      const response = await client.patch<T>(url, data, config);
      return response.data;
    },
    delete: async <T>(
      url: string,
      scopes: string[] | null,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const token = await authPort.getAccessToken(scopes);
      config = config ?? {};
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      const response = await client.delete<T>(url, config);
      return response.data;
    },
  };
}

/**
 * Creates a standard HTTP client.
 */
export function createHttpClient(
  baseURL: string,
  authPort: AuthPort,
  config?: AxiosRequestConfig,
): HttpClient {
  const client = axios.create({
    baseURL,
    ...config,
  });

  return createClientFromAxiosInstance(client, authPort);
}
