import { BoundedIdSet } from './boundedIdSet.js';

describe('BoundedIdSet', () => {
  it('remembers ids', () => {
    const set = new BoundedIdSet(3);
    set.add('a');
    expect(set.has('a')).toBe(true);
    expect(set.has('b')).toBe(false);
  });

  it('drops the oldest id when full', () => {
    const set = new BoundedIdSet(2);
    set.add('a');
    set.add('b');
    set.add('c');
    expect(set.has('a')).toBe(false);
    expect(set.has('b')).toBe(true);
    expect(set.has('c')).toBe(true);
    expect(set.size).toBe(2);
  });

  it('refreshes an id that is seen again', () => {
    const set = new BoundedIdSet(2);
    set.add('a');
    set.add('b');
    set.add('a');
    set.add('c');
    expect(set.has('a')).toBe(true);
    expect(set.has('b')).toBe(false);
  });

  it('rejects a bad size', () => {
    expect(() => new BoundedIdSet(0)).toThrow(/positive integer/);
  });
});
