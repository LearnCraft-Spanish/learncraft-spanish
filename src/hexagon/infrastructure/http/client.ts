import type { AxiosRequestConfig } from 'axios';
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

export function createHttpClient(
  baseURL: string,
  config?: AxiosRequestConfig,
): HttpClient {
  const client = axios.create({
    baseURL,
    ...config,
  });

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
