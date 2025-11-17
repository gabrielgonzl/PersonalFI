import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'changed' });

    // Value should not update immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    vi.advanceTimersByTime(500);

    // Now value should be updated
    await waitFor(() => {
      expect(result.current).toBe('changed');
    });
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    vi.advanceTimersByTime(250);

    rerender({ value: 'third' });
    vi.advanceTimersByTime(250);

    // After 500ms total, value should still be 'first'
    expect(result.current).toBe('first');

    // After another 250ms (750ms total), value should be 'third'
    vi.advanceTimersByTime(250);

    await waitFor(() => {
      expect(result.current).toBe('third');
    });
  });

  it('should respect custom delay', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'changed' });

    vi.advanceTimersByTime(500);
    expect(result.current).toBe('initial');

    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(result.current).toBe('changed');
    });
  });
});
