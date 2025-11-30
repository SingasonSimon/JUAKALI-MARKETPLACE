import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props 
}) {
  const baseClasses = 'relative font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg overflow-hidden group';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 active:scale-95',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40 active:scale-95',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 active:scale-95',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 active:scale-95',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-500 shadow-md hover:shadow-lg active:scale-95',
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white active:scale-95',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {/* Shine effect on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.svg 
            className="h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </motion.svg>
        )}
        {children}
      </span>
    </motion.button>
  );
}

