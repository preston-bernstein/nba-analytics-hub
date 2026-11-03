/**
 * Remembers the most recent `maxSize` ids. When full, the oldest id is
 * dropped. Used to skip redelivered events; the memory is lost on restart.
 */
export class BoundedIdSet {
  private readonly ids = new Set<string>();

  constructor(private readonly maxSize: number) {
    if (!Number.isInteger(maxSize) || maxSize < 1) {
      throw new Error('BoundedIdSet maxSize must be a positive integer');
    }
  }

  get size(): number {
    return this.ids.size;
  }

  has(id: string): boolean {
    return this.ids.has(id);
  }

  add(id: string): void {
    // Delete first so a repeated id moves to the newest position.
    this.ids.delete(id);
    this.ids.add(id);
    if (this.ids.size > this.maxSize) {
      const oldest = this.ids.values().next().value as string;
      this.ids.delete(oldest);
    }
  }
}
