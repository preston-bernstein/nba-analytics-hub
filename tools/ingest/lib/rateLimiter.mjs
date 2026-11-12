/**
 * Spaces calls evenly: one every 60000 / perMinute ms.
 * `now` and `sleep` can be replaced in tests.
 */
export function createLimiter({
  perMinute,
  now = Date.now,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}) {
  const interval = 60_000 / perMinute;
  let nextAt = 0;
  return {
    async take() {
      const wait = nextAt - now();
      if (wait > 0) await sleep(wait);
      nextAt = Math.max(now(), nextAt) + interval;
    },
  };
}
