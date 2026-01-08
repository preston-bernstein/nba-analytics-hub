import { socketsAvailable } from './socketSupport.js';

const fallbackDescribe =
  typeof describe === 'function'
    ? describe
    : ((...args: unknown[]) => {
        void args;
        /* no-op when describe is undefined (e.g., during config parse) */
      }) as typeof describe;

export const describeIfSockets =
  socketsAvailable && typeof describe === 'function'
    ? describe
    : typeof describe === 'function'
      ? describe.skip
      : fallbackDescribe;
