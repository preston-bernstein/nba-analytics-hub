/** Runs `fn` over `items` with at most `concurrency` calls at once. Rejects on the first error. */
export async function runPool(items, concurrency, fn) {
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const item = items[next];
      next += 1;
      await fn(item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}
