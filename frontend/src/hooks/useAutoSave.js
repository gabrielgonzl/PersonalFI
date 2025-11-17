import { useEffect, useRef, useCallback, useState } from 'react';
import { useDebounce } from './useDebounce';

/**
 * useAutoSave Hook
 * Automatically saves data after a debounce period
 *
 * @param {any} data - The data to auto-save
 * @param {function} saveFn - Function to call to save the data (should return a promise)
 * @param {object} options - Configuration options
 * @param {number} options.delay - Debounce delay in milliseconds (default: 2000ms)
 * @param {boolean} options.enabled - Whether auto-save is enabled (default: true)
 * @returns {object} - { isSaving, lastSaved, error, triggerSave }
 *
 * @example
 * const { isSaving, lastSaved } = useAutoSave(
 *   formData,
 *   async (data) => await updateSettings(data),
 *   { delay: 2000 }
 * );
 */
export const useAutoSave = (data, saveFn, options = {}) => {
  const { delay = 2000, enabled = true } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);

  const debouncedData = useDebounce(data, delay);
  const initialRender = useRef(true);
  const previousData = useRef(data);

  // Function to trigger save manually
  const triggerSave = useCallback(async () => {
    if (!saveFn || !enabled) return;

    setIsSaving(true);
    setError(null);

    try {
      await saveFn(data);
      setLastSaved(new Date());
      previousData.current = data;
    } catch (err) {
      console.error('Auto-save error:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [data, saveFn, enabled]);

  // Auto-save effect
  useEffect(() => {
    // Skip first render
    if (initialRender.current) {
      initialRender.current = false;
      previousData.current = debouncedData;
      return;
    }

    // Skip if disabled or no save function
    if (!enabled || !saveFn) return;

    // Check if data actually changed
    const dataChanged = JSON.stringify(previousData.current) !== JSON.stringify(debouncedData);

    if (dataChanged) {
      triggerSave();
    }
  }, [debouncedData, enabled, saveFn, triggerSave]);

  return {
    isSaving,
    lastSaved,
    error,
    triggerSave,
  };
};

export default useAutoSave;
