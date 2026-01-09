import { describe, it, expect } from 'vitest';
import { cn } from './cn.js';

// clsx + tailwind-merge helper

describe('cn', () => {
  it('merges class names and deduplicates conflicting Tailwind classes', () => {
    const result = cn('p-2', 'p-4', 'text-sm', 'text-base');
    expect(result).toBe('p-4 text-base');
  });

  it('handles conditional values and falsy entries', () => {
    const result = cn('rounded', undefined, null, '', ['block', { hidden: false }]);
    expect(result).toBe('rounded block');
  });
});
