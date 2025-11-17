import React from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Reusable loading spinner component
 */
export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  text = null,
  fullScreen = false 
}) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} ${className}`}
    >
      <ArrowPathIcon className="w-full h-full text-blue-500" />
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          {text && <p className="text-white font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex flex-col items-center gap-2">
        {spinner}
        <p className="text-gray-400 text-sm">{text}</p>
      </div>
    );
  }

  return spinner;
}

