import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export function LoadingProvider({ children }) {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingOperations, setLoadingOperations] = useState(new Set());

  /**
   * Set global loading state (full screen overlay)
   */
  const setLoading = useCallback((isLoading, operationId = 'global') => {
    if (operationId === 'global') {
      setGlobalLoading(isLoading);
    } else {
      setLoadingOperations(prev => {
        const next = new Set(prev);
        if (isLoading) {
          next.add(operationId);
        } else {
          next.delete(operationId);
        }
        return next;
      });
    }
  }, []);

  /**
   * Check if a specific operation is loading
   */
  const isLoading = useCallback((operationId = 'global') => {
    if (operationId === 'global') {
      return globalLoading || loadingOperations.size > 0;
    }
    return loadingOperations.has(operationId);
  }, [globalLoading, loadingOperations]);

  /**
   * Execute an async function with loading state
   */
  const withLoading = useCallback(async (asyncFn, operationId = 'global') => {
    try {
      setLoading(true, operationId);
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(false, operationId);
    }
  }, [setLoading]);

  /**
   * Clear all loading states
   */
  const clearLoading = useCallback(() => {
    setGlobalLoading(false);
    setLoadingOperations(new Set());
  }, []);

  const value = {
    globalLoading,
    isLoading,
    setLoading,
    withLoading,
    clearLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <GlobalLoadingOverlay isLoading={globalLoading || loadingOperations.size > 0} />
    </LoadingContext.Provider>
  );
}

/**
 * Global loading overlay component
 */
function GlobalLoadingOverlay({ isLoading }) {
  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center"
        role="status"
        aria-label="Loading"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700 flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <ArrowPathIcon className="w-12 h-12 text-blue-500" />
          </motion.div>
          <p className="text-white font-medium">Loading...</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

