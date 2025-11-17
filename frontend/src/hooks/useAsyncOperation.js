import { useState, useCallback } from 'react';
import { useLoading } from '../context/LoadingContext';
import { useToast } from '../context/ToastContext';

/**
 * Hook for handling async operations with loading and error states
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} options - Configuration options
 * @param {string} options.operationId - Unique ID for the operation (for tracking)
 * @param {boolean} options.showGlobalLoading - Show global loading overlay (default: false)
 * @param {boolean} options.showToastOnError - Show toast on error (default: true)
 * @param {boolean} options.showToastOnSuccess - Show toast on success (default: false)
 * @param {string} options.successMessage - Success message for toast
 * @param {string} options.errorMessage - Custom error message
 */
export function useAsyncOperation(asyncFn, options = {}) {
  const {
    operationId = 'operation',
    showGlobalLoading = false,
    showToastOnError = true,
    showToastOnSuccess = false,
    successMessage = null,
    errorMessage = null,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setLoading: setGlobalLoading, withLoading } = useLoading();
  const { showToast } = useToast();

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      if (showGlobalLoading) {
        setGlobalLoading(true, operationId);
      }

      const result = await asyncFn(...args);

      if (showToastOnSuccess && successMessage) {
        showToast(successMessage, 'success');
      }

      return result;
    } catch (err) {
      const errorMsg = errorMessage || err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMsg);

      if (showToastOnError) {
        showToast(errorMsg, 'error');
      }

      throw err;
    } finally {
      setLoading(false);
      if (showGlobalLoading) {
        setGlobalLoading(false, operationId);
      }
    }
  }, [asyncFn, operationId, showGlobalLoading, showToastOnError, showToastOnSuccess, successMessage, errorMessage, setGlobalLoading, showToast]);

  return {
    execute,
    loading,
    error,
  };
}

/**
 * Hook for handling async operations with automatic loading state
 * Wraps the async function with loading management
 */
export function useAsyncWithLoading() {
  const { withLoading } = useLoading();
  const { showToast } = useToast();

  const execute = useCallback(async (
    asyncFn,
    options = {}
  ) => {
    const {
      operationId = 'operation',
      showToastOnError = true,
      showToastOnSuccess = false,
      successMessage = null,
      errorMessage = null,
    } = options;

    try {
      const result = await withLoading(asyncFn, operationId);

      if (showToastOnSuccess && successMessage) {
        showToast(successMessage, 'success');
      }

      return result;
    } catch (err) {
      const errorMsg = errorMessage || err.response?.data?.detail || err.message || 'An error occurred';

      if (showToastOnError) {
        showToast(errorMsg, 'error');
      }

      throw err;
    }
  }, [withLoading, showToast]);

  return { execute };
}

