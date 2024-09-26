import { http, HttpResponse } from 'msw';
import data from '../data/mockBackendData.json';

const backendData = data.mockBackendData;

export const handlers = [
  http.get('/api/public/programs', () => {
    return HttpResponse.json(backendData);
  }),
];