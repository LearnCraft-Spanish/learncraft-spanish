import { http, HttpResponse } from 'msw';
import data from '../data/mockBackendData.json';

const api = data.api;

export const handlers = [
  http.get('/api/public/programs', () => {
    return HttpResponse.json(api.programsTable);
  }),
    http.get('/api/public/lessons', () => {
        return HttpResponse.json(api.lessonsTable);
    }),
];