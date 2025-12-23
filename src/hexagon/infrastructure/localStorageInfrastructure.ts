import type { LocalStoragePort } from '@application/ports/localStoragePort';

export function createLocalStorageInfrastructure(): LocalStoragePort {
  return {
    getItem: <T>(key: string) =>
      JSON.parse(localStorage.getItem(key) ?? 'null') as T | null,
    setItem: <T>(key: string, value: T) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key: string) => localStorage.removeItem(key),
  };
}
