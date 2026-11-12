import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** For tests. Each spec starts and stops it. */
export const server = setupServer(...handlers);
