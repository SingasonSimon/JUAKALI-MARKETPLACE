import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

/**
 * Loading overlay component for specific sections
 */
export default function LoadingOverlay({ 
  isLoading, 
  text = 'Loading...',
  className = '',
  backdrop = true 
}) {
  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`absolute inset-0 z-50 flex items-center justify-center ${
          backdrop ? 'bg-black bg-opacity-50 backdrop-blur-sm' : ''
        } ${className}`}
        role="status"
        aria-label="Loading"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gray-800 rounded-lg p-6 shadow-2xl border border-gray-700"
        >
          <LoadingSpinner size="lg" text={text} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Inline loading component for buttons and small areas
 */
export function InlineLoading({ text = 'Loading...', size = 'sm' }) {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <LoadingSpinner size={size} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}

