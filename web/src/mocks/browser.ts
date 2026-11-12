import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** For `serve:web:mocks`, so the app runs with no API. */
export const worker = setupWorker(...handlers);
