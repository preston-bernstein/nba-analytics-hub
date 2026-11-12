interface MockEnv {
  VITE_USE_MOCKS?: string;
  PROD?: boolean;
}

/** Starts the mock service worker when VITE_USE_MOCKS is true. It never starts in a production build. */
export async function enableMocking(env: MockEnv = import.meta.env): Promise<void> {
  if (env.PROD || env.VITE_USE_MOCKS !== 'true') return;
  const { worker } = await import('./browser');
  // Requests with no handler, such as the live game stream, go to the network as usual.
  await worker.start({ onUnhandledRequest: 'bypass' });
}
