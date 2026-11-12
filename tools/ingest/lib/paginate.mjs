/**
 * Yields every page for one request. BALLDONTLIE uses cursors: the next
 * page's cursor is in meta.next_cursor, and it is absent on the last page.
 * A page that is not a 200 ends the loop, and is still yielded so it is saved.
 */
export async function* fetchAllPages(client, path, params = {}) {
  let cursor;
  for (;;) {
    const page = await client.get(path, cursor === undefined ? params : { ...params, cursor });
    yield page;
    const next = page.status === 200 ? page.body?.meta?.next_cursor : undefined;
    if (next === undefined || next === null) return;
    cursor = next;
  }
}
