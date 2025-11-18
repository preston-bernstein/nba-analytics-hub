import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useBoolean } from './useBoolean';

describe('useBoolean', () => {
  it('should use initial value', () => {
    const { result } = renderHook(() => useBoolean(true));
    expect(result.current.value).toBe(true);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.toggle();
    });

    expect(result.current.value).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.value).toBe(false);
  });

  it('should turn value on and off', () => {
    const { result } = renderHook(() => useBoolean());

    act(() => {
      result.current.on();
    });
    expect(result.current.value).toBe(true);

    act(() => {
      result.current.off();
    });
    expect(result.current.value).toBe(false);
  });
});
